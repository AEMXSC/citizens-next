import { imageUrl, type Article } from '@/lib/aem-client';

// "Insights & guidance" — Article Content Fragments from AEM via GraphQL, the
// same query the NYL app and the Citizens EDS content-fragment block use. UE
// instrumentation kept so each card is editable in place.
export default function InsightsGrid({ articles }: { articles: readonly Article[] }) {
  if (!articles.length) {
    return (
      <p className="insights-empty">
        No articles returned. Publish the Article fragments and the ArticleList query in AEM.
      </p>
    );
  }

  return (
    <div className="insights-grid">
      {articles.map((a) => {
        const img = imageUrl(a.heroImage);
        const resource = `urn:aemconnection:${a._path ?? ''}/jcr:content/data/master`;
        return (
          <article
            key={a._path ?? a.headline}
            className="insight-card"
            data-aue-resource={resource}
            data-aue-type="component"
            data-aue-label={`Article: ${a.headline ?? ''}`}
          >
            {img ? (
              <div className="insight-media" data-aue-prop="heroImage" data-aue-type="media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={a.headline ?? ''} loading="lazy" />
              </div>
            ) : null}
            <div className="insight-body">
              <h3 data-aue-prop="headline" data-aue-type="text">{a.headline}</h3>
              <p data-aue-prop="main" data-aue-type="richtext">{a.main?.plaintext}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
