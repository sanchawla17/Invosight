import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/landing/Header.jsx";
import * as Auth from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

test("Header shows brand and Login + Sign Up links when logged out", () => {
  Auth.useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  });

  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  // Brand (adjust if your exact text is different)
  const brand =
    screen.queryByText(/invosight/i);
  expect(brand).toBeInTheDocument();

  // Assert specific links to avoid the 'multiple matches' error
  expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
});
