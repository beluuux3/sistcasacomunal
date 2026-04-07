import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-700 text-gray-900"
        {...props}
      />
    </div>
  );
}
