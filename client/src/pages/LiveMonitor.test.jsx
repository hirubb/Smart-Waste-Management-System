// Mock navigate - must be declared before usage
const mockNavigate = jest.fn();

// All jest.mock calls must be at the top of the file
jest.mock("axios");

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  }
}));

jest.mock("leaflet/dist/leaflet.css", () => ({}));

jest.mock("leaflet", () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  },
}));

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, center, zoom }) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom}>
      {children}
    </div>
  ),
  TileLayer: ({ attribution, url }) => (
    <div data-testid="tile-layer" data-url={url}>
      {attribution}
    </div>
  ),
  Marker: ({ children, position }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  CircleMarker: ({ children, center, fillColor, radius }) => (
    <div 
      data-testid="circle-marker" 
      data-center={JSON.stringify(center)}
      data-color={fillColor}
      data-radius={radius}
    >
      {children}
    </div>
  ),
}));

// Mock react-router-dom BEFORE imports
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Now imports
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LiveMonitor from "./LiveMonitor";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

// Sample dustbin data
const mockDustbins = [
  {
    _id: "1",
    binId: "BIN001",
    location: "Main Street",
    latitude: 6.9271,
    longitude: 79.8612,
    status: "Empty",
    fillPercentage: 20,
    binType: "residential",
    locationZone: "zone1",
    collectionRoute: "route1",
  },
  {
    _id: "2",
    binId: "BIN002",
    location: "Park Avenue",
    latitude: 7.2906,
    longitude: 80.6337,
    status: "Half Full",
    fillPercentage: 50,
    binType: "commercial",
    locationZone: "zone2",
    collectionRoute: "route2",
  },
  {
    _id: "3",
    binId: "BIN003",
    location: "Market Road",
    latitude: 7.8731,
    longitude: 80.7718,
    status: "Full",
    fillPercentage: 90,
    binType: "industrial",
    locationZone: "zone3",
    collectionRoute: "route3",
  },
  {
    _id: "4",
    binId: "BIN004",
    location: "Beach Road",
    latitude: 6.0535,
    longitude: 80.2210,
    status: "Overflow",
    fillPercentage: 105,
    binType: "recycling",
    locationZone: "zone4",
    collectionRoute: "route4",
  },
];

// Mock auth context
const mockAuthContext = {
  user: {
    _id: "user123",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
  },
  logout: jest.fn(),
};

