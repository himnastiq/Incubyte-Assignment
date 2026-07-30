import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "../components/Toast";
import { createVehicle, updateVehicle } from "../api/endpoints";
import type { Vehicle } from "../types";
import { AxiosError } from "axios";

export default function VehicleFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { showToast } = useToast();

  const existingVehicle = (location.state as { vehicle?: Vehicle })?.vehicle;
  const isEditing = !!id && !!existingVehicle;

  const [make, setMake] = useState(existingVehicle?.make || "");
  const [model, setModel] = useState(existingVehicle?.model || "");
  const [category, setCategory] = useState(existingVehicle?.category || "Sedan");
  const [price, setPrice] = useState(existingVehicle?.price?.toString() || "");
  const [quantity, setQuantity] = useState(existingVehicle?.quantity?.toString() || "0");
  const [year, setYear] = useState(existingVehicle?.year?.toString() || "");
  const [loading, setLoading] = useState(false);

  const categories = ["Sedan", "SUV", "Truck", "Coupe", "Convertible", "Hatchback", "Van", "Wagon"];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!make || !model || !category || !price) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const data = {
      make,
      model,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10) || 0,
      ...(year ? { year: parseInt(year, 10) } : {}),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updateVehicle(id, data);
        showToast("Vehicle updated successfully!", "success");
      } else {
        await createVehicle(data);
        showToast("Vehicle added successfully!", "success");
      }
      navigate("/dashboard");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      showToast(
        error.response?.data?.error?.message || `Failed to ${isEditing ? "update" : "create"} vehicle`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full px-4 py-3 bg-vault-950/60 border border-vault-600 rounded-lg text-vault-100 placeholder-vault-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brass-500/60 focus:border-brass-500/60 transition-all";
  const labelClass = "ledger-label block text-[10px] text-vault-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-up">
        <p className="ledger-label text-[10px] text-brass-500 mb-1.5">
          {isEditing ? "Amend Ledger Entry" : "New Ledger Entry"}
        </p>
        <h1 className="font-display text-2xl font-semibold text-ivory">
          {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
        </h1>
        <p className="text-vault-300 mt-1 font-mono text-sm">
          {isEditing ? "Update vehicle information" : "Add a new vehicle to the inventory"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-vault-850/70 backdrop-blur-sm border border-vault-600/60 rounded-2xl p-8 space-y-5 overflow-hidden animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass-500/50 to-transparent" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="vehicle-make" className={labelClass}>
              Make *
            </label>
            <input
              id="vehicle-make"
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Toyota"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="vehicle-model" className={labelClass}>
              Model *
            </label>
            <input
              id="vehicle-model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Camry"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="vehicle-category" className={labelClass}>
              Category *
            </label>
            <select
              id="vehicle-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={fieldClass}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vehicle-year" className={labelClass}>
              Year
            </label>
            <input
              id="vehicle-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="vehicle-price" className={labelClass}>
              Price ($) *
            </label>
            <input
              id="vehicle-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25000"
              min="0"
              step="0.01"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="vehicle-quantity" className={labelClass}>
              Quantity
            </label>
            <input
              id="vehicle-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-brass-500 hover:bg-brass-400 disabled:bg-vault-700 disabled:text-vault-400 disabled:cursor-not-allowed text-vault-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brass-500/20"
          >
            {loading
              ? isEditing
                ? "Updating…"
                : "Adding…"
              : isEditing
                ? "Update Vehicle"
                : "Add Vehicle"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-vault-700/60 hover:bg-vault-600/60 text-vault-200 font-medium rounded-lg transition-colors border border-vault-600/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
