import CFImage from './CFImage';
import { imageUrl, type Article } from '@/lib/aem-client';
import { aueComponent, aueProp, whenEditable } from '@/lib/ue';

// One Article Content Fragment rendered as a card. Instrumented for Universal
// Editor via the shared ue helpers, so the same component is editable in UE and
// clean on the public deploy (whenEditable returns {} when editing is off).

export interface ArticleCardProps {
  article: Article;
  editable: boolean;
}

export default function ArticleCard({ article, editable }: ArticleCardProps) {
  const src = imageUrl(article.heroImage);
  const path = article._path ?? '';
  const canEdit = editable && Boolean(path);

  return (
    <article className="card" {...whenEditable(canEdit, aueComponent(path, { label: 'Article' }))}>
      {src ? (
        <div className="card-media" {...whenEditable(canEdit, aueProp('heroImage', 'media'))}>
          <CFImage src={src} alt={article.headline ?? ''} />
        </div>
      ) : null}
      <div className="card-body">
        <h3 className="card-title" {...whenEditable(canEdit, aueProp('headline', 'text'))}>
          {article.headline}
        </h3>
        {article.main?.plaintext ? (
          <p className="card-text" {...whenEditable(canEdit, aueProp('main', 'richtext'))}>
            {article.main.plaintext}
          </p>
        ) : null}
      </div>
    </article>
  );
}
