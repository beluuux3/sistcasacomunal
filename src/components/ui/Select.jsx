export function Select({
  label,
  error,
  className = "",
  required = false,
  placeholder = "Seleccionar opción",
  children,
  ...props
}) {
  const baseStyles =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900";

  const errorStyles = error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      >
        <option className="text-gray-700" value="">
          {placeholder}
        </option>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
