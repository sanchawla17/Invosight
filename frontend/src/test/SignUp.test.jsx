import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUp from "../pages/Auth/SignUp.jsx";
import * as Auth from "../context/AuthContext";

jest.mock("../utils/apiPaths", () => ({
  BASE_URL: "http://localhost:8000",
  API_PATHS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
    },
    INVOICE: {},
    AI: {},
  },
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

test("SignUp has name, email, password and submit button", () => {
  Auth.useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  });

  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  // use your actual placeholders from the DOM you pasted
  const name    = screen.getByPlaceholderText(/enter your full name/i);
  const email   = screen.getByPlaceholderText(/enter your email/i);
  const pass    = screen.getByPlaceholderText(/create a password/i);
  const confirm = screen.getByPlaceholderText(/confirm your password/i);

  const submit =
    screen.getByRole("button", { name: /create account|sign up|register/i });

  expect(name).toBeInTheDocument();
  expect(email).toBeInTheDocument();
  expect(pass).toBeInTheDocument();
  expect(confirm).toBeInTheDocument();
  expect(submit).toBeInTheDocument();
});
