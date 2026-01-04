import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateInvoice from "../pages/Invoices/CreateInvoice.jsx";
import * as Auth from "../context/AuthContext";
import { fetchInvoices } from "../api/invoiceApi";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../api/invoiceApi", () => ({
  fetchInvoices: jest.fn(),
}));

test("Create Invoice updates totals when qty, price, and tax change", async () => {
  Auth.useAuth.mockReturnValue({
    user: {
      email: "test@example.com",
      businessName: "Test Studio",
      address: "123 Road",
      phone: "555-1111",
    },
  });

  fetchInvoices.mockResolvedValue({ data: [] });

  render(
    <MemoryRouter>
      <CreateInvoice />
    </MemoryRouter>
  );

  const qtyInput = screen.getByPlaceholderText(/^1$/);
  const priceInput = screen.getByPlaceholderText(/0\.00/);
  const taxInput = screen.getByPlaceholderText(/^0$/);

  fireEvent.change(qtyInput, { target: { value: "2" } });
  fireEvent.change(priceInput, { target: { value: "100" } });
  fireEvent.change(taxInput, { target: { value: "10" } });

  await waitFor(() => {
    expect(screen.getAllByText("$200.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$220.00").length).toBeGreaterThan(0);
  });
});
