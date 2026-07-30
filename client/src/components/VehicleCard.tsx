import type { Vehicle } from "../types";
import { useAuth } from "../context/AuthContext";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (id: string) => void;
  purchasing?: boolean;
  style?: React.CSSProperties;
}

export default function VehicleCard({
  vehicle,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  purchasing,
  style,
}: VehicleCardProps) {
  const { isAdmin } = useAuth();
  const isOutOfStock = vehicle.quantity === 0;

  const categoryColors: Record<string, string> = {
    Sedan: "bg-denim-500/15 text-denim-300 border-denim-500/40",
    SUV: "bg-patina-500/15 text-patina-300 border-patina-500/40",
    Truck: "bg-rust-500/15 text-rust-300 border-rust-500/40",
    Coupe: "bg-brass-500/15 text-brass-300 border-brass-500/40",
    Convertible: "bg-oxblood-500/15 text-oxblood-300 border-oxblood-500/40",
    Hatchback: "bg-denim-400/15 text-denim-300 border-denim-400/40",
    Van: "bg-rust-600/15 text-rust-300 border-rust-600/40",
    Wagon: "bg-patina-600/15 text-patina-300 border-patina-600/40",
  };

  const categoryStyle =
    categoryColors[vehicle.category] || "bg-vault-500/15 text-vault-200 border-vault-500/40";

  return (
    <div
      style={style}
      className="group relative bg-vault-850/70 backdrop-blur-sm border border-vault-600/60 rounded-xl overflow-hidden hover:border-brass-500/50 hover:shadow-lg hover:shadow-brass-500/5 transition-all duration-300 animate-fade-up"
    >
      {/* corner rivets, vault deposit-box detail */}
      <span className="absolute top-2 left-2 w-1 h-1 rounded-full bg-vault-500/70 z-10" />
      <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-vault-500/70 z-10" />

      <div className="h-48 bg-gradient-to-br from-vault-700/60 to-vault-900/60 flex items-center justify-center relative overflow-hidden">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg
            className="w-20 h-20 text-vault-600 group-hover:text-vault-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-full border ${categoryStyle}`}>
            {vehicle.category}
          </span>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-vault-950/70 flex items-center justify-center">
            <span className="ledger-label px-4 py-2 border border-oxblood-400/60 text-oxblood-300 text-xs font-bold rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-ivory group-hover:text-brass-300 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.year && (
              <p className="text-sm text-vault-300 font-mono">{vehicle.year}</p>
            )}
          </div>
          <p className="text-xl font-mono font-semibold text-brass-300">
            ${vehicle.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-mono uppercase tracking-wide ${isOutOfStock ? "text-oxblood-400" : "text-patina-400"}`}>
            {isOutOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPurchase(vehicle._id)}
            disabled={isOutOfStock || purchasing}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              isOutOfStock || purchasing
                ? "bg-vault-700/50 text-vault-400 cursor-not-allowed"
                : "bg-brass-500 hover:bg-brass-400 text-vault-950 hover:shadow-lg hover:shadow-brass-500/25 active:scale-[0.98]"
            }`}
          >
            {purchasing ? "Processing…" : isOutOfStock ? "Out of Stock" : "Purchase"}
          </button>

          {isAdmin && (
            <div className="flex gap-1.5">
              {onRestock && (
                <button
                  onClick={() => onRestock(vehicle._id)}
                  title="Restock"
                  className="p-2.5 bg-patina-600/15 hover:bg-patina-600/30 text-patina-400 rounded-md border border-patina-600/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(vehicle)}
                  title="Edit"
                  className="p-2.5 bg-brass-600/15 hover:bg-brass-600/30 text-brass-400 rounded-md border border-brass-600/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(vehicle._id)}
                  title="Delete"
                  className="p-2.5 bg-oxblood-600/15 hover:bg-oxblood-600/30 text-oxblood-400 rounded-md border border-oxblood-600/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
