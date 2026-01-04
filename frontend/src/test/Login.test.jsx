import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Auth/Login.jsx";
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

test("Login has email, password and submit button", () => {
  Auth.useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const email =
    screen.queryByLabelText(/email/i) ||
    screen.queryByPlaceholderText(/email/i);
  const password =
    screen.queryByLabelText(/password/i) ||
    screen.queryByPlaceholderText(/password/i);
  const submit =
    screen.queryByRole("button", { name: /log in|login|sign in/i });

  expect(email).toBeInTheDocument();
  expect(password).toBeInTheDocument();
  expect(submit).toBeInTheDocument();
});


test("Login shows validation errors for invalid email and short password", () => {
  Auth.useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  fireEvent.change(emailInput, { target: { value: "bademail" } });
  fireEvent.blur(emailInput);

  fireEvent.change(passwordInput, { target: { value: "123" } });
  fireEvent.blur(passwordInput);

  expect(
    screen.getByText(/please enter a valid email address/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/password must be at least 6 characters/i)
  ).toBeInTheDocument();
});
