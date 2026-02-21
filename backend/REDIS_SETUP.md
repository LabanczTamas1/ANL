# Local Redis Setup Instructions

## Option 1: Use Docker (Recommended if Docker is installed)
```bash
docker compose up
```

This will start:
- Redis on localhost:6379
- Node backend on localhost:3001

## Option 2: Install Redis Locally on Windows

### Using Chocolatey:
```bash
choco install redis
redis-server
```

### Using Windows Subsystem for Linux (WSL):
```bash
wsl
sudo apt-get install redis-server
redis-server
```

### Using Redis for Windows (memurai):
Download from: https://github.com/microsoftarchive/redis/releases
Or use: https://memurai.redis.com/

## Option 3: Connect to Local Redis via WSL
If you have WSL installed with Redis:
```bash
# In PowerShell
wsl redis-cli ping  # Test connection
```

## Environment Variables
Make sure your `.env` file has:
```
REDIS_URL=redis://localhost:6379
```

For Docker, this is automatically set to `redis://redis:6379`

## Testing the Connection
```bash
# From Node
node
> const redis = require("redis");
> const client = redis.createClient({ url: "redis://localhost:6379" });
> await client.connect();
> console.log(await client.ping());
```
