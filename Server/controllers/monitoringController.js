// controllers/monitoringController.js
const Route = require('../models/Route');
const Collector = require('../models/Collector');
const mongoose = require('mongoose');

/**
 * Get live dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Aggregate statistics
        const [routeStats, collectorStats] = await Promise.all([
            Route.aggregate([
                {
                    $facet: {
                        activeRoutes: [
                            { $match: { status: 'Active' } },
                            { $count: 'count' }
                        ],
                        completedToday: [
                            {
                                $match: {
                                    status: 'Completed',
                                    completedAt: { $gte: today }
                                }
                            },
                            { $count: 'count' }
                        ],
                        delayedRoutes: [
                            { $match: { status: 'Delayed' } },
                            { $count: 'count' }
                        ],
                        totalDistance: [
                            {
                                $match: {
                                    status: 'Completed',
                                    completedAt: { $gte: today }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    total: {
                                        $sum: {
                                            $toDouble: {
                                                $replaceAll: {
                                                    input: '$estimatedDistance',
                                                    find: ' km',
                                                    replacement: ''
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]),

            Collector.aggregate([
                {
                    $facet: {
                        totalCollectors: [
                            { $match: { isActive: true } },
                            { $count: 'count' }
                        ],
                        onRoute: [
                            { $match: { status: 'On Route', isActive: true } },
                            { $count: 'count' }
                        ],
                        onBreak: [
                            { $match: { status: 'On Break', isActive: true } },
                            { $count: 'count' }
                        ],
                        available: [
                            { $match: { status: 'Available', isActive: true } },
                            { $count: 'count' }
                        ]
                    }
                }
            ])
        ]);

        const stats = {
            routes: {
                active: routeStats[0].activeRoutes[0]?.count || 0,
                completedToday: routeStats[0].completedToday[0]?.count || 0,
                delayed: routeStats[0].delayedRoutes[0]?.count || 0,
                totalDistanceToday: routeStats[0].totalDistance[0]?.total || 0
            },
            collectors: {
                total: collectorStats[0].totalCollectors[0]?.count || 0,
                onRoute: collectorStats[0].onRoute[0]?.count || 0,
                onBreak: collectorStats[0].onBreak[0]?.count || 0,
                available: collectorStats[0].available[0]?.count || 0
            },
            timestamp: new Date()
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

/**
 * Get live vehicle positions
 */
exports.getLiveVehiclePositions = async (req, res) => {
    try {
        const collectors = await Collector.find({
            isActive: true,
            status: { $in: ['On Route', 'Available', 'On Break'] }
        })
            .populate('userId', 'name email contactNumber')
            .populate('assignedRoute', 'routeName routeCode area collectionPoints')
            .select('-__v')
            .lean();

        // Format vehicle positions with mock GPS coordinates
        // In production, these would come from actual GPS tracking devices
        const vehiclePositions = collectors.map((collector, index) => {
            // Generate mock coordinates around Negombo area
            const baseLat = 7.2906;
            const baseLng = 80.6337;
            const offset = 0.05;

            return {
                vehicleId: collector.vehicleId,
                collectorId: collector._id,
                collectorName: collector.userId?.name || 'Unknown',
                collectorEmail: collector.userId?.email,
                collectorPhone: collector.userId?.contactNumber,
                status: collector.status,
                vehicleType: collector.vehicleType,
                currentLocation: collector.currentLocation,
                workload: collector.workload,
                rating: collector.rating,
                assignedRoute: collector.assignedRoute ? {
                    id: collector.assignedRoute._id,
                    name: collector.assignedRoute.routeName,
                    code: collector.assignedRoute.routeCode,
                    area: collector.assignedRoute.area,
                    collectionPoints: collector.assignedRoute.collectionPoints?.length || 0
                } : null,
                // Mock GPS coordinates (replace with actual GPS data in production)
                position: {
                    latitude: baseLat + (Math.random() - 0.5) * offset,
                    longitude: baseLng + (Math.random() - 0.5) * offset,
                    accuracy: 10,
                    speed: collector.status === 'On Route' ? Math.random() * 40 : 0,
                    heading: Math.random() * 360
                },
                // Additional metrics
                completedRoutes: collector.completedRoutes,
                totalDistance: collector.totalDistance,
                lastUpdate: new Date(),
                isMoving: collector.status === 'On Route'
            };
        });

        res.json({
            success: true,
            count: vehiclePositions.length,
            data: vehiclePositions,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Live positions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching live vehicle positions',
            error: error.message
        });
    }
};

/**
 * Get active routes with real-time progress
 */
