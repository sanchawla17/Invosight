// displays an empty state with an optional icon, title, description, and action button
const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={`flex flex-col items-center justify-center py-12 text-center ${
      className || ""
    }`}
  >
    {Icon && (
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    )}
    <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
    {description && (
      <p className="text-slate-500 mb-6 max-w-md">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
