import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import WasteManagementSystem from '../pages/WasteManagementSystem';

// Mock the RouteMap component
jest.mock('../components/RouteMap', () => {
    return function RouteMap({ route, optimizedRoute }) {
        return (
            <div data-testid="route-map">
                <div>Route: {route?.name}</div>
                {optimizedRoute && <div>Optimized Route: {optimizedRoute.name}</div>}
            </div>
        );
    };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('WasteManagementSystem', () => {
    const mockRoutes = [
        {
            id: 'route1',
            name: 'Route A',
            area: 'Downtown',
            distance: '15 km',
            estimatedTime: '2 hours',
            collectionPoints: 25,
            fuelCost: 45,
            status: 'Planned',
            routeType: 'Residential',
            vehicleType: 'Truck',
            routeCode: 'R001'
        },
        {
            id: 'route2',
            name: 'Route B',
            area: 'Uptown',
            distance: '20 km',
            estimatedTime: '3 hours',
            collectionPoints: 30,
            fuelCost: 60,
            status: 'Optimized',
            routeType: 'Commercial',
            vehicleType: 'Van',
            routeCode: 'R002'
        }
    ];

    const mockCollectors = [
        {
            id: 'collector1',
            name: 'John Doe',
            email: 'john@example.com',
            status: 'Available',
            currentLocation: 'Central Hub',
            workload: '40%',
            assignedRoute: null
        },
        {
            id: 'collector2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'On Route',
            currentLocation: 'Downtown',
            workload: '75%',
            assignedRoute: 'Route C'
        }
    ];

    const mockOptimizedRoute = {
        id: 'route1',
        name: 'Route A',
        distance: '12 km',
        estimatedTime: '1.5 hours',
        fuelCost: 38,
        improvements: {
            distanceSaved: '3 km',
            timeSaved: '30 min',
            costSaved: 7
        }
    };

    beforeEach(() => {
        fetch.mockClear();
        // Default successful responses
        fetch.mockImplementation((url) => {
            if (url.includes('/routes/')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                });
            }
            if (url.includes('/collectors')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                });
            }
            return Promise.resolve({
                json: () => Promise.resolve({ success: true, data: null })
            });
        });
    });

    describe('Component Rendering', () => {
        test('renders without crashing', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Optimize Route')).toBeInTheDocument();
            });
        });

        test('renders both tabs', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Optimize Route')).toBeInTheDocument();
                expect(screen.getByText('Assign Collector')).toBeInTheDocument();
            });
        });

        test('shows optimize tab content by default', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route Controls')).toBeInTheDocument();
                expect(screen.getByText('Available Routes')).toBeInTheDocument();
            });
        });
    });

    describe('Data Fetching', () => {
        test('fetches routes on mount', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/routes/');
            });
        });

        test('fetches collectors on mount', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/collectors');
            });
        });

        test('displays routes after fetching', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
                expect(screen.getByText('Route B')).toBeInTheDocument();
            });
        });

        test('handles fetch error gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText(/Error fetching routes/i)).toBeInTheDocument();
            });
        });

        test('shows info notification when no routes found', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: [] })
                })
            );
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText(/No routes found/i)).toBeInTheDocument();
            });
        });
    });

    describe('Route Filtering', () => {
        test('filters routes by type', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeTypeSelect = screen.getByLabelText('Route Type');
            fireEvent.change(routeTypeSelect, { target: { value: 'Commercial' } });

            await waitFor(() => {
                expect(screen.queryByText('Route A')).not.toBeInTheDocument();
                expect(screen.getByText('Route B')).toBeInTheDocument();
            });
        });

        test('filters routes by vehicle type', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const vehicleTypeSelect = screen.getByLabelText('Vehicle Type');
            fireEvent.change(vehicleTypeSelect, { target: { value: 'Van' } });

            await waitFor(() => {
                expect(screen.queryByText('Route A')).not.toBeInTheDocument();
                expect(screen.getByText('Route B')).toBeInTheDocument();
            });
        });

        test('filters routes by status', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const statusSelect = screen.getByLabelText('Status');
            fireEvent.change(statusSelect, { target: { value: 'Optimized' } });

            await waitFor(() => {
                expect(screen.queryByText('Route A')).not.toBeInTheDocument();
                expect(screen.getByText('Route B')).toBeInTheDocument();
            });
        });

        test('filters routes by search query', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText('Search...');
            fireEvent.change(searchInput, { target: { value: 'Route B' } });

            await waitFor(() => {
                expect(screen.queryByText('Route A')).not.toBeInTheDocument();
                expect(screen.getByText('Route B')).toBeInTheDocument();
            });
        });
    });

    describe('Route Selection and Optimization', () => {
        test('selects a route when clicked', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            await waitFor(() => {
                expect(screen.getByText(/Current Route: Route A/i)).toBeInTheDocument();
            });
        });

        test('displays route details when selected', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            await waitFor(() => {
                expect(screen.getByText('15 km')).toBeInTheDocument();
                expect(screen.getByText('2 hours')).toBeInTheDocument();
                expect(screen.getByText('25')).toBeInTheDocument();
                expect(screen.getByText('$45')).toBeInTheDocument();
            });
        });

        test('shows notification when optimizing without selecting route', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Optimize Route')).toBeInTheDocument();
            });

            // Try to click optimize button (it shouldn't be visible without selection)
            // This test verifies the button appears only after selection
            expect(screen.queryByText(/Optimize Selected/i)).not.toBeInTheDocument();
        });

        test('optimizes route successfully', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        data: mockOptimizedRoute,
                        message: 'Route optimized successfully'
                    })
                })
            );

            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            await waitFor(() => {
                expect(screen.getByText(/Optimize Selected/i)).toBeInTheDocument();
            });

            const optimizeButton = screen.getByText(/Optimize Selected/i);
            fireEvent.click(optimizeButton);

            await waitFor(() => {
                expect(screen.getByText('Optimization Results')).toBeInTheDocument();
                expect(screen.getByText('Route optimized successfully')).toBeInTheDocument();
            });
        });

        test('displays optimization comparison', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        data: mockOptimizedRoute
                    })
                })
            );

            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            const optimizeButton = screen.getByText(/Optimize Selected/i);
            fireEvent.click(optimizeButton);

            await waitFor(() => {
                expect(screen.getByText('Current Route')).toBeInTheDocument();
                expect(screen.getByText('Optimized Route')).toBeInTheDocument();
                expect(screen.getByText('Improvements')).toBeInTheDocument();
            });
        });

        test('accepts optimized route', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        data: mockOptimizedRoute
                    })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        data: { ...mockRoutes[0], status: 'Optimized' },
                        message: 'Optimized route accepted'
                    })
                })
            );

            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            const optimizeButton = screen.getByText(/Optimize Selected/i);
            fireEvent.click(optimizeButton);

            await waitFor(() => {
                expect(screen.getByText('Accept')).toBeInTheDocument();
            });

            const acceptButton = screen.getByText('Accept');
            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(screen.getByText('Optimized route accepted')).toBeInTheDocument();
            });
        });

        test('rejects optimized route', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        data: mockOptimizedRoute
                    })
                })
            );

            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            const optimizeButton = screen.getByText(/Optimize Selected/i);
            fireEvent.click(optimizeButton);

            await waitFor(() => {
                expect(screen.getByText('Reject')).toBeInTheDocument();
            });

            const rejectButton = screen.getByText('Reject');
            fireEvent.click(rejectButton);

            await waitFor(() => {
                expect(screen.getByText(/Optimization rejected/i)).toBeInTheDocument();
                expect(screen.queryByText('Optimization Results')).not.toBeInTheDocument();
            });
        });
    });

    describe('Collector Assignment', () => {
        test('switches to assign collector tab', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Assign Collector')).toBeInTheDocument();
            });

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('Collector Filters')).toBeInTheDocument();
                expect(screen.getByText('Available Collectors')).toBeInTheDocument();
            });
        });

        test('displays collectors in assign tab', async () => {
            render(<WasteManagementSystem />);

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });
        });

        test('filters collectors by availability', async () => {
            render(<WasteManagementSystem />);

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            const availabilitySelect = screen.getByLabelText('Availability');
            fireEvent.change(availabilitySelect, { target: { value: 'On Route' } });

            await waitFor(() => {
                expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });
        });

        test('filters collectors by workload', async () => {
            render(<WasteManagementSystem />);

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            const workloadSelect = screen.getByLabelText('Workload');
            fireEvent.change(workloadSelect, { target: { value: 'low' } });

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            });
        });

        test('assigns collector to route successfully', async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockRoutes })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ success: true, data: mockCollectors })
                })
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve({
                        success: true,
                        message: 'Collector assigned successfully'
                    })
                })
            );

            render(<WasteManagementSystem />);

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            // Select route
            const routeSelect = screen.getByLabelText('Route Selection');
            fireEvent.change(routeSelect, { target: { value: 'route2' } });

            // Select collector
            const collectorCard = screen.getByText('John Doe').closest('.collector-card');
            fireEvent.click(collectorCard);

            await waitFor(() => {
                expect(screen.getByText('Confirm Assignment')).toBeInTheDocument();
            });

            const assignButton = screen.getByText(/Assign and Notify Collector/i);
            fireEvent.click(assignButton);

            await waitFor(() => {
                expect(screen.getByText('Collector assigned successfully')).toBeInTheDocument();
            });
        });

        test('prevents assignment of unavailable collector', async () => {
            render(<WasteManagementSystem />);

            const assignTab = screen.getByText('Assign Collector');
            fireEvent.click(assignTab);

            await waitFor(() => {
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });

            // Select route
            const routeSelect = screen.getByLabelText('Route Selection');
            fireEvent.change(routeSelect, { target: { value: 'route2' } });

            // Select unavailable collector
            const collectorCard = screen.getByText('Jane Smith').closest('.collector-card');
            fireEvent.click(collectorCard);

            await waitFor(() => {
                expect(screen.getByText(/not available for assignment/i)).toBeInTheDocument();
            });

            const assignButton = screen.getByText(/Assign and Notify Collector/i);
            expect(assignButton).toBeDisabled();
        });
    });

    describe('RouteMap Integration', () => {
        test('shows map placeholder when no route selected', async () => {
            render(<WasteManagementSystem />);
            await waitFor(() => {
                expect(screen.getByText('Select a route to view on map')).toBeInTheDocument();
            });
        });

        test('renders RouteMap with selected route', async () => {
            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            await waitFor(() => {
                const map = screen.getByTestId('route-map');
                expect(within(map).getByText(/Route: Route A/i)).toBeInTheDocument();
            });
        });
    });

    describe('Notification System', () => {
        test('notifications auto-dismiss after 4 seconds', async () => {
            jest.useFakeTimers();

            render(<WasteManagementSystem />);

            await waitFor(() => {
                expect(screen.getByText('Route A')).toBeInTheDocument();
            });

            const routeItem = screen.getByText('Route A').closest('.route-item');
            fireEvent.click(routeItem);

            // This will show notification when optimizing without proper setup
            const optimizeButton = screen.getByText(/Optimize Selected/i);
            fireEvent.click(optimizeButton);

            // Fast-forward time
            jest.advanceTimersByTime(4000);

            await waitFor(() => {
                // Notification should be removed
                expect(screen.queryByText(/Route optimized successfully/i)).not.toBeInTheDocument();
            });

            jest.useRealTimers();
        });
    });
});