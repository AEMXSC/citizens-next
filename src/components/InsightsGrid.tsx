import { imageUrl, type Article } from '@/lib/aem-client';
import { aueComponent, aueProp, whenEditable } from '@/lib/ue';

// "Insights & guidance" cards, backed by AEM or EDS.
export default function InsightsGrid({ articles, editable = true }: { articles: readonly Article[]; editable?: boolean }) {
  if (!articles.length) {
    return (
      <p className="insights-empty">
        {editable
          ? 'No articles returned. Publish the Article fragments and the ArticleList query in AEM.'
          : 'No demo insights returned. Publish the insight documents and EDS structured-content index.'}
      </p>
    );
  }

  return (
    <div className="insights-grid">
      {articles.map((a) => {
        const img = imageUrl(a.heroImage);
        return (
          <article
            key={a._path ?? a.headline}
            className="insight-card"
            {...whenEditable(editable, aueComponent(a._path ?? '', { label: `Article: ${a.headline ?? ''}` }))}
          >
            {img ? (
              <div className="insight-media" {...whenEditable(editable, aueProp('heroImage', 'media'))}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={a.heroImageAlt ?? a.headline ?? ''} loading="lazy" />
              </div>
            ) : null}
            <div className="insight-body">
              <h3 {...whenEditable(editable, aueProp('headline', 'text'))}>{a.headline}</h3>
              <p {...whenEditable(editable, aueProp('main', 'richtext'))}>{a.main?.plaintext}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
