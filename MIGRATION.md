# ANL — VPS Migration Plan (Hetzner → Any Provider)

> Scope: moving the **backend + data services** (Postgres, Redis, Seq, Caddy) from the
> current Hetzner Cloud VPS to any other provider (DigitalOcean, Linode/Akamai,
> Vultr, AWS Lightsail/EC2, GCP, OVH, Contabo, a different Hetzner box, etc.).
>
> The **frontend is out of scope** — it runs on Cloudflare Pages and is not tied to
> the VPS. Nothing about the frontend needs to change except (optionally) DNS.
>
> This is a **provider-agnostic** runbook. The stack is 100% Docker Compose + a few
> host-level pieces (Caddy, UFW, an fstab-mounted data volume), so it ports cleanly.

---

## 0. TL;DR — what actually has to move

| Thing | Where it lives now | How it moves |
|-------|--------------------|--------------|
| App code | git repo at `/opt/anl` | `git clone` on the new box (already in GitHub) |
| Backend secrets | `/opt/anl/backend/.env.docker` (gitignored) | **copy the file** (the only non-git state that matters) |
| Postgres data | bind mount `/mnt/data/postgres` | `pg_dump` → restore (preferred) or volume copy |
| Redis data | named volume `backend_redis_data` | optional (cache) — usually rebuildable |
| Seq logs | named volume `backend_seq_data` | optional (historical logs only) |
| Reverse proxy | `/etc/caddy/Caddyfile` + certs | reinstall Caddy, copy Caddyfile |
| Firewall | UFW (22/80/443) | re-apply a few rules |
| DNS | `api.*` / `seq.*` → `116.202.105.64` | repoint A records to new IP |
| CI/CD deploy | GitHub Actions secrets (`VPS_HOST/USER/SSH_KEY`) | update 3 secrets |

**The genuinely irreplaceable state is just two things: `.env.docker` and the Postgres database.** Everything else is code (in git) or rebuildable.

---

## 1. Pre-migration checklist (do before touching anything)

- [ ] Pick the new provider and size it: **≥ 2 vCPU / 4 GB RAM / ≥ 40 GB disk** (matches current), Ubuntu 24.04 LTS. If you want the same "separate data volume" model, attach a block volume (≥ 10 GB).
- [ ] Confirm you control **DNS** for `anladsandleads.com` (Cloudflare) and can edit the `api` and `seq` A records.
- [ ] Confirm the **TLS certificate** story. Current Caddy uses an explicit cert at `/etc/caddy/certs/anladsandleads.pem` + `.key`. On the new box you can either (a) copy those cert files, or (b) let Caddy auto-provision via Let's Encrypt (simpler — recommended, see §6).
- [ ] Locate the **GitHub Actions SSH deploy key** (repo secret `VPS_SSH_KEY`). You'll either reuse it or generate a new keypair for the new host.
- [ ] Note current **third-party allow-lists** that reference the server IP:
  - Google OAuth / Facebook redirect URIs are domain-based (`https://api.anladsandleads.com/...`) → **no change** as long as the domain stays the same.
  - SMTP provider (Gmail) — no IP allow-list normally.
  - Any Postgres/Redis IP firewall rules (none currently — internal only).
- [ ] Schedule a **short maintenance window** (realistically 10–20 min of API downtime for the DB cutover). The frontend keeps serving; only API calls fail during cutover.
- [ ] Take a **fresh backup right before** (see §3).

---

## 2. Provision the new server (parity build)

On the **new VPS** (as a sudo user; the current box uses user `tamas`):

