const FormulaBox = ({ lines, variables }) => (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
    <p className="text-xs uppercase tracking-wide text-emerald-700 mb-2">
      Formula used
    </p>
    <pre className="text-xs font-mono text-emerald-900 whitespace-pre-wrap">
      {lines.join("\n")}
    </pre>
    {variables?.length > 0 && (
      <div className="mt-3 space-y-1 text-xs text-emerald-900/80">
        {variables.map((variable) => (
          <div key={variable.label}>
            <span className="font-semibold">{variable.label}</span>: {" "}
            {variable.description}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default FormulaBox;
