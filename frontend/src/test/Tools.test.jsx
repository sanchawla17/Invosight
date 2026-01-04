import { render, screen, fireEvent } from "@testing-library/react";
import Tools from "../pages/Tools/Tools.jsx";

jest.mock("../api/toolsApi", () => ({
  convertCurrency: jest.fn(),
}));

test("Tools discount calculator computes correctly", () => {
  render(<Tools />);

  const discountCard = screen.getByRole("button", {
    name: /discount calculator/i,
  });
  fireEvent.click(discountCard);

  const amountInput = screen.getByPlaceholderText(/0\.00/);
  const valueInput = screen.getByPlaceholderText(/^0$/);

  fireEvent.change(amountInput, { target: { value: "100" } });
  fireEvent.change(valueInput, { target: { value: "10" } });

  expect(screen.getByText("10.00")).toBeInTheDocument();
  expect(screen.getByText("90.00")).toBeInTheDocument();
});
