const Route = require('../models/Route');
const WasteBin = require('../models/WasteBin');
const User = require('../models/User');
const Collector = require('../models/Collector');

exports.createRoute = async (req, res) => {
  try {
    const {
      routeName,
      routeCode,
      area,
      routeType,
      vehicleType,
      collectionPoints,
      estimatedTime,
      estimatedDistance,
      fuelCost,
      priority,
      scheduleDate,
      vehicleDetails
    } = req.body;

    const existingRoute = await Route.findOne({ routeCode });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route with this code already exists'
      });
    }

    const route = new Route({
      routeName,
      routeCode,
      area,
      routeType: routeType || 'Residential',
      vehicleType: vehicleType || 'Truck',
      collectionPoints: collectionPoints || [],
      estimatedTime: estimatedTime || '0h',
      estimatedDistance: estimatedDistance || '0 km',
      fuelCost: fuelCost || '0.00',
      priority: priority || 'Medium',
      scheduleDate,
      vehicleDetails,
      status: 'Planned'
    });

    await route.save();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const { area, status, priority, routeType, vehicleType } = req.query;

    let query = {};

    if (area) query.area = { $regex: area, $options: 'i' };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (routeType) query.routeType = routeType;
    if (vehicleType) query.vehicleType = vehicleType;

    const routes = await Route.find(query)
        .populate('assignedCollector', 'name email phone')
        .populate('collectionPoints.binId')
        .sort({ priority: -1, createdAt: -1 });

    // Format routes for frontend
    const formattedRoutes = routes.map(route => ({
      id: route._id,
      name: route.routeName,
      routeCode: route.routeCode,
      area: route.area,
      routeType: route.routeType,
      vehicleType: route.vehicleType,
      status: route.status,
      collectionPoints: route.collectionPoints.length,
      distance: route.estimatedDistance,
      estimatedTime: route.estimatedTime,
      fuelCost: route.fuelCost,
      priority: route.priority,
      assignedCollector: route.assignedCollector,
      scheduleDate: route.scheduleDate,
      improvements: route.improvements,
      createdAt: route.createdAt
    }));

    res.json({
      success: true,
      count: formattedRoutes.length,
      data: formattedRoutes
    });
  } catch (error) {
    console.error('Get all routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
        .populate('assignedCollector', 'name email phone')
        .populate('collectionPoints.binId');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
};

exports.optimizeRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (route.status === 'Active' || route.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot optimize route that is active or completed'
      });
    }

    // Get bin levels for prioritization if bins exist
    if (route.collectionPoints.length > 0) {
      const binIds = route.collectionPoints.map(cp => cp.binId).filter(id => id);
      if (binIds.length > 0) {
        const bins = await WasteBin.find({ _id: { $in: binIds } });
        route.collectionPoints.forEach(cp => {
          const bin = bins.find(b => b._id.equals(cp.binId));
          if (bin) {
            cp.binLevel = bin.currentLevel;
          }
        });
      }
    }

    // Optimize the route
    route.optimize();
    await route.save();

    // Populate after optimization
    await route.populate('assignedCollector', 'name email phone');
    await route.populate('collectionPoints.binId');

    // Format response to match frontend expectations
    const optimizedRoute = {
      id: route._id,
      name: route.routeName,
      routeCode: route.routeCode,
      area: route.area,
      routeType: route.routeType,
      vehicleType: route.vehicleType,
      status: route.status,
      collectionPoints: route.collectionPoints.length,
      distance: route.estimatedDistance,
      estimatedTime: route.estimatedTime,
      fuelCost: route.fuelCost,
      priority: route.priority,
      improvements: route.improvements,
      optimizedAt: route.optimizedAt,
      _id: route._id,
      routeName: route.routeName
    };

    res.json({
      success: true,
      message: 'Route optimized successfully',
      data: optimizedRoute
    });
  } catch (error) {
    console.error('Optimize route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing route',
      error: error.message
    });
  }
};

