import { useState } from "react";
import type { SearchFilters } from "../types";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["Sedan", "SUV", "Truck", "Coupe", "Convertible", "Hatchback", "Van", "Wagon"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      make: make || undefined,
      model: model || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const handleClear = () => {
    setMake("");
    setModel("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    onSearch({});
  };

  const fieldClass =
    "w-full px-3 py-2.5 bg-vault-950/60 border border-vault-600 rounded-md text-vault-100 placeholder-vault-400 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all";
  const labelClass = "ledger-label block text-[10px] text-vault-300 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-vault-850/70 backdrop-blur-sm border border-vault-600/70 rounded-xl p-4 sm:p-6 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass-500/50 to-transparent" />
      <p className="ledger-label text-[10px] text-brass-500 mb-4">Search the Vault</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="search-make" className={labelClass}>Make</label>
          <input
            id="search-make"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="search-model" className={labelClass}>Model</label>
          <input
            id="search-model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Camry"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="search-category" className={labelClass}>Category</label>
          <select
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldClass}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="search-min-price" className={labelClass}>Min Price</label>
          <input
            id="search-min-price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="$0"
            min="0"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="search-max-price" className={labelClass}>Max Price</label>
          <input
            id="search-max-price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="No limit"
            min="0"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          type="submit"
          className="px-6 py-2.5 bg-brass-500 hover:bg-brass-400 text-vault-950 text-sm font-semibold rounded-md transition-colors hover:shadow-lg hover:shadow-brass-500/20"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2.5 bg-vault-700/60 hover:bg-vault-600/60 text-vault-200 text-sm font-medium rounded-md transition-colors border border-vault-600/60"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