```bash
# 2.1 Base packages
sudo apt update && sudo apt -y upgrade
sudo apt -y install ca-certificates curl git ufw

# 2.2 Docker + Compose plugin (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"     # log out/in to take effect
docker compose version              # verify v2 plugin present

# 2.3 (Optional) attach + mount a data volume, mirroring /mnt/data
#     Replace /dev/sdb with the new provider's volume device.
sudo mkfs.ext4 -F /dev/sdb          # ONLY if it's a fresh, empty volume
sudo mkdir -p /mnt/data
UUID=$(sudo blkid -s UUID -o value /dev/sdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
sudo mount -a
sudo mkdir -p /mnt/data/postgres /mnt/data/docker

# 2.4 (Optional but recommended) point Docker's data-root at the volume,
#     matching the current setup so images/volumes live on /mnt/data.
echo '{ "data-root": "/mnt/data/docker" }' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

> If your new provider has **no separate volume**, skip the volume steps and just use
> the root disk. Then change the compose bind mount from `/mnt/data/postgres` to a
> local path (e.g. `./pgdata`) and drop the `mountpoint -q "$DATA_VOL"` guard in
> `deploy.sh`. Everything else is identical.

```bash
# 2.5 Firewall — same as current (only SSH + HTTP/S)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

```bash
# 2.6 Clone the repo to the same path used by deploy.sh
sudo mkdir -p /opt/anl && sudo chown "$USER":"$USER" /opt/anl
git clone https://github.com/LabanczTamas1/ANL.git /opt/anl
cd /opt/anl && git checkout main
```

---

## 3. Back up the current (Hetzner) data

Run these **on the old box** (`ssh hetzner`). Keep the API up while you do this.

```bash
# 3.1 Logical Postgres backup (preferred, portable across PG versions)
cd /opt/anl/backend
TS=$(date +%Y%m%d%H%M%S)
docker compose exec -T postgres pg_dump -U postgres -Fc anl > /mnt/data/anl-$TS.dump
ls -lh /mnt/data/anl-$TS.dump

# 3.2 The secrets file (the ONE piece of non-git state)
cp /opt/anl/backend/.env.docker /mnt/data/env.docker.$TS.bak

# 3.3 (Optional) Redis + Seq snapshots if you want to preserve them
docker compose exec -T redis redis-cli SAVE
```

Then pull the artifacts to your laptop (staging point):

```bash
# On your local machine
scp hetzner:/mnt/data/anl-*.dump           ./migration/
scp hetzner:/opt/anl/backend/.env.docker   ./migration/env.docker
# (optionally the redis dump.rdb / seq volume too)
```

> ⚠️ Treat `env.docker` and the DB dump as **secrets**. Store in an encrypted
> location, delete the local staging copies after the migration.

---

## 4. Restore state onto the new server

```bash
# 4.1 Put secrets in place (path must match docker-compose env_file)
scp ./migration/env.docker  NEWHOST:/opt/anl/backend/.env.docker
ssh NEWHOST 'chmod 600 /opt/anl/backend/.env.docker'
```

**Important env edits on the new box** — review `.env.docker` and update anything
that referenced the old host/IP (most values are domain-based and need no change):

- `BACKEND_URL` / `FRONTEND_URL` / `ALLOWED_ORIGINS` → keep the **same domains**
  (`https://api.anladsandleads.com`, frontend origin). No change unless you also
  change domains.
- `DATABASE_URL` / `REDIS_URL` / `SEQ_URL` → unchanged (they use Docker service
  names `postgres` / `redis` / `seq`, injected by compose).
- Confirm `CSRF_SECRET`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `SESSION_SECRET`
  are present (they were added over time — the migration must carry them so
  existing sessions/tokens remain valid). **Copying the file wholesale handles this.**

```bash
# 4.2 Bring up the data services first (no backend yet), then restore the DB
ssh NEWHOST
cd /opt/anl/backend
docker compose up -d postgres redis seq
# wait for postgres healthy
until docker compose exec -T postgres pg_isready -U postgres; do sleep 2; done

# 4.3 Restore the dump into a clean DB
scp ./migration/anl-*.dump NEWHOST:/tmp/anl.dump   # (from laptop)
docker compose exec -T postgres dropdb   -U postgres --if-exists anl
docker compose exec -T postgres createdb -U postgres anl
docker compose exec -T postgres pg_restore -U postgres -d anl --no-owner /tmp/anl.dump
# sanity: row counts on key tables
docker compose exec -T postgres psql -U postgres -d anl -c "\dt"
```