exports.getActiveRoutes = async (req, res) => {
    try {
        const activeRoutes = await Route.find({
            status: { $in: ['Active', 'Optimized'] }
        })
            .populate('assignedCollector', 'name email phone')
            .populate('collectionPoints.binId', 'location currentLevel')
            .sort({ priority: -1, startedAt: -1 })
            .lean();

        // Calculate progress for each route
        const routesWithProgress = activeRoutes.map(route => {
            const totalPoints = route.collectionPoints?.length || 0;
            const collectedPoints = route.collectionPoints?.filter(
                cp => cp.collectionStatus === 'collected'
            ).length || 0;

            const progress = totalPoints > 0 ?
                Math.round((collectedPoints / totalPoints) * 100) : 0;

            // Calculate estimated completion time
            const estimatedMinutes = parseFloat(route.estimatedTime) * 60 || 0;
            const elapsedMinutes = route.startedAt ?
                (Date.now() - new Date(route.startedAt).getTime()) / (1000 * 60) : 0;
            const remainingMinutes = Math.max(0, estimatedMinutes - elapsedMinutes);

            return {
                id: route._id,
                routeName: route.routeName,
                routeCode: route.routeCode,
                area: route.area,
                status: route.status,
                priority: route.priority,
                routeType: route.routeType,
                vehicleType: route.vehicleType,
                assignedCollector: route.assignedCollector,
                estimatedTime: route.estimatedTime,
                estimatedDistance: route.estimatedDistance,
                fuelCost: route.fuelCost,
                startedAt: route.startedAt,
                // Progress metrics
                progress: {
                    percentage: progress,
                    collected: collectedPoints,
                    total: totalPoints,
                    remaining: totalPoints - collectedPoints
                },
                // Time metrics
                timeMetrics: {
                    elapsed: Math.round(elapsedMinutes),
                    remaining: Math.round(remainingMinutes),
                    estimatedCompletion: new Date(Date.now() + remainingMinutes * 60 * 1000)
                },
                // Collection points summary
                collectionPoints: route.collectionPoints?.map(cp => ({
                    id: cp._id,
                    order: cp.order,
                    status: cp.collectionStatus,
                    location: cp.location,
                    binLevel: cp.binLevel,
                    estimatedArrivalTime: cp.estimatedArrivalTime
                })) || []
            };
        });

        res.json({
            success: true,
            count: routesWithProgress.length,
            data: routesWithProgress,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Active routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active routes',
            error: error.message
        });
    }
};

/**
 * Get collector performance metrics
 */
exports.getCollectorPerformance = async (req, res) => {
    try {
        const { collectorId } = req.params;
        const { period } = req.query; // today, week, month

        let dateFilter = {};
        const now = new Date();

        switch(period) {
            case 'today':
                dateFilter = {
                    $gte: new Date(now.setHours(0, 0, 0, 0))
                };
                break;
            case 'week':
                dateFilter = {
                    $gte: new Date(now.setDate(now.getDate() - 7))
                };
                break;
            case 'month':
                dateFilter = {
                    $gte: new Date(now.setMonth(now.getMonth() - 1))
                };
                break;
            default:
                dateFilter = {
                    $gte: new Date(now.setHours(0, 0, 0, 0))
                };
        }

        const collector = await Collector.findById(collectorId)
            .populate('userId', 'name email');

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: 'Collector not found'
            });
        }

        // Get completed routes in the period
        const completedRoutes = await Route.find({
            assignedCollector: collectorId,
            status: 'Completed',
            completedAt: dateFilter
        }).lean();

        // Calculate performance metrics
        const totalRoutes = completedRoutes.length;
        const totalDistance = completedRoutes.reduce((sum, route) => {
            const distance = parseFloat(route.actualDistance || route.estimatedDistance) || 0;
            return sum + distance;
        }, 0);

        const avgTime = completedRoutes.reduce((sum, route) => {
            const time = parseFloat(route.actualTime || route.estimatedTime) || 0;
            return sum + time;
        }, 0) / (totalRoutes || 1);

        const performance = {
            collector: {
                id: collector._id,
                name: collector.userId?.name,
                email: collector.userId?.email,
                vehicleId: collector.vehicleId,
                vehicleType: collector.vehicleType,
                currentStatus: collector.status,
                rating: collector.rating
            },
            metrics: {
                routesCompleted: totalRoutes,
                totalDistance: Math.round(totalDistance * 10) / 10,
                averageTime: Math.round(avgTime * 10) / 10,
                currentWorkload: collector.workload,
                totalCompletedAllTime: collector.completedRoutes
            },
            routes: completedRoutes.map(route => ({
                id: route._id,
                name: route.routeName,
                completedAt: route.completedAt,
                distance: route.actualDistance || route.estimatedDistance,
                time: route.actualTime || route.estimatedTime
            })),
            period: period || 'today'
        };

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        console.error('Collector performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collector performance',
            error: error.message
        });
    }
};

