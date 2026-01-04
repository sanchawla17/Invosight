const ResultBox = ({ title, children, note }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
      {title}
    </p>
    <div className="space-y-2 text-sm text-slate-700">{children}</div>
    {note && <p className="text-xs text-slate-500 mt-3">{note}</p>}
  </div>
);

export default ResultBox;
