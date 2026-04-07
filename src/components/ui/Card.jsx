export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
