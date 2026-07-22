import ArticleCard from './ArticleCard';
import type { Article } from '@/lib/aem-client';

// Server-rendered grid of Article cards. This is the SSR/SEO path: the cards
// (and their data-aue attributes) are present in the initial HTML that
// Universal Editor loads.

export interface ArticleGridProps {
  articles: readonly Article[];
  editable: boolean;
}

export default function ArticleGrid({ articles, editable }: ArticleGridProps) {
  if (!articles.length) {
    return <p className="empty">No articles returned from AEM. Check AEM_CF_PREFIX and that the ArticleList query is published.</p>;
  }

  return (
    <div className="grid">
      {articles.map((article, i) => (
        <ArticleCard
          key={article._path ?? article.headline ?? `article-${i}`}
          article={article}
          editable={editable}
        />
      ))}
    </div>
  );
}
