import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "../components/landing/Hero.jsx";
import * as Auth from "../context/AuthContext";

// Mock AuthContext so we can control isAuthenticated
jest.mock("../context/AuthContext");

describe("Hero Component", () => {
  test("renders hero image", () => {
    Auth.useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    const heroImage = screen.getByAltText(/invoice app screenshot/i);
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute("src");
  });

  test("renders 'Get Started for Free' when NOT authenticated", () => {
    Auth.useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    const signupButton = screen.getByRole("link", {
      name: /get started for free/i,
    });

    expect(signupButton).toBeInTheDocument();
    expect(signupButton).toHaveAttribute("href", "/signup");
  });

  test("renders 'Go to Dashboard' when authenticated", () => {
    Auth.useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    const dashboardButton = screen.getByRole("link", {
      name: /go to dashboard/i,
    });

    expect(dashboardButton).toBeInTheDocument();
    expect(dashboardButton).toHaveAttribute("href", "/dashboard");
  });
});
