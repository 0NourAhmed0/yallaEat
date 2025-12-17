// Import testing utilities from Vitest and React Testing Library
import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Import the component we're testing
import Menu from "./Menu";

// Create a mock function to simulate API calls
// We don't want to make real HTTP requests in tests, so we fake them
const getMock = vi.fn();

// Mock the API client module (pretend to be the axios API calls)
vi.mock("../api/client", () => ({
  api: {
    get: (...args) => getMock(...args), // When api.get() is called, use our mock
  },
}));

// Test suite for Menu page component
describe("Menu page", () => {
  // Before each test, reset the mock function (clean slate)
  beforeEach(() => {
    getMock.mockReset();
  });

  // Test: Check if Menu page loads and displays menu items correctly
  test("loads and renders menu items from API", async () => {
    // Step 1: Tell the mock API to return fake menu data
    // This simulates what the backend would return
    getMock.mockResolvedValueOnce({
      data: { 
        success: true, 
        items: [{ _id: "1", name: "Burger", price: 50, description: "Tasty" }] 
      },
    });

    // Step 2: Render the Menu component
    // MemoryRouter is needed because Menu uses React Router navigation
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>
    );

    // Step 3: Wait for "Dish Name" text to appear (this is part of the menu UI)
    // This means the page loaded successfully
    expect(await screen.findByText(/Dish Name/i)).toBeInTheDocument();
    
    // Step 4: Verify that "Burger" appears on screen
    // This means the menu item from our fake API data was displayed correctly
    expect(screen.getByText(/Burger/i)).toBeInTheDocument();
  });
});
