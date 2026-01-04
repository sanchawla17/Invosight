import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateWithAIModal from "../components/invoices/CreateWithAIModal.jsx";
import toast from "react-hot-toast";
import { parseInvoiceImage, parseInvoiceText } from "../api/aiApi";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../api/aiApi", () => ({
  parseInvoiceImage: jest.fn(),
  parseInvoiceText: jest.fn(),
}));

test("AI modal shows validation error when empty", () => {
  render(
    <MemoryRouter>
      <CreateWithAIModal isOpen={true} onClose={jest.fn()} />
    </MemoryRouter>
  );

  const generateButton = screen.getByRole("button", {
    name: /generate invoice/i,
  });

  fireEvent.click(generateButton);

  expect(toast.error).toHaveBeenCalledWith(
    "Please paste text or upload an image."
  );
  expect(parseInvoiceText).not.toHaveBeenCalled();
  expect(parseInvoiceImage).not.toHaveBeenCalled();
});
