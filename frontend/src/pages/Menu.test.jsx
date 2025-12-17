// Import testing utilities from Vitest and React Testing Library
import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Import the component we're testing
import Menu from "./Menu";

// Mock the api client module that Menu.jsx imports
vi.mock("../api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

// Test suite for Menu page component
describe("Menu page", () => {
  // Before each test, reset all mocks (clean slate)
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // User Story: As a customer, I want to view the menu items so that I can decide what to order
  test("loads and renders menu items from API", async () => {
    const { api } = await import("../api/client");
    // Step 1: Tell the mock api to return fake menu data
    // This simulates what the backend would return
    api.get.mockResolvedValueOnce({
      data: { 
        success: true, 
        items: [{ 
          _id: "1", 
          name: "Burger", 
          price: 50, 
          description: "Tasty",
          category: "Main",
          imageUrl: "/images/burger.jpg"
        }] 
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
    
    // Step 5: Verify price is displayed correctly
    expect(screen.getByText(/\$50\.00/i)).toBeInTheDocument();
    
    // Step 6: Verify "Add to Cart" button is present
    expect(screen.getByText(/Add to Cart/i)).toBeInTheDocument();
  });

  // Test: Check if error state displays correctly when API fails
  test("displays error message when API call fails", async () => {
    const { api } = await import("../api/client");
    // Step 1: Mock api to reject with an error
    api.get.mockRejectedValueOnce({
      response: {
        data: { message: "Server error" }
      }
    });

    // Step 2: Render the component
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>
    );

    // Step 3: Wait for error message to appear
    expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
    
    // Step 4: Verify "Try Again" button is present
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });
});
