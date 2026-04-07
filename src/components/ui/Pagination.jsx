import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className="gap-1"
        >
          <ChevronLeft size={18} />
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className="gap-1"
        >
          Siguiente
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