exports.acceptOptimizedRoute = async (req, res) => {
  try {
    // Simply update the status to Optimized
    // The route data is already optimized from the optimize() method
    const route = await Route.findByIdAndUpdate(
        req.params.id,
        {
          status: 'Optimized'
          // Don't spread req.body - it might contain incompatible data
        },
        { new: true, runValidators: true }
    )
        .populate('assignedCollector', 'name email phone')
        .populate('collectionPoints.binId');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Format response to match frontend expectations
    const formattedRoute = {
      id: route._id,
      name: route.routeName,
      routeCode: route.routeCode,
      area: route.area,
      routeType: route.routeType,
      vehicleType: route.vehicleType,
      status: route.status,
      collectionPoints: route.collectionPoints.length,
      distance: route.estimatedDistance,
      estimatedTime: route.estimatedTime,
      fuelCost: route.fuelCost,
      priority: route.priority,
      assignedCollector: route.assignedCollector,
      scheduleDate: route.scheduleDate,
      improvements: route.improvements,
      optimizedAt: route.optimizedAt,
      createdAt: route.createdAt
    };

    res.json({
      success: true,
      message: 'Optimized route accepted',
      data: formattedRoute
    });
  } catch (error) {
    console.error('Accept route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting route',
      error: error.message
    });
  }
};

exports.assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;

    // Validate input
    if (!collectorId) {
      return res.status(400).json({
        success: false,
        message: 'Collector ID is required'
      });
    }

    // Check if collector exists
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // Check collector availability
    if (collector.status === 'On Route') {
      return res.status(400).json({
        success: false,
        message: 'Collector is already on a route'
      });
    }

    // Find and update route
    const route = await Route.findByIdAndUpdate(
        req.params.id,
        {
          assignedCollector: collectorId,
          status: 'Active'
        },
        { new: true, runValidators: true }
    )
        .populate('assignedCollector', 'name email phone')
        .populate('collectionPoints.binId');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Update collector
    collector.assignedRoute = route._id;
    collector.status = 'On Route';
    const currentWorkload = parseInt(collector.workload) || 0;
    collector.workload = `${Math.min(100, currentWorkload + 20)}%`;
    await collector.save();

    // Format response
    const formattedRoute = {
      id: route._id,
      name: route.routeName,
      routeCode: route.routeCode,
      area: route.area,
      routeType: route.routeType,
      vehicleType: route.vehicleType,
      status: route.status,
      collectionPoints: route.collectionPoints.length,
      distance: route.estimatedDistance,
      estimatedTime: route.estimatedTime,
      fuelCost: route.fuelCost,
      priority: route.priority,
      assignedCollector: route.assignedCollector,
      scheduleDate: route.scheduleDate,
      improvements: route.improvements,
      createdAt: route.createdAt
    };

    res.json({
      success: true,
      message: 'Collector assigned successfully and notified',
      data: formattedRoute
    });
  } catch (error) {
    console.error('Assign collector error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning collector',
      error: error.message
    });
  }
};

exports.startRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (!route.assignedCollector) {
      return res.status(400).json({
        success: false,
        message: 'Route must have an assigned collector'
      });
    }

    route.status = 'Active';
    route.startedAt = Date.now();
    await route.save();

    res.json({
      success: true,
      message: 'Route started successfully',
      data: route
    });
  } catch (error) {
    console.error('Start route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting route',
      error: error.message
    });
  }
};

exports.completeRoute = async (req, res) => {
  try {
    const { actualTime, actualDistance } = req.body;

    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    route.status = 'Completed';
    route.completedAt = Date.now();
    if (actualTime) route.actualTime = actualTime;
    if (actualDistance) route.actualDistance = actualDistance;
    await route.save();

    // Update collector workload
    if (route.assignedCollector) {
      const collector = await Collector.findById(route.assignedCollector);
      if (collector) {
        const currentWorkload = parseInt(collector.workload) || 0;
        collector.workload = `${Math.max(0, currentWorkload - 20)}%`;
        collector.status = 'Available';
        collector.assignedRoute = null;
        collector.completedRoutes += 1;
        await collector.save();
      }
    }

    res.json({
      success: true,
      message: 'Route completed successfully',
      data: route
    });
  } catch (error) {
    console.error('Complete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing route',
      error: error.message
    });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
};