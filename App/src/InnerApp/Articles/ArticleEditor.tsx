import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEdit2, FiSave } from "react-icons/fi";
import {
  Button,
  Card,
  Input,
  Select,
  Label,
  Heading,
  Text,
  Spinner,
  Alert,
} from "../../design-system/components";
import { useLanguage } from "../../hooks/useLanguage";
import BlockEditor from "./components/BlockEditor";
import ArticleRenderer from "../../OuterApp/components/ArticleRenderer";
import {
  getArticle,
  createArticle,
  updateArticle,
  type Article,
  type ArticleBlock,
  type ArticleInput,
  type ArticleSize,
  type ArticleStatus,
} from "../../services/api/articleApi";

const inputClass =
  "w-full rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-dark px-3 py-2 text-sm text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors";

const safePreview = (url: string): string => {
  const t = (url || "").trim();
  if (t.startsWith("/")) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return "";
};

const ArticleEditor = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const locale = language === "magyar" ? "hu" : language === "romana" ? "ro" : "en-US";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featuredSize, setFeaturedSize] = useState<ArticleSize>("medium");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [content, setContent] = useState<ArticleBlock[]>([]);
  const [authorName, setAuthorName] = useState("ANL");
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!id) return;
    let active = true;
    getArticle(id)
      .then((res) => {
        if (!active) return;
        const a = res.data.article;
        setTitle(a.title);
        setSlug(a.slug);
        setExcerpt(a.excerpt);
        setCoverImageUrl(a.coverImageUrl);
        setCategory(a.category);
        setTags(a.tags.join(", "));
        setFeaturedSize(a.featuredSize);
        setStatus(a.status);
        setContent(a.content);
        setAuthorName(a.authorName || "ANL");
        setCreatedAt(a.createdAt);
      })
      .catch(() => setError(t("articles.loadError")))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, t]);

  const buildPayload = (): ArticleInput => ({
    title: title.trim(),
    slug: slug.trim() || undefined,
    excerpt,
    coverImageUrl,
    content,
    status,
    featuredSize,
    category,
    tags: tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  const previewArticle: Article = useMemo(
    () => ({
      id: id ?? "preview",
      title: title || t("articles.untitled"),
      slug,
      excerpt,
      coverImageUrl,
      content,
      authorId: null,
      authorName,
      status,
      featuredSize,
      category,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      viewCount: 0,
      publishedAt: status === "published" ? createdAt : null,
      createdAt,
      updatedAt: createdAt,
    }),
    [id, title, slug, excerpt, coverImageUrl, content, authorName, status, featuredSize, category, tags, createdAt, t],
  );

  const save = async () => {
    if (!title.trim()) {
      setError(t("articles.titleRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await updateArticle(id, buildPayload());
        setSavedAt(Date.now());
      } else {
        const res = await createArticle(buildPayload());
        // Continue editing the freshly created article.
        navigate(`/home/articles/${res.data.article.id}/edit`, { replace: true });
        setSavedAt(Date.now());
      }
    } catch {
      setError(t("articles.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    setStatus("published");
    // Use a direct payload so we don't depend on the async state update above.
    if (!title.trim()) {
      setError(t("articles.titleRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { ...buildPayload(), status: "published" as ArticleStatus };
    try {
      if (isEdit && id) {
        await updateArticle(id, payload);
      } else {
        const res = await createArticle(payload);
        navigate(`/home/articles/${res.data.article.id}/edit`, { replace: true });
      }
      setSavedAt(Date.now());
    } catch {
      setError(t("articles.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate("/home/articles")}>
            {t("articles.back")}
          </Button>
          <Heading level={2}>{isEdit ? t("articles.editTitle") : t("articles.newTitle")}</Heading>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <Text tone="muted" size="sm" className="mr-1">
              {t("articles.saved")}
            </Text>
          )}
          <Button
            variant="outline"
            leftIcon={previewMode ? <FiEdit2 /> : <FiEye />}
            onClick={() => setPreviewMode((p) => !p)}
          >
            {previewMode ? t("articles.editMode") : t("articles.previewMode")}
          </Button>
          <Button variant="secondary" leftIcon={<FiSave />} loading={saving} onClick={save}>
            {t("articles.save")}
          </Button>
          <Button loading={saving} onClick={saveAndPublish}>
            {t("articles.publish")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      {previewMode ? (
        <div className="rounded-3xl border border-line-glass bg-surface-overlay py-12">
          <ArticleRenderer article={previewArticle} locale={locale} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <Label htmlFor="article-title">{t("articles.fieldTitle")}</Label>
              <input
                id="article-title"
                className={`${inputClass} mt-1.5 text-lg font-semibold`}
                placeholder={t("articles.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Label htmlFor="article-excerpt" className="mt-4 block">
                {t("articles.fieldExcerpt")}
              </Label>
              <textarea
                id="article-excerpt"
                className={`${inputClass} mt-1.5 min-h-[72px] resize-y`}
                placeholder={t("articles.excerptPlaceholder")}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </Card>

            <Card>
              <Heading level={4} className="mb-4">
                {t("articles.bodyTitle")}
              </Heading>
              <BlockEditor blocks={content} onChange={setContent} />
            </Card>
          </div>

          {/* Settings column */}
          <div className="flex flex-col gap-6">
            <Card>
              <Heading level={4} className="mb-4">
                {t("articles.publishSettings")}
              </Heading>

              <Label htmlFor="article-status">{t("articles.fieldStatus")}</Label>
              <Select
                id="article-status"
                className="mt-1.5 w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              >
                <option value="draft">{t("articles.status.draft")}</option>
                <option value="published">{t("articles.status.published")}</option>
              </Select>

              <Label htmlFor="article-size" className="mt-4 block">
                {t("articles.fieldSize")}
              </Label>
              <Select
                id="article-size"
                className="mt-1.5 w-full"
                value={featuredSize}
                onChange={(e) => setFeaturedSize(e.target.value as ArticleSize)}
              >
                <option value="hero">{t("articles.size.hero")}</option>
                <option value="large">{t("articles.size.large")}</option>
                <option value="medium">{t("articles.size.medium")}</option>
                <option value="small">{t("articles.size.small")}</option>
              </Select>
              <Text tone="muted" size="xs" className="mt-1.5">
                {t("articles.sizeHint")}
              </Text>
            </Card>

            <Card>
              <Heading level={4} className="mb-4">
                {t("articles.coverTitle")}
              </Heading>
              <Label htmlFor="article-cover">{t("articles.fieldCover")}</Label>
              <Input
                id="article-cover"
                containerClassName="mt-1.5"
                placeholder="https://…"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
              {safePreview(coverImageUrl) && (
                <img
                  src={safePreview(coverImageUrl)}
                  alt=""
                  className="mt-3 aspect-[16/9] w-full rounded-lg border border-line dark:border-line-dark object-cover"
                />
              )}
            </Card>

            <Card>
              <Heading level={4} className="mb-4">
                {t("articles.metaTitle")}
              </Heading>
              <Label htmlFor="article-category">{t("articles.fieldCategory")}</Label>
              <Input
                id="article-category"
                containerClassName="mt-1.5"
                placeholder={t("articles.categoryPlaceholder")}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <Label htmlFor="article-tags" className="mt-4 block">
                {t("articles.fieldTags")}
              </Label>
              <Input
                id="article-tags"
                containerClassName="mt-1.5"
                placeholder={t("articles.tagsPlaceholder")}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              <Label htmlFor="article-slug" className="mt-4 block">
                {t("articles.fieldSlug")}
              </Label>
              <Input
                id="article-slug"
                containerClassName="mt-1.5"
                placeholder={t("articles.slugPlaceholder")}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <Text tone="muted" size="xs" className="mt-1.5">
                {t("articles.slugHint")}
              </Text>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
