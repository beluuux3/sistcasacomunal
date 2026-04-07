export function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full px-4 sm:px-0">
        <table className="w-full text-xs sm:text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-gray-100 border-b border-gray-200">{children}</thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
}

export function TableRow({ children, hover = true }) {
  return (
    <tr
      className={`${hover ? "hover:bg-gray-50 transition-colors" : ""} border-b border-gray-200 last:border-b-0`}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, align = "left", hidden = false }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <th
      className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 ${alignClass} ${hidden ? "hidden sm:table-cell" : ""}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, align = "left", hidden = false }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <td
      className={`px-2 sm:px-4 py-2 sm:py-3 text-gray-900 ${alignClass} ${hidden ? "hidden sm:table-cell" : ""}`}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ message = "No hay datos" }) {
  return (
    <TableRow hover={false}>
      <TableCell colSpan="100%" align="center">
        <div className="py-8 text-gray-500">{message}</div>
      </TableCell>
    </TableRow>
  );
}