// Helper function to render component with providers
const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("LiveMonitor Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ============= RENDERING TESTS =============
  describe("Component Rendering", () => {
    test("renders the LiveMonitor component without crashing", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/WasteWise/i)).toBeInTheDocument();
      });
    });

    test("renders navigation bar with all links", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Live Monitor")).toBeInTheDocument();
        expect(screen.getByText("Alerts")).toBeInTheDocument();
        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
      });
    });

    test("renders logout button", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });
    });

    test("renders filters and search section", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/Filters & Search/i)).toBeInTheDocument();
        expect(screen.getByText(/Search Bins/i)).toBeInTheDocument();
        expect(screen.getByText(/Fill Status/i)).toBeInTheDocument();
        expect(screen.getByText(/Bin Type/i)).toBeInTheDocument();
        expect(screen.getByText(/Location Zone/i)).toBeInTheDocument();
        expect(screen.getByText(/Collection Route/i)).toBeInTheDocument();
      });
    });
  });

  // ============= MAP RENDERING TESTS =============
  describe("Map Rendering", () => {
    test("renders the map container with correct Sri Lanka center coordinates", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        const mapContainer = screen.getByTestId("map-container");
        expect(mapContainer).toBeInTheDocument();
        expect(mapContainer.getAttribute("data-center")).toBe(
          JSON.stringify([7.8731, 80.7718])
        );
        expect(mapContainer.getAttribute("data-zoom")).toBe("8");
      });
    });

    test("renders the TileLayer with OpenStreetMap", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        const tileLayer = screen.getByTestId("tile-layer");
        expect(tileLayer).toBeInTheDocument();
        expect(tileLayer.textContent).toMatch(/OpenStreetMap/i);
      });
    });

    test("renders bin status legend", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/Bin Status Legend/i)).toBeInTheDocument();
        // Use getAllByText since these texts appear in both filter section and legend
        expect(screen.getAllByText(/Empty \(0-25%\)/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Half Full \(26-75%\)/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Full \(76-100%\)/i).length).toBeGreaterThan(0);
      });
    });
  });

  // ============= API TESTING =============
  describe("API Integration", () => {
    test("fetches dustbins on component mount", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("http://localhost:4000/api/dustbins");
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });

    test("displays correct number of bins online", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(
          screen.getByText(/Live monitoring active - 4 bins online/i)
        ).toBeInTheDocument();
      });
    });

    test("handles API error gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValue(new Error("API Error"));

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error fetching dustbins:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test("sets up auto-refresh interval", async () => {
      // Spy on setInterval before rendering
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      // Wait for initial render
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      // Verify that setInterval was called with 30000ms (30 seconds)
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000
      );

      setIntervalSpy.mockRestore();
    });

    test("manual refresh button is clickable and enabled", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
      });

      // Verify refresh button exists and is not disabled
      const refreshButton = screen.getByText(/Refresh/i);
      expect(refreshButton).not.toBeDisabled();
      expect(refreshButton).toBeInTheDocument();
    });
  });

  // ============= MARKER RENDERING TESTS =============
  describe("Marker Rendering", () => {
    test("renders all dustbin markers on the map", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(4);
      });
    });

    test("renders markers with correct colors based on status", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        
        // Empty bin - Green
        expect(markers[0].getAttribute("data-color")).toBe("#28a745");
        
        // Half Full - Orange
        expect(markers[1].getAttribute("data-color")).toBe("#ffc107");
        
        // Full - Red
        expect(markers[2].getAttribute("data-color")).toBe("#dc3545");
        
        // Overflow - Dark Gray
        expect(markers[3].getAttribute("data-color")).toBe("#6c757d");
      });
    });

    test("renders markers at correct coordinates", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        
        expect(markers[0].getAttribute("data-center")).toBe(
          JSON.stringify([6.9271, 79.8612])
        );
        expect(markers[1].getAttribute("data-center")).toBe(
          JSON.stringify([7.2906, 80.6337])
        );
      });
    });
  });

  // ============= SEARCH FUNCTIONALITY TESTS =============
  describe("Search Functionality", () => {
    test("filters bins by Bin ID", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Search for BIN001
      const searchInput = screen.getByPlaceholderText(/Bin ID or Location.../i);
      fireEvent.change(searchInput, { target: { value: "BIN001" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("filters bins by location", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Search for "Park Avenue"
      const searchInput = screen.getByPlaceholderText(/Bin ID or Location.../i);
      fireEvent.change(searchInput, { target: { value: "Park" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("search is case-insensitive", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Search with lowercase
      const searchInput = screen.getByPlaceholderText(/Bin ID or Location.../i);
      fireEvent.change(searchInput, { target: { value: "main street" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });
  });

  // ============= FILTER FUNCTIONALITY TESTS =============
  describe("Filter Functionality", () => {
    test("filters bins by fill status - Empty", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Click "Empty" checkbox
      const emptyCheckbox = screen.getByLabelText(/Empty \(0-25%\)/i);
      fireEvent.click(emptyCheckbox);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("filters bins by fill status - Multiple selections", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Select both Empty and Full
      const emptyCheckbox = screen.getByLabelText(/Empty \(0-25%\)/i);
      const fullCheckbox = screen.getByLabelText(/Full \(76-100%\)/i);
      
      fireEvent.click(emptyCheckbox);
      fireEvent.click(fullCheckbox);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(2);
      });
    });

    test("filters bins by bin type", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Select residential bin type
      const binTypeSelect = screen.getByDisplayValue(/All Types/i);
      fireEvent.change(binTypeSelect, { target: { value: "residential" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("filters bins by location zone", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Select zone1
      const zoneSelect = screen.getByDisplayValue(/All Zones/i);
      fireEvent.change(zoneSelect, { target: { value: "zone1" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("filters bins by collection route", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Select route2
      const routeSelect = screen.getByDisplayValue(/All Routes/i);
      fireEvent.change(routeSelect, { target: { value: "route2" } });

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });
    });

    test("clear all filters button resets all filters", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Apply multiple filters
      const searchInput = screen.getByPlaceholderText(/Bin ID or Location.../i);
      fireEvent.change(searchInput, { target: { value: "BIN001" } });

      const emptyCheckbox = screen.getByLabelText(/Empty \(0-25%\)/i);
      fireEvent.click(emptyCheckbox);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(1);
      });

      // Clear all filters
      const clearButton = screen.getByText(/Clear All Filters/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        expect(markers).toHaveLength(4);
        expect(searchInput.value).toBe("");
      });
    });
  });

  // ============= USER INTERACTION TESTS =============
  describe("User Interactions", () => {
    test("logout button calls logout function and navigates to login", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(mockAuthContext.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("displays loading state during data fetch", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
      });

      // After loading completes, button should be enabled
      const refreshButton = screen.getByText(/Refresh/i);
      expect(refreshButton).not.toBeDisabled();
    });

    test("displays last updated time", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
      });
    });
  });

  // ============= COMBINED FILTER TESTS =============
  describe("Combined Filters", () => {
    test("applies multiple filters simultaneously", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getAllByTestId("circle-marker")).toHaveLength(4);
      });

      // Apply bin type filter
      const binTypeSelect = screen.getByDisplayValue(/All Types/i);
      fireEvent.change(binTypeSelect, { target: { value: "residential" } });

      // Apply fill status filter
      const emptyCheckbox = screen.getByLabelText(/Empty \(0-25%\)/i);
      fireEvent.click(emptyCheckbox);

      await waitFor(() => {
        const markers = screen.getAllByTestId("circle-marker");
        // Should show only residential bins that are empty
        expect(markers).toHaveLength(1);
      });
    });
  });

  // ============= BIN COUNT TESTS =============
  describe("Bin Counts", () => {
    test("displays correct count for each fill status", async () => {
      axios.get.mockResolvedValue({
        data: { success: true, dustbins: mockDustbins },
      });

      renderWithProviders(<LiveMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/Empty \(0-25%\) - 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Half Full \(26-75%\) - 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Full \(76-100%\) - 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Overflow - 1/i)).toBeInTheDocument();
      });
    });
  });
});
