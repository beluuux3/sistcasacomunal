export function Input({
  label,
  error,
  className = "",
  required = false,
  rightElement,
  leftIcon,
  labelClassName = "text-gray-300",
  ...props
}) {
  const baseStyles =
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400";

  const errorStyles = error
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-600";
  const paddingRight = rightElement ? "pr-10" : "";
  const paddingLeft = leftIcon ? "pl-10" : "";

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium ${labelClassName} mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`${baseStyles} ${errorStyles} ${paddingRight} ${paddingLeft} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
