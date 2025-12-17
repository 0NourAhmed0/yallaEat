// Import testing utilities from Vitest and React Testing Library
import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Import the component we're testing
import { AuthProvider, useAuth } from "./AuthContext";

// Create a mock function to simulate API calls
// We don't want to make real HTTP requests in tests, so we fake them
const getMock = vi.fn();

// Mock the API client module (pretend to be the axios API calls)
vi.mock("../api/client", () => ({
  api: {
    get: (...args) => getMock(...args), // When api.get() is called, use our mock
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// A simple component that uses the AuthContext to display user info
// This helps us test if AuthProvider is working correctly
function Consumer() {
  const { user } = useAuth(); // Get user from AuthContext
  return <div>{user ? `user:${user.email}` : "user:none"}</div>;
}

// Test suite for AuthProvider component
describe("AuthProvider", () => {
  // Before each test, reset the mock function (clean slate)
  beforeEach(() => {
    getMock.mockReset();
  });

  // Test 1: Check if AuthProvider loads user data when user is authenticated
  test("loads current user from /api/users/profile (authenticated)", async () => {
    // Step 1: Tell the mock API to return fake user data (simulate successful login)
    getMock.mockResolvedValueOnce({
      data: { _id: "1", email: "x@example.com", role: "customer", name: "X" },
    });

    // Step 2: Render the AuthProvider component with our Consumer inside
    // This simulates what happens when the app loads
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Step 3: Wait for the user email to appear on screen
    // This means AuthProvider successfully loaded the user data
    expect(await screen.findByText("user:x@example.com")).toBeInTheDocument();
    
    // Step 4: Verify that the API was called with the correct endpoint
    expect(getMock).toHaveBeenCalledWith("/api/users/profile");
  });

  // Test 2: Check if AuthProvider handles unauthenticated users correctly
  test("sets user to null if profile request fails (unauthenticated)", async () => {
    // Step 1: Tell the mock API to return an error (simulate user not logged in)
    getMock.mockRejectedValueOnce(new Error("401")); // 401 = Unauthorized

    // Step 2: Render the AuthProvider component
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Step 3: Verify that "user:none" appears on screen
    // This means AuthProvider correctly set user to null when API failed
    expect(await screen.findByText("user:none")).toBeInTheDocument();
  });
});
