export function Alert({ type = "info", title, message, children }) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]}`}>
      {title && <h3 className="font-semibold mb-1">{title}</h3>}
      {message && <p className="text-sm">{message}</p>}
      {children}
    </div>
  );
}
