const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && (
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      )}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);

export default PageHeader;