> **Alternative (physical copy instead of dump/restore):** stop Postgres on both
> boxes and `rsync -a /mnt/data/postgres/` to the new `/mnt/data/postgres/`. Only
> valid if **both run the same Postgres major version** (currently `postgres:15`).
> The `pg_dump/pg_restore` route in 4.1–4.3 is safer and version-independent.

---

## 5. Bring up the full stack on the new server

```bash
cd /opt/anl/backend
docker compose build --no-cache backend
docker compose up -d --remove-orphans

# Health check locally before touching DNS
curl -sf http://localhost:3001/health && echo " OK"
docker compose ps
```

At this point the new box is fully running but **still on its own IP** — production
traffic is untouched. Do end-to-end smoke tests against the raw IP or a temporary
hostname (see §7) before cutover.

---

## 6. Reverse proxy (Caddy) on the new server

Install Caddy as a system service and reuse the config:

```bash
sudo apt -y install debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt -y install caddy
```

Then copy `/etc/caddy/Caddyfile` from the old box. Two TLS options:

- **Recommended — Let Caddy auto-provision Let's Encrypt certs.** Simplify each
  vhost to rely on Caddy's automatic HTTPS (remove the explicit `tls <cert> <key>`
  directive). Requires DNS to already point at the new box, so do this **after**
  the DNS cutover in §7, or use the DNS-01 challenge to provision early.
- **Keep the explicit cert.** Copy `/etc/caddy/certs/anladsandleads.pem` + `.key`
  to the new box and keep the `tls` directive. No DNS dependency, but you must
  manage renewals yourself.

```bash
sudo systemctl enable --now caddy
sudo systemctl reload caddy
```

Caddy must proxy `api.anladsandleads.com → localhost:3001` and
`seq.anladsandleads.com → localhost:8081`, adding the same security headers
(HSTS, `X-Frame-Options: DENY`, etc.) as documented in INFRASTRUCTURE.md §3.

---

## 7. DNS cutover (the actual switch)

1. **Lower TTL in advance.** A few hours before, set the `api` and `seq` A records
   to a short TTL (e.g. 60s) in Cloudflare so the switch propagates fast.
