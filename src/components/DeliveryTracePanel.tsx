import type { DeliveryTrace } from '@/lib/da-sc';

// "Show the request" panel for the DA Structured Content column. The fetch runs
// server-side, so it never appears in the browser Network tab; this renders the
// exact request and response the server made, so the delivery path is visible
// on screen during a demo.

const SOURCE_LABEL: Record<DeliveryTrace['source'], string> = {
  'content-ai-graphql': 'Content AI GraphQL',
  'da-sc-worker': 'DA Structured Content worker',
};

export default function DeliveryTracePanel({ trace }: { trace: DeliveryTrace }) {
  const headerLines = Object.entries(trace.headers).map(([k, v]) => `${k}: ${v}`);

  return (
    <details className="cmp-trace">
      <summary>
        Show the request
        <span className="cmp-trace-meta">
          {SOURCE_LABEL[trace.source]} · {trace.method} · {trace.status ?? '—'} · {trace.ms} ms
        </span>
      </summary>

      {trace.fallbackReason && (
        <p className="cmp-trace-warn">Fell back to the worker: {trace.fallbackReason}</p>
      )}

      <p className="cmp-trace-label">{trace.endpoints.length > 1 ? 'Endpoints' : 'Endpoint'}</p>
      <pre className="cmp-trace-code">
        {trace.endpoints.map((e) => `${trace.method} ${e}`).join('\n') || '(none)'}
      </pre>

      {headerLines.length > 0 && (
        <>
          <p className="cmp-trace-label">Headers</p>
          <pre className="cmp-trace-code">{headerLines.join('\n')}</pre>
        </>
      )}

      {trace.query && (
        <>
          <p className="cmp-trace-label">GraphQL query</p>
          <pre className="cmp-trace-code">{trace.query}</pre>
        </>
      )}

      <p className="cmp-trace-label">Response</p>
      <pre className="cmp-trace-code cmp-trace-response">{trace.response}</pre>
    </details>
  );
}