/**
 * Update vehicle location (for GPS tracking)
 */
exports.updateVehicleLocation = async (req, res) => {
    try {
        const { collectorId } = req.params;
        const { latitude, longitude, speed, heading, accuracy } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const collector = await Collector.findById(collectorId);

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: 'Collector not found'
            });
        }

        // Store location update (you might want a separate Location collection for history)
        // For now, we'll just update the current location description
        // In production, you'd store GPS coordinates in a tracking collection

        collector.currentLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        collector.lastLocationUpdate = Date.now();
        await collector.save();

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: {
                collectorId: collector._id,
                vehicleId: collector.vehicleId,
                location: {
                    latitude,
                    longitude,
                    speed,
                    heading,
                    accuracy
                },
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle location',
            error: error.message
        });
    }
};

/**
 * Get route tracking details
 */
exports.getRouteTracking = async (req, res) => {
    try {
        const { routeId } = req.params;

        const route = await Route.findById(routeId)
            .populate('assignedCollector')
            .populate('collectionPoints.binId')
            .lean();

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Get collector details if assigned
        let collectorDetails = null;
        if (route.assignedCollector) {
            const collector = await Collector.findOne({
                userId: route.assignedCollector
            }).populate('userId', 'name email contactNumber');

            if (collector) {
                collectorDetails = {
                    id: collector._id,
                    name: collector.userId?.name,
                    vehicleId: collector.vehicleId,
                    vehicleType: collector.vehicleType,
                    status: collector.status,
                    currentLocation: collector.currentLocation,
                    phone: collector.userId?.contactNumber
                };
            }
        }

        const tracking = {
            route: {
                id: route._id,
                name: route.routeName,
                code: route.routeCode,
                area: route.area,
                status: route.status,
                priority: route.priority,
                startedAt: route.startedAt,
                estimatedTime: route.estimatedTime,
                estimatedDistance: route.estimatedDistance
            },
            collector: collectorDetails,
            collectionPoints: route.collectionPoints.map((cp, index) => ({
                order: cp.order || index + 1,
                location: cp.location,
                status: cp.collectionStatus,
                binLevel: cp.binLevel,
                estimatedArrival: cp.estimatedArrivalTime,
                actualArrival: cp.actualArrivalTime,
                binId: cp.binId?._id
            })),
            progress: {
                completed: route.collectionPoints.filter(cp => cp.collectionStatus === 'collected').length,
                total: route.collectionPoints.length
            }
        };

        res.json({
            success: true,
            data: tracking
        });
    } catch (error) {
        console.error('Route tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching route tracking',
            error: error.message
        });
    }
};

/**
 * Get alerts and notifications
 */
exports.getAlerts = async (req, res) => {
    try {
        const alerts = [];

        // Check for delayed routes
        const delayedRoutes = await Route.find({
            status: 'Delayed'
        })
            .populate('assignedCollector', 'name')
            .limit(10)
            .lean();

        delayedRoutes.forEach(route => {
            alerts.push({
                type: 'warning',
                category: 'route_delayed',
                title: 'Route Delayed',
                message: `Route ${route.routeName} is experiencing delays`,
                routeId: route._id,
                timestamp: new Date()
            });
        });

        // Check for high workload collectors
        const overloadedCollectors = await Collector.find({
            isActive: true
        }).lean();

        overloadedCollectors.forEach(collector => {
            const workloadValue = parseInt(collector.workload) || 0;
            if (workloadValue > 80) {
                alerts.push({
                    type: 'danger',
                    category: 'high_workload',
                    title: 'High Workload Alert',
                    message: `Collector ${collector.vehicleId} has ${collector.workload} workload`,
                    collectorId: collector._id,
                    timestamp: new Date()
                });
            }
        });

        // Check for vehicles on break for too long (mock - you'd track actual break times)
        const onBreak = await Collector.find({
            status: 'On Break',
            isActive: true
        }).lean();

        onBreak.forEach(collector => {
            alerts.push({
                type: 'info',
                category: 'on_break',
                title: 'Vehicle On Break',
                message: `${collector.vehicleId} is currently on break`,
                collectorId: collector._id,
                timestamp: new Date()
            });
        });

        res.json({
            success: true,
            count: alerts.length,
            data: alerts.sort((a, b) => b.timestamp - a.timestamp)
        });
    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts',
            error: error.message
        });
    }
};