2. **Freeze writes (brief).** To avoid split-brain (writes landing on the old DB
   after you've dumped it), take a **final incremental dump** right before flipping,
   or put the API into a short read-only/maintenance state. For a low-traffic app
   the simplest path is: final `pg_dump` on old → restore delta on new → flip DNS.
3. **Repoint records:** in Cloudflare, change the `api` and `seq` A records from
   `116.202.105.64` to the **new server IP**. Keep them proxied (orange cloud) as
   today.
4. **Verify:**
   ```bash
   curl -sf https://api.anladsandleads.com/health
   # exercise a login + an authenticated write from the real frontend
   ```
5. Watch Seq / `docker compose logs -f backend` on the new box for errors.

> Because OAuth redirect URIs and CORS are **domain-based**, no third-party console
> changes are needed as long as the domain is unchanged.

---

## 8. Update CI/CD (GitHub Actions)

The deploy workflow SSHes into the VPS using repo secrets. After the box changes:

- Update repo **Secrets → Actions**:
  - `VPS_HOST` → new server IP/hostname
  - `VPS_USER` → new sudo user (keep `tamas` for zero script changes, or update)
  - `VPS_SSH_KEY` → private key whose public half is in the new box's
    `~/.ssh/authorized_keys`
- Ensure `/opt/anl/scripts/deploy.sh` assumptions still hold on the new box:
  - repo at `/opt/anl`, compose at `/opt/anl/backend`
  - `/mnt/data` mounted (or the guard removed if you didn't use a volume)
- Trigger a no-op deploy (push a trivial commit or re-run the workflow) and confirm
  the health-gated deploy succeeds end-to-end.

Also update your **local SSH config** alias (currently `ssh hetzner`) to point at the
new host, or add a new alias.

---

## 9. Post-migration hardening & cleanup

- [ ] **Rotate secrets** that were transported over the wire: `JWT_SECRET`,
      `REFRESH_TOKEN_SECRET`, `SESSION_SECRET`, `CSRF_SECRET`, DB password. (Rotating
      JWT/refresh/session secrets will log everyone out — do it during the window if
      desired.) Address the known findings from INFRASTRUCTURE.md §8 while you're here:
  - Replace default `POSTGRES_USER/PASSWORD=postgres` with strong creds from `.env.docker`.
  - Move `SEQ_FIRSTRUN_ADMINPASSWORD` out of compose into `.env.docker` and rotate.
- [ ] **Automate backups** on the new box (a gap noted in §8): a nightly cron
      `pg_dump -Fc` shipped off-box (e.g. to object storage / another region).
- [ ] Confirm `/mnt/data` **fstab** entry exists and remounts on reboot (`sudo reboot`
      then verify containers come back).
- [ ] **Decommission Hetzner** only after ≥ a few days of stable operation:
  - Keep the old box **powered off but retained** for a rollback window.
  - Take one final full backup, then delete the server + volume.
  - Remove the old IP from any lingering allow-lists/monitoring.

---

## 10. Rollback plan

If the new box misbehaves after cutover:

1. **DNS revert:** repoint `api.*` / `seq.*` A records back to `116.202.105.64`.
   With the pre-lowered TTL this recovers in ~1 minute.
2. The old box is untouched and still healthy (you only ever *read* from it during
   backup), so it resumes serving immediately.
3. Investigate the new box out-of-band, fix, and re-attempt the cutover.

> This is why you **don't delete Hetzner** until the new box has proven itself.

---

## 11. Time & risk summary

| Phase | Downtime | Risk |
|-------|----------|------|
| Provision + parity build (§2) | none | low |
| Backup (§3) | none | low |
| Restore + bring-up (§4–6) | none (new box isolated) | low |
| DNS cutover + final DB sync (§7) | ~10–20 min API | medium (mitigated by rollback) |
| CI/CD + hardening (§8–9) | none | low |

**Total effort:** roughly half a day of hands-on work; the only user-visible impact
is a brief API blip during the DNS/DB cutover. The frontend (Cloudflare Pages) stays
up throughout.

---

## Appendix A — Portability notes per provider

- **DigitalOcean / Vultr / Linode:** near-identical to Hetzner (Ubuntu + block volume
  + floating/reserved IP). Use a **reserved/floating IP** so a future move needs no
  DNS change.
- **AWS Lightsail:** simplest AWS option; attach a block storage disk for `/mnt/data`,
  use a static IP.
- **AWS EC2 / GCP CE:** works, but consider using **managed Postgres (RDS / Cloud SQL)**
  and **managed Redis (ElastiCache / Memorystore)** instead of containers — then drop
  the `postgres`/`redis` services from compose and point `DATABASE_URL`/`REDIS_URL` at
  the managed endpoints. Bigger change, better durability.
- **Contabo / OVH (budget):** fine for this workload; verify volume/fstab semantics and
  that Docker's convenience script supports the OS image.

## Appendix B — "Same box, new provider" fast path (no volume)

If the target has a single disk (no separate volume), the only deltas vs. this plan:
1. Skip §2.3–§2.4 (volume + docker data-root).
2. In `backend/docker-compose.yml`, change the Postgres bind mount
   `/mnt/data/postgres:/var/lib/postgresql/data` → `./pgdata:/var/lib/postgresql/data`.
3. In `scripts/deploy.sh`, remove the `mountpoint -q "$DATA_VOL"` guard block.
Everything else (secrets, dump/restore, Caddy, DNS, CI) is unchanged.
