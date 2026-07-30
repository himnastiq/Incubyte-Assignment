import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext";
import VehicleCard from "../src/components/VehicleCard";
import type { Vehicle } from "../src/types";

vi.mock("../src/api/endpoints", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

const mockVehicle: Vehicle = {
  _id: "abc123",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 25000,
  quantity: 5,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function renderWithProviders(ui: React.ReactElement) {
  // Need to set auth in localStorage so useAuth works
  localStorage.setItem("token", "fake-token");
  localStorage.setItem(
    "user",
    JSON.stringify({ id: "1", name: "Test", email: "test@test.com", role: "customer" }),
  );
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe("VehicleCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders vehicle make, model, price, and stock", () => {
    const onPurchase = vi.fn();
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onPurchase={onPurchase} />);

    expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument();
    expect(screen.getByText("$25,000")).toBeInTheDocument();
    expect(screen.getByText("5 in stock")).toBeInTheDocument();
  });

  it("renders category badge", () => {
    const onPurchase = vi.fn();
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onPurchase={onPurchase} />);

    expect(screen.getByText("Sedan")).toBeInTheDocument();
  });

  it("calls onPurchase when purchase button is clicked", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onPurchase={onPurchase} />);

    await user.click(screen.getByRole("button", { name: /purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith("abc123");
  });

  it("disables purchase button when out of stock", () => {
    const outOfStockVehicle = { ...mockVehicle, quantity: 0 };
    const onPurchase = vi.fn();
    renderWithProviders(<VehicleCard vehicle={outOfStockVehicle} onPurchase={onPurchase} />);

    const purchaseBtn = screen.getByRole("button", { name: /out of stock/i });
    expect(purchaseBtn).toBeDisabled();
  });

  it("shows 'Out of Stock' overlay when quantity is 0", () => {
    const outOfStockVehicle = { ...mockVehicle, quantity: 0 };
    const onPurchase = vi.fn();
    renderWithProviders(<VehicleCard vehicle={outOfStockVehicle} onPurchase={onPurchase} />);

    const outOfStockElements = screen.getAllByText(/out of stock/i);
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(2); // overlay + button
  });
});
