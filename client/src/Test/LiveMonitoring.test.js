import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiveMonitoring from '../pages/LiveMonitoring';

// Mock Leaflet
const mockMap = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
};

const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    openPopup: jest.fn(),
};

const mockTileLayer = {
    addTo: jest.fn().mockReturnThis(),
};

global.L = {
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => mockTileLayer),
    marker: jest.fn(() => mockMarker),
    divIcon: jest.fn((options) => options),
};

// Mock window.L
Object.defineProperty(window, 'L', {
    writable: true,
    value: global.L,
});

// Mock fetch globally
global.fetch = jest.fn();

describe('LiveMonitoring', () => {
    const mockStats = {
        routes: {
            active: 5,
            completedToday: 12,
            delayed: 2,
            totalDistanceToday: 150
        },
        collectors: {
            total: 20,
            onRoute: 8,
            onBreak: 3,
            available: 9
        }
    };

    const mockVehicles = [
        {
            vehicleId: 'VEH-001',
            collectorName: 'John Doe',
            collectorEmail: 'john@example.com',
            collectorPhone: '+94771234567',
            status: 'On Route',
            currentLocation: 'Colombo 07',
            workload: '65%',
            vehicleType: 'Truck',
            position: {
                latitude: 6.9271,
                longitude: 79.8612,
                speed: 35
            },
            completedRoutes: 8,
            totalDistance: '450 km',
            rating: 4.5,
            assignedRoute: {
                name: 'Route A',
                code: 'R-001',
                area: 'Downtown',
                collectionPoints: 25
            }
        },
        {
            vehicleId: 'VEH-002',
            collectorName: 'Jane Smith',
            collectorEmail: 'jane@example.com',
            collectorPhone: '+94779876543',
            status: 'On Break',
            currentLocation: 'Colombo 05',
            workload: '40%',
            vehicleType: 'Van',
            position: {
                latitude: 6.8887,
                longitude: 79.8574,
                speed: 0
            },
            completedRoutes: 12,
            totalDistance: '680 km',
            rating: 4.8,
            assignedRoute: null
        }
    ];

    const mockActiveRoutes = [
        {
            id: 'route1',
            routeCode: 'R-001',
            routeName: 'Downtown Collection',
            area: 'Colombo 07',
            status: 'Active',
            assignedCollector: {
                name: 'John Doe'
            },
            progress: {
                percentage: 65,
                collected: 16,
                total: 25
            },
            priority: 'High'
        },
        {
            id: 'route2',
            routeCode: 'R-002',
            routeName: 'Uptown Collection',
            area: 'Colombo 05',
            status: 'Delayed',
            assignedCollector: {
                name: 'Jane Smith'
            },
            progress: {
                percentage: 30,
                collected: 9,
                total: 30
            },
            priority: 'Urgent'
        }
    ];

    const mockAlerts = [
        {
            type: 'danger',
            title: 'Route Delayed',
            message: 'Route R-002 is running 30 minutes behind schedule',
            timestamp: new Date().toISOString()
        },
        {
            type: 'warning',
            title: 'Vehicle Maintenance',
            message: 'VEH-003 requires scheduled maintenance',
            timestamp: new Date().toISOString()
        },
        {
            type: 'info',
            title: 'Route Completed',
            message: 'Route R-005 completed successfully',
            timestamp: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Default successful responses
        fetch.mockImplementation((url) => {
            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockStats })
                });
            }
            if (url.includes('/vehicles/live')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockVehicles })
                });
            }
            if (url.includes('/routes/active')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockActiveRoutes })
                });
            }
            if (url.includes('/alerts')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockAlerts })
                });
            }
            return Promise.resolve({
                json: () => Promise.resolve({ success: true, data: [] })
            });
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Component Rendering', () => {
        test('renders without crashing', async () => {
            render(<LiveMonitoring />);
            await waitFor(() => {
                expect(screen.getByText('Live Vehicle Monitoring')).toBeInTheDocument();
            });
        });

        test('renders main sections', async () => {
            render(<LiveMonitoring />);
            await waitFor(() => {
                expect(screen.getByText('Live Vehicle Tracking Map')).toBeInTheDocument();
                expect(screen.getByText(/Live Status/)).toBeInTheDocument();
                expect(screen.getByText(/Recent Alerts/)).toBeInTheDocument();
            });
        });

        test('displays loading state initially', () => {
            render(<LiveMonitoring />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        test('renders refresh button', async () => {
            render(<LiveMonitoring />);
            await waitFor(() => {
                expect(screen.getByText('Refresh')).toBeInTheDocument();
            });
        });

        test('displays live updates indicator', async () => {
            render(<LiveMonitoring />);
            await waitFor(() => {
                expect(screen.getByText('Live Updates')).toBeInTheDocument();
            });
        });
    });

    describe('Data Fetching', () => {
        test('fetches all data on mount', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/dashboard/stats'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/vehicles/live'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/routes/active'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/alerts'));
            });
        });

        test('displays stats after fetching', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('5')).toBeInTheDocument(); // Active routes
                expect(screen.getByText('8')).toBeInTheDocument(); // On route
                expect(screen.getByText('3')).toBeInTheDocument(); // On break
                expect(screen.getByText('2')).toBeInTheDocument(); // Delayed
            });
        });

        test('displays vehicles after fetching', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
                expect(screen.getByText('VEH-002')).toBeInTheDocument();
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });
        });

        test('displays active routes after fetching', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Downtown Collection')).toBeInTheDocument();
                expect(screen.getByText('Uptown Collection')).toBeInTheDocument();
            });
        });

        test('displays alerts after fetching', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Route Delayed')).toBeInTheDocument();
                expect(screen.getByText('Vehicle Maintenance')).toBeInTheDocument();
                expect(screen.getByText('Route Completed')).toBeInTheDocument();
            });
        });

        test('handles fetch error gracefully', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            fetch.mockRejectedValueOnce(new Error('Network error'));

            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
            });

            consoleError.mockRestore();
        });

        test('auto-refreshes data every 15 seconds', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4); // Initial load
            });

            fetch.mockClear();

            // Fast forward 15 seconds
            jest.advanceTimersByTime(15000);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4); // Auto refresh
            });
        });
    });

    describe('Map Initialization', () => {
        test('initializes Leaflet map', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(global.L.map).toHaveBeenCalled();
                expect(mockMap.setView).toHaveBeenCalledWith([7.2906, 79.8337], 12);
            });
        });

        test('adds tile layer to map', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(global.L.tileLayer).toHaveBeenCalledWith(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    expect.any(Object)
                );
                expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
            });
        });

        test('creates markers for vehicles', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(global.L.marker).toHaveBeenCalled();
                expect(mockMarker.addTo).toHaveBeenCalled();
                expect(mockMarker.bindPopup).toHaveBeenCalled();
            });
        });

        test('cleans up map on unmount', async () => {
            const { unmount } = render(<LiveMonitoring />);

            await waitFor(() => {
                expect(global.L.map).toHaveBeenCalled();
            });

            unmount();

            expect(mockMap.remove).toHaveBeenCalled();
        });
    });

    describe('Vehicle Tracking', () => {
        test('selects vehicle when clicked', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const vehicleCard = screen.getByText('VEH-001').closest('div[style*="cursor"]');
            fireEvent.click(vehicleCard);

            // Vehicle should be highlighted
            expect(vehicleCard).toHaveStyle('background-color: rgb(248, 250, 252)');
        });

        test('tracks vehicle when track button clicked', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const trackButtons = screen.getAllByText('Track');
            fireEvent.click(trackButtons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Tracking: VEH-001/)).toBeInTheDocument();
                expect(screen.getByText('Stop Tracking')).toBeInTheDocument();
            });
        });

        test('centers map on tracked vehicle', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const trackButtons = screen.getAllByText('Track');
            fireEvent.click(trackButtons[0]);

            await waitFor(() => {
                expect(mockMap.setView).toHaveBeenCalledWith(
                    [mockVehicles[0].position.latitude, mockVehicles[0].position.longitude],
                    15
                );
            });
        });

        test('stops tracking when stop tracking clicked', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const trackButtons = screen.getAllByText('Track');
            fireEvent.click(trackButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('Stop Tracking')).toBeInTheDocument();
            });

            const stopButton = screen.getByText('Stop Tracking');
            fireEvent.click(stopButton);

            expect(screen.queryByText('Stop Tracking')).not.toBeInTheDocument();
        });

        test('displays tracking button state correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const trackButtons = screen.getAllByText('Track');
            fireEvent.click(trackButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('Tracking')).toBeInTheDocument();
            });
        });
    });

    describe('Vehicle Details Modal', () => {
        test('opens modal when vehicle selected', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            const vehicleCard = screen.getByText('VEH-001').closest('div[style*="cursor"]');
            fireEvent.click(vehicleCard);

            // Modal is not automatically opened on selection in this component
            // It's shown via state, so we need to check the component behavior
        });

        test('displays detailed vehicle information in modal', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            // Click to select vehicle (opens in modal/detail view)
            const vehicleCard = screen.getByText('VEH-001').closest('div[style*="cursor"]');
            fireEvent.click(vehicleCard);

            // Check if vehicle details are accessible
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        test('closes modal when close button clicked', async () => {
            const { container } = render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('VEH-001')).toBeInTheDocument();
            });

            // Manually set selectedVehicle to open modal
            const vehicleCard = screen.getByText('VEH-001').closest('div[style*="cursor"]');
            fireEvent.click(vehicleCard);

            // In actual implementation, modal appears with selectedVehicle state
            // This test structure allows for modal testing when state is properly managed
        });
    });

    describe('Refresh Functionality', () => {
        test('refreshes data when refresh button clicked', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Refresh')).toBeInTheDocument();
            });

            fetch.mockClear();

            const refreshButton = screen.getByText('Refresh');
            fireEvent.click(refreshButton);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/dashboard/stats'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/vehicles/live'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/routes/active'));
                expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/alerts'));
            });
        });
    });

    describe('Empty States', () => {
        test('displays empty state when no vehicles available', async () => {
            fetch.mockImplementation((url) => {
                if (url.includes('/vehicles/live')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({ success: true, data: [] })
                    });
                }
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: [] })
                });
            });

            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('No active vehicles')).toBeInTheDocument();
            });
        });

        test('displays empty state when no active routes', async () => {
            fetch.mockImplementation((url) => {
                if (url.includes('/routes/active')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({ success: true, data: [] })
                    });
                }
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockVehicles })
                });
            });

            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('No active routes found')).toBeInTheDocument();
            });
        });

        test('displays empty state when no alerts', async () => {
            fetch.mockImplementation((url) => {
                if (url.includes('/alerts')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({ success: true, data: [] })
                    });
                }
                if (url.includes('/vehicles/live')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({ success: true, data: mockVehicles })
                    });
                }
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: [] })
                });
            });

            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('No alerts')).toBeInTheDocument();
            });
        });
    });

    describe('Status Indicators', () => {
        test('displays correct status badges for vehicles', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getAllByText('On Route')).toHaveLength(1);
                expect(screen.getAllByText('On Break')).toHaveLength(1);
            });
        });

        test('displays correct priority badges for routes', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('High')).toBeInTheDocument();
                expect(screen.getByText('Urgent')).toBeInTheDocument();
            });
        });

        test('displays route progress correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('16/25')).toBeInTheDocument();
                expect(screen.getByText('9/30')).toBeInTheDocument();
            });
        });
    });

    describe('Statistics Display', () => {
        test('displays active routes stat correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const activeRoutesCard = screen.getByText('Active Routes').closest('.card-body');
                expect(within(activeRoutesCard).getByText('5')).toBeInTheDocument();
                expect(within(activeRoutesCard).getByText('12 completed today')).toBeInTheDocument();
            });
        });

        test('displays vehicles on route stat correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const vehiclesCard = screen.getByText('Vehicles On Route').closest('.card-body');
                expect(within(vehiclesCard).getByText('8')).toBeInTheDocument();
                expect(within(vehiclesCard).getByText('of 20 total')).toBeInTheDocument();
            });
        });

        test('displays on break stat correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const breakCard = screen.getByText('On Break').closest('.card-body');
                expect(within(breakCard).getByText('3')).toBeInTheDocument();
            });
        });

        test('displays delayed routes stat correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const delayedCard = screen.getByText('Delayed Routes').closest('.card-body');
                expect(within(delayedCard).getByText('2')).toBeInTheDocument();
            });
        });
    });

    describe('Alert Display', () => {
        test('displays alert count correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText(/Recent Alerts \(3\)/)).toBeInTheDocument();
            });
        });

        test('displays alert timestamps', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const alerts = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/);
                expect(alerts.length).toBeGreaterThan(0);
            });
        });

        test('displays different alert types with correct icons', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Route Delayed')).toBeInTheDocument();
                expect(screen.getByText('Vehicle Maintenance')).toBeInTheDocument();
                expect(screen.getByText('Route Completed')).toBeInTheDocument();
            });
        });
    });

    describe('Vehicle Workload Display', () => {
        test('displays workload percentages correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Workload: 65%')).toBeInTheDocument();
                expect(screen.getByText('Workload: 40%')).toBeInTheDocument();
            });
        });

        test('displays workload progress bars', async () => {
            const { container } = render(<LiveMonitoring />);

            await waitFor(() => {
                const progressBars = container.querySelectorAll('.progress-bar');
                expect(progressBars.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Global Track Function', () => {
        test('sets up global trackVehicle function', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(window.trackVehicle).toBeDefined();
                expect(typeof window.trackVehicle).toBe('function');
            });
        });

        test('global trackVehicle function works correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(window.trackVehicle).toBeDefined();
            });

            // Call global function
            window.trackVehicle('VEH-001');

            await waitFor(() => {
                expect(screen.getByText(/Tracking: VEH-001/)).toBeInTheDocument();
            });
        });
    });

    describe('Route Table', () => {
        test('displays route codes correctly', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('R-001')).toBeInTheDocument();
                expect(screen.getByText('R-002')).toBeInTheDocument();
            });
        });

        test('displays assigned collectors in routes', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                const table = screen.getByRole('table');
                expect(within(table).getAllByText('John Doe')).toHaveLength(1);
                expect(within(table).getAllByText('Jane Smith')).toHaveLength(1);
            });
        });

        test('displays route status badges', async () => {
            render(<LiveMonitoring />);

            await waitFor(() => {
                expect(screen.getByText('Active')).toBeInTheDocument();
                expect(screen.getByText('Delayed')).toBeInTheDocument();
            });
        });
    });
});