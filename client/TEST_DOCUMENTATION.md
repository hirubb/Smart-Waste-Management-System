# LiveMonitor Component - Test Documentation

## Overview
This document describes the comprehensive test suite for the `LiveMonitor.jsx` component using **Jest** and **React Testing Library**.

## Test Coverage

### 📋 Test Categories

#### 1. **Component Rendering Tests**
- ✅ Renders without crashing
- ✅ Navigation bar with all links (Dashboard, Live Monitor, Alerts, Reports, Settings)
- ✅ Logout button rendering
- ✅ Filters and search sections
- ✅ All UI elements are present

#### 2. **Map Rendering Tests**
- ✅ MapContainer renders with correct Sri Lanka coordinates [7.8731, 80.7718]
- ✅ Zoom level is set to 8
- ✅ TileLayer with OpenStreetMap attribution
- ✅ Bin status legend with all statuses (Empty, Half Full, Full, Overflow)

#### 3. **API Integration Tests**
- ✅ Fetches dustbins on component mount
- ✅ Correct API endpoint called (`http://localhost:4000/api/dustbins`)
- ✅ Displays correct number of bins online
- ✅ Handles API errors gracefully
- ✅ **Auto-refresh every 30 seconds**
- ✅ Manual refresh button triggers API call

#### 4. **Marker Rendering Tests**
- ✅ Renders all dustbin markers (CircleMarkers)
- ✅ Correct marker colors based on status:
  - 🟢 Green (#28a745) for Empty bins
  - 🟡 Orange (#ffc107) for Half Full bins
  - 🔴 Red (#dc3545) for Full bins
  - ⚫ Gray (#6c757d) for Overflow bins
- ✅ Markers at correct GPS coordinates

#### 5. **Search Functionality Tests**
- ✅ Filters bins by Bin ID
- ✅ Filters bins by location name
- ✅ Case-insensitive search
- ✅ Real-time search updates

#### 6. **Filter Functionality Tests**
- ✅ **Fill Status Filters**: Empty, Half Full, Full, Overflow
- ✅ **Multiple fill status selections**
- ✅ **Bin Type Filter**: All Types, Residential, Commercial, Industrial, Recycling
- ✅ **Location Zone Filter**: All Zones, North District, Downtown, East Zone, West Side
- ✅ **Collection Route Filter**: All Routes, Route 1-4
- ✅ **Clear All Filters** button resets everything

#### 7. **User Interaction Tests**
- ✅ Logout functionality with navigation to login page
- ✅ Loading states during data fetch
- ✅ Last updated timestamp display
- ✅ Refresh button interactions

#### 8. **Combined Filter Tests**
- ✅ Multiple filters applied simultaneously
- ✅ Filters work together correctly
- ✅ Data filtering logic is accurate

#### 9. **Bin Count Tests**
- ✅ Correct count for each fill status category
- ✅ Counts update based on filters

## Test Statistics

| Category | Test Count | Status |
|----------|-----------|--------|
| Rendering Tests | 5 | ✅ Pass |
| Map Rendering | 4 | ✅ Pass |
| API Integration | 6 | ✅ Pass |
| Marker Rendering | 3 | ✅ Pass |
| Search Functionality | 3 | ✅ Pass |
| Filter Functionality | 6 | ✅ Pass |
| User Interactions | 3 | ✅ Pass |
| Combined Filters | 1 | ✅ Pass |
| Bin Counts | 1 | ✅ Pass |
| **Total** | **32** | ✅ |

## Running the Tests

### Run All Tests
```bash
cd client
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage Report
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test LiveMonitor.test.jsx
```

### Run Tests in CI Mode (No Watch)
```bash
npm test -- --watchAll=false
```

## Mock Data Structure

The tests use the following mock data structure:

```javascript
{
  _id: "1",
  binId: "BIN001",
  location: "Main Street",
  latitude: 6.9271,
  longitude: 79.8612,
  status: "Empty",        // Empty | Half Full | Full | Overflow
  fillPercentage: 20,
  binType: "residential", // residential | commercial | industrial | recycling
  locationZone: "zone1",  // zone1 | zone2 | zone3 | zone4
  collectionRoute: "route1" // route1 | route2 | route3 | route4
}
```

## Mocked Dependencies

### 1. **Axios**
```javascript
jest.mock("axios");
axios.get.mockResolvedValue({
  data: { success: true, dustbins: mockDustbins }
});
```

### 2. **React Leaflet Components**
- `MapContainer`
- `TileLayer`
- `CircleMarker`
- `Popup`
- `Marker`

### 3. **Leaflet Library**
```javascript
jest.mock("leaflet", () => ({
  Icon: {
    Default: {
      prototype: { _getIconUrl: jest.fn() },
      mergeOptions: jest.fn()
    }
  }
}));
```

### 4. **Auth Context**
```javascript
const mockAuthContext = {
  user: {
    _id: "user123",
    name: "Test User",
    role: "admin"
  },
  logout: jest.fn()
};
```

### 5. **React Router**
```javascript
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));
```

## Key Test Scenarios

### Scenario 1: Auto-Refresh Timer
```javascript
test("auto-refreshes data every 30 seconds", async () => {
  // Initial call on mount
  expect(axios.get).toHaveBeenCalledTimes(1);
  
  // After 30 seconds
  jest.advanceTimersByTime(30000);
  expect(axios.get).toHaveBeenCalledTimes(2);
  
  // After another 30 seconds
  jest.advanceTimersByTime(30000);
  expect(axios.get).toHaveBeenCalledTimes(3);
});
```

### Scenario 2: Multiple Filter Application
```javascript
test("applies multiple filters simultaneously", async () => {
  // Apply bin type filter
  fireEvent.change(binTypeSelect, { target: { value: "residential" }});
  
  // Apply fill status filter
  fireEvent.click(emptyCheckbox);
  
  // Result: Only residential bins that are empty
  expect(markers).toHaveLength(1);
});
```

### Scenario 3: Search with Filters
```javascript
test("search works with other filters", async () => {
  // Search for location
  fireEvent.change(searchInput, { target: { value: "Park" }});
  
  // Apply fill status
  fireEvent.click(halfFullCheckbox);
  
  // Result: Only "Park Avenue" bin that is half full
  expect(markers).toHaveLength(1);
});
```

## Test Best Practices Used

1. ✅ **Proper Component Isolation** - All external dependencies are mocked
2. ✅ **Async Handling** - Uses `waitFor` for async operations
3. ✅ **Timer Management** - Uses `jest.useFakeTimers()` for interval testing
4. ✅ **Cleanup** - Proper `beforeEach` and `afterEach` hooks
5. ✅ **Descriptive Test Names** - Clear test descriptions
6. ✅ **Provider Wrapping** - Components wrapped with necessary providers
7. ✅ **User Event Simulation** - Tests mimic real user interactions
8. ✅ **Accessibility Testing** - Uses semantic queries where possible

## Common Test Patterns

### Pattern 1: Testing API Calls
```javascript
test("fetches data on mount", async () => {
  renderWithProviders(<LiveMonitor />);
  
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith("http://localhost:4000/api/dustbins");
  });
});
```

### Pattern 2: Testing User Interactions
```javascript
test("button click triggers action", async () => {
  renderWithProviders(<LiveMonitor />);
  
  const button = screen.getByText("Refresh");
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
```

### Pattern 3: Testing Conditional Rendering
```javascript
test("displays loading state", async () => {
  renderWithProviders(<LiveMonitor />);
  
  await waitFor(() => {
    const refreshButton = screen.getByText(/Refresh/i);
    expect(refreshButton).toBeDisabled();
  });
});
```

## Troubleshooting

### Issue: Tests Timing Out
**Solution**: Ensure all async operations use `waitFor` and mock promises resolve properly

### Issue: Mock Not Working
**Solution**: Place mocks before imports in the test file

### Issue: Timer Tests Failing
**Solution**: Use `jest.useFakeTimers()` and `jest.advanceTimersByTime()`

### Issue: Memory Leaks Warning
**Solution**: Ensure proper cleanup in `afterEach` hook

## Future Test Enhancements

- [ ] Add E2E tests with Cypress or Playwright
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility (a11y) testing with jest-axe
- [ ] Add integration tests with real backend
- [ ] Add snapshot testing for UI components

## Coverage Goals

Target Coverage Metrics:
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

To check current coverage:
```bash
npm test -- --coverage --watchAll=false
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Leaflet Testing](https://react-leaflet.js.org/docs/start-testing/)

---

**Last Updated**: October 16, 2025  
**Test Framework**: Jest + React Testing Library  
**Component Version**: LiveMonitor.jsx v1.0

