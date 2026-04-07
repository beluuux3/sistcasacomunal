export function Button({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 focus:ring-blue-500",
    secondary:
      "bg-slate-700 text-white hover:bg-slate-800 disabled:bg-gray-400 focus:ring-slate-500",
    danger:
      "bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400 focus:ring-red-500",
    ghost:
      "bg-transparent text-slate-700 hover:bg-gray-200 disabled:text-gray-400 focus:ring-blue-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
