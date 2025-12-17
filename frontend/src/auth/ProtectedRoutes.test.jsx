// Import testing utilities from Vitest and React Testing Library
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";

// Import the component we're testing
import ProtectedRoute from "./ProtectedRoutes";

// Create a mock for the AuthContext (we don't want to use real auth in tests)
let mockAuthValue = { user: null };
vi.mock("./AuthContext", () => ({
  useAuth: () => mockAuthValue, // When useAuth() is called, return our mock value
}));

// Test suite for ProtectedRoute component (checks if routes are protected correctly)
describe("ProtectedRoute", () => {
  // Test 1: Check if unauthenticated users are redirected to login
  test("redirects to /login when no user", () => {
    // Step 1: Set mock auth to have no user (user = null means not logged in)
    mockAuthValue = { user: null };
    
    // Step 2: Render the ProtectedRoute component
    // MemoryRouter simulates browser navigation
    // We're trying to visit "/secret" which requires admin role
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route
            path="/secret"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Step 3: Verify that we see "Login Page" instead of "Secret"
    // This means ProtectedRoute correctly redirected us to login
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  // Test 2: Check if users with wrong role are redirected to unauthorized page
  test("redirects to /unauthorized when role not allowed", () => {
    // Step 1: Set mock auth to have a customer user (not admin)
    mockAuthValue = { user: { role: "customer" } };
    
    // Step 2: Render the ProtectedRoute component
    // Customer is trying to visit "/admin" which requires admin role
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Area</div>
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Step 3: Verify that we see "Unauthorized Page" instead of "Admin Area"
    // This means ProtectedRoute correctly blocked customer from admin area
    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
  });
});
