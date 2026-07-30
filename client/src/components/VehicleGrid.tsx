import type { Vehicle } from "../types";
import VehicleCard from "./VehicleCard";

interface VehicleGridProps {
  vehicles: Vehicle[];
  loading: boolean;
  onPurchase: (id: string) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (id: string) => void;
  purchasingId?: string | null;
}

export default function VehicleGrid({
  vehicles,
  loading,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  purchasingId,
}: VehicleGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-vault-850/70 border border-vault-600/60 rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 bg-vault-700/50" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-vault-700/50 rounded w-3/4" />
              <div className="h-4 bg-vault-700/50 rounded w-1/2" />
              <div className="h-10 bg-vault-700/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-16 h-16 text-vault-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <path strokeLinecap="round" strokeWidth="1.3" d="M12 12l3.2-2.8" />
        </svg>
        <h3 className="font-display text-lg font-semibold text-vault-300 mb-1">The vault is empty</h3>
        <p className="text-sm text-vault-400 font-mono">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle, i) => (
        <VehicleCard
          key={vehicle._id}
          vehicle={vehicle}
          onPurchase={onPurchase}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestock={onRestock}
          purchasing={purchasingId === vehicle._id}
          style={{ animationDelay: `${Math.min(i, 11) * 60}ms` }}
        />
      ))}
    </div>
  );
}
