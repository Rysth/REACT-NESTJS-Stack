import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  value?: string; // Cambia initialValue por value para usar un patrón controlado
  debounceTime?: number;
}

export default function SearchBar({
  onSearch,
  placeholder = "Buscar...",
  value = "", // Cambia initialValue por value
  debounceTime = 500,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedSearchTerm] = useDebounce(searchTerm, debounceTime);

  // Effect to trigger search when debounced value changes
  React.useEffect(() => {
    console.log("value prop changed:", value);

    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Este efecto actualiza el estado local cuando el value prop cambia
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <i className="bx bx-search text-gray-400"></i>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="input input-bordered w-full" // Agrega pl-10 para el icono
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => {
            setSearchTerm("");
            onSearch("");
          }}
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <i className="bx bx-x text-gray-400 hover:text-gray-600"></i>
        </button>
      )}
    </div>
  );
}
