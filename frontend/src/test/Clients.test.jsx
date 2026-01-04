import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Clients from "../pages/Clients/Clients.jsx";
import { fetchClients } from "../api/clientsApi";

jest.mock("../api/clientsApi", () => ({
  fetchClients: jest.fn(),
}));

test("Clients page renders aggregated rows", async () => {
  fetchClients.mockResolvedValue({
    data: [
      {
        clientKey: "acme|billing@acme.com",
        clientName: "Acme Corp",
        clientEmail: "billing@acme.com",
        totalBilled: 1200,
        totalOutstanding: 300,
        overdueCount: 1,
        lastInvoiceDate: "2024-01-05T00:00:00.000Z",
      },
    ],
  });

  render(
    <MemoryRouter>
      <Clients />
    </MemoryRouter>
  );

  expect(await screen.findByText(/acme corp/i)).toBeInTheDocument();
  expect(screen.getByText(/billing@acme.com/i)).toBeInTheDocument();
  expect(screen.getByText("$1200.00")).toBeInTheDocument();
  expect(screen.getByText("$300.00")).toBeInTheDocument();
  expect(
    screen.getAllByRole("button", { name: /create invoice/i }).length
  ).toBeGreaterThan(0);
});
