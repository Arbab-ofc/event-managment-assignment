const Spinner = ({ className = "" }) => (
  <div
    className={`h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600 dark:border-slate-700 ${className}`}
  />
);

export default Spinner;
