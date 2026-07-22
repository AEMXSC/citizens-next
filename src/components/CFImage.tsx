// Renders a Content Fragment image. AEM Dynamic Media / Scene7 URLs are served
// as a responsive <picture> with width + format renditions; everything else is
// a plain lazy <img>. Ported (cleaned) from the NYL EDS scripts.js Scene7 logic.
// No hooks, so it renders in both server and client component trees.

const RENDITION_WIDTH = 1200;

function isScene7(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith('/is/image/');
  } catch {
    return false;
  }
}

function scene7Rendition(src: string, width: number, format: string): string {
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;

  // Renditions with dimensions baked into the path (e.g. ...-w2000-h857) reject
  // all query params (HTTP 403). Serve them verbatim.
  if (/-w\d+-h\d+/i.test(base)) {
    return base;
  }

  // Preserve the literal query string. Scene7's IS/Image template params ($image
  // etc.) require a literal '$', which URL.searchParams would percent-encode.
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const kept = query
    .split('&')
    .filter((p) => p && p.split('=')[0] !== 'wid' && p.split('=')[0] !== 'fmt');
  kept.push(`wid=${width}`, `fmt=${format}`);
  return `${base}?${kept.join('&')}`;
}

export interface CFImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CFImage({ src, alt, className }: CFImageProps) {
  if (!src) return null;

  if (isScene7(src)) {
    return (
      <picture className={className}>
        <source type="image/webp" srcSet={scene7Rendition(src, RENDITION_WIDTH, 'webp')} />
        <source type="image/jpeg" srcSet={scene7Rendition(src, RENDITION_WIDTH, 'jpg')} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scene7Rendition(src, RENDITION_WIDTH, 'jpg')} alt={alt} loading="lazy" />
      </picture>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} loading="lazy" />;
}
