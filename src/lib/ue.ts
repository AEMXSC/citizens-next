// Universal Editor instrumentation helpers. These build the data-aue-* attribute
// sets that Universal Editor reads to make DOM elements editable. Factored into
// one module so every surface instruments identically (the NYL build hand-wrote
// the same urn:aemconnection pattern separately in the worker and in the EDS
// offer block, which drifted).
//
// The attribute objects are spread directly onto JSX elements, e.g.
//   <article {...aueComponent(offer._path, { label: 'Offer', filter: 'cf' })}>
//     <h2 {...aueProp('headline', 'text')}>{offer.headline}</h2>

export type AueFieldType = 'text' | 'richtext' | 'media' | 'reference' | 'number';

/** Build the Universal Editor resource URN for a Content Fragment path. */
export function aueResource(cfPath: string): string {
  return `urn:aemconnection:${cfPath}/jcr:content/data/master`;
}

export interface AueComponentOptions {
  label?: string;
  /** Filter id constraining which components an author may add (e.g. 'cf'). */
  filter?: string;
}

/** Attributes that mark an element as an editable component bound to a CF. */
export function aueComponent(
  cfPath: string,
  options: AueComponentOptions = {},
): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-aue-resource': aueResource(cfPath),
    'data-aue-type': 'component',
  };
  if (options.label) attrs['data-aue-label'] = options.label;
  if (options.filter) attrs['data-aue-filter'] = options.filter;
  return attrs;
}

export interface AuePropOptions {
  label?: string;
}

/** Attributes that mark an element as an editable field of its parent CF. */
export function aueProp(
  prop: string,
  type: AueFieldType,
  options: AuePropOptions = {},
): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-aue-prop': prop,
    'data-aue-type': type,
  };
  if (options.label) attrs['data-aue-label'] = options.label;
  return attrs;
}

/**
 * Return the given instrumentation attributes only when editing is enabled,
 * otherwise an empty object. Keeps the public deploy's DOM clean while making
 * the same components fully editable inside Universal Editor.
 */
export function whenEditable(
  editable: boolean,
  attrs: Record<string, string>,
): Record<string, string> {
  return editable ? attrs : {};
}
