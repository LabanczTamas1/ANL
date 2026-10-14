import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { Button, Badge, Spinner, Alert } from "../../design-system/components";
import { useLanguage } from "../../hooks/useLanguage";
import ArticleRenderer from "../../OuterApp/components/ArticleRenderer";
import { getArticle, type Article } from "../../services/api/articleApi";

const ArticlePreview = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const locale = language === "magyar" ? "hu" : language === "romana" ? "ro" : "en-US";

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getArticle(id)
      .then((res) => active && setArticle(res.data.article))
      .catch(() => active && setError(t("articles.loadError")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, t]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate("/home/articles")}>
          {t("articles.back")}
        </Button>
        <div className="flex items-center gap-3">
          {article && (
            <Badge tone={article.status === "published" ? "success" : "warning"}>
              {t(`articles.status.${article.status}`)}
            </Badge>
          )}
          <Button variant="outline" leftIcon={<FiEdit2 />} onClick={() => navigate(`/home/articles/${id}/edit`)}>
            {t("articles.edit")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : article ? (
        <div className="rounded-3xl border border-line-glass bg-surface-overlay py-12">
          <ArticleRenderer article={article} locale={locale} />
        </div>
      ) : null}
    </div>
  );
};

export default ArticlePreview;
