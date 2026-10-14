import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiUploadCloud,
  FiArchive,
} from "react-icons/fi";
import {
  Button,
  Card,
  Badge,
  Heading,
  Text,
  Spinner,
  Alert,
  Input,
} from "../../design-system/components";
import { useLanguage } from "../../hooks/useLanguage";
import {
  getAllArticles,
  setArticleStatus,
  deleteArticle,
  type Article,
} from "../../services/api/articleApi";
import ConfirmDialog from "./components/ConfirmDialog";

const SIZE_LABEL: Record<string, string> = {
  hero: "Hero",
  large: "Large",
  medium: "Medium",
  small: "Small",
};

const ArticlesManager = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Article | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getAllArticles()
      .then((res) => setArticles(res.data.articles ?? []))
      .catch(() => setError(t("articles.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (article: Article) => {
    setBusyId(article.id);
    const next = article.status === "published" ? "draft" : "published";
    try {
      const res = await setArticleStatus(article.id, next);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? res.data.article : a)),
      );
    } catch {
      setError(t("articles.statusError"));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setBusyId(id);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError(t("articles.deleteError"));
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  const filtered = articles.filter((a) => {
    const matchesFilter = filter === "all" || a.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading level={1}>{t("articles.managerTitle")}</Heading>
          <Text tone="muted" className="mt-1">
            {t("articles.managerSubtitle")}
          </Text>
        </div>
        <Button leftIcon={<FiPlus />} onClick={() => navigate("/home/articles/new")}>
          {t("articles.newArticle")}
        </Button>
      </div>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-brand text-white"
                  : "bg-black/[0.04] text-content-subtle dark:bg-white/5 dark:text-content-subtle-inverse hover:bg-black/[0.08] dark:hover:bg-white/10"
              }`}
            >
              {t(`articles.filter.${f}`)} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="sm:w-64">
          <Input
            placeholder={t("articles.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Text tone="muted">{t("articles.empty")}</Text>
          <div className="mt-4">
            <Button variant="outline" leftIcon={<FiPlus />} onClick={() => navigate("/home/articles/new")}>
              {t("articles.newArticle")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((article) => (
            <Card key={article.id} padding="none" className="overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                {/* Thumb */}
                <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-surface-dark sm:w-32">
                  {article.coverImageUrl ? (
                    <img
                      src={article.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/30 to-surface-elevated text-content-muted">
                      <FiArchive />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone={article.status === "published" ? "success" : "warning"}>
                      {t(`articles.status.${article.status}`)}
                    </Badge>
                    <Badge tone="neutral">{SIZE_LABEL[article.featuredSize]}</Badge>
                    {article.category && <Badge tone="brand">{article.category}</Badge>}
                  </div>
                  <div className="truncate text-base font-semibold text-content dark:text-content-inverse">
                    {article.title || t("articles.untitled")}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-content-muted">
                    {article.excerpt || "—"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiEye />}
                    onClick={() => navigate(`/home/articles/${article.id}/preview`)}
                  >
                    {t("articles.preview")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiEdit2 />}
                    onClick={() => navigate(`/home/articles/${article.id}/edit`)}
                  >
                    {t("articles.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant={article.status === "published" ? "secondary" : "primary"}
                    leftIcon={article.status === "published" ? <FiArchive /> : <FiUploadCloud />}
                    loading={busyId === article.id}
                    onClick={() => toggleStatus(article)}
                  >
                    {article.status === "published" ? t("articles.unpublish") : t("articles.publish")}
                  </Button>
                  <Button
                    size="sm"
                    variant="dangerSoft"
                    leftIcon={<FiTrash2 />}
                    onClick={() => setToDelete(article)}
                  >
                    {t("articles.delete")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t("articles.deleteConfirmTitle")}
        message={t("articles.deleteConfirmBody", { title: toDelete?.title || "" })}
        confirmLabel={t("articles.delete")}
        cancelLabel={t("articles.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default ArticlesManager;
