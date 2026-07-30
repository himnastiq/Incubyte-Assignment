import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import SearchBar from "../components/SearchBar";
import VehicleGrid from "../components/VehicleGrid";
import type { Vehicle, SearchFilters, PaginationInfo } from "../types";
import {
  searchVehicles,
  purchaseVehicle as purchaseVehicleApi,
  deleteVehicle as deleteVehicleApi,
  restockVehicle as restockVehicleApi,
} from "../api/endpoints";
import { AxiosError } from "axios";

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchVehicles = useCallback(
    async (searchFilters: SearchFilters = {}, page = 1) => {
      setLoading(true);
      try {
        const result = await searchVehicles({ ...searchFilters, page });
        setVehicles(result.vehicles);
        setPagination(result.pagination);
      } catch {
        showToast("Failed to load vehicles", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handlePurchase = async (id: string) => {
    setPurchasingId(id);
    try {
      const updated = await purchaseVehicleApi(id);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? updated : v)),
      );
      showToast("Vehicle purchased successfully!", "success");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      showToast(
        error.response?.data?.error?.message || "Purchase failed",
        "error",
      );
    } finally {
      setPurchasingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicleApi(id);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      showToast("Vehicle deleted", "success");
    } catch {
      showToast("Failed to delete vehicle", "error");
    }
  };

  const handleRestock = async (id: string) => {
    const qtyStr = prompt("Enter quantity to restock:");
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 1) {
      showToast("Please enter a valid positive number", "error");
      return;
    }
    try {
      const updated = await restockVehicleApi(id, qty);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? updated : v)),
      );
      showToast(`Restocked ${qty} units`, "success");
    } catch {
      showToast("Failed to restock", "error");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    navigate(`/admin/vehicles/edit/${vehicle._id}`, { state: { vehicle } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-up">
        <div>
          <p className="ledger-label text-[10px] text-brass-500 mb-1.5">Inventory Ledger</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ivory">Vehicle Inventory</h1>
          <p className="text-vault-300 mt-1 font-mono text-sm">
            {pagination ? `${pagination.total} vehicles available` : "Loading…"}
          </p>
        </div>
      </div>

      <div className="mb-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <SearchBar onSearch={handleSearch} />
      </div>

      <VehicleGrid
        vehicles={vehicles}
        loading={loading}
        onPurchase={handlePurchase}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        onRestock={isAdmin ? handleRestock : undefined}
        purchasingId={purchasingId}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => fetchVehicles(filters, page)}
                className={`px-4 py-2 rounded-md text-sm font-mono font-medium transition-colors border ${
                  page === pagination.page
                    ? "bg-brass-500 text-vault-950 border-brass-500"
                    : "bg-vault-850/60 text-vault-300 border-vault-600/60 hover:bg-vault-700/60 hover:text-brass-300"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
