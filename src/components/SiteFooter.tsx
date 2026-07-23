// Footer mirroring the NYL app: brand wordmark and the demo/GraphQL note.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-inner">
        <span className="foot-wm">Citizens</span>
        <span className="foot-note">
          Demonstration experience for Adobe demo purposes only. Content delivered from
          AEM Content Fragments via GraphQL.
        </span>
      </div>
    </footer>
  );
}
