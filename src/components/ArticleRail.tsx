import { getArticles } from '@/lib/content';

// Articles from Content Fragments, shown as a horizontal rail. The same CFs
// feed the EDS marketing site (the high-school article links there directly).
export default function ArticleRail() {
  const articles = getArticles();
  return (
    <div className="article-rail">
      {articles.map((a) => {
        const external = a.href.startsWith('http');
        return (
          <a
            key={a.id}
            href={a.href}
            className="article-card"
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            <div
              className="article-media"
              style={{ backgroundImage: `url(${a.image})` }}
              role="img"
              aria-label={a.title}
            />
            <div className="article-body">
              <span className="article-cat">{a.category}</span>
              <h3 className="article-title">{a.title}</h3>
              <span className="article-meta">{a.readMinutes} min read</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
