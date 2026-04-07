export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-200 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    admin: "bg-purple-100 text-purple-800",
    facilitador: "bg-cyan-100 text-cyan-800",
    activo: "bg-green-100 text-green-800",
    inactivo: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
