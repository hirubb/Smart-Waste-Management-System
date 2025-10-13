const Route = require('../models/Route');
const WasteBin = require('../models/WasteBin');
const User = require('../models/User');

exports.createRoute = async (req, res) => {
  try {
    const { 
      routeName, 
      routeCode, 
      area, 
      collectionPoints, 
      estimatedTime, 
      estimatedDistance,
      priority,
      scheduleDate,
      vehicleDetails
    } = req.body;

    // Check if route code exists
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
      collectionPoints: collectionPoints || [],
      estimatedTime: estimatedTime || 0,
      estimatedDistance: estimatedDistance || 0,
      priority: priority || 'medium',
      scheduleDate,
      vehicleDetails,
      status: 'active'
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
    const { area, status, priority } = req.query;
    
    let query = {};
    
    if (area) query.area = { $regex: area, $options: 'i' };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const routes = await Route.find(query)
      .populate('assignedCollector', 'name contactNumber email workload')
      .populate('collectionPoints.binId')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: routes.length,
      data: routes
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
      .populate('assignedCollector', 'name contactNumber email')
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

    if (route.status === 'in-progress' || route.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot optimize route that is in progress or completed' 
      });
    }

    // Get bin levels for prioritization
    const binIds = route.collectionPoints.map(cp => cp.binId);
    const bins = await WasteBin.find({ _id: { $in: binIds } });
    
    // Add bin levels to collection points
    route.collectionPoints.forEach(cp => {
      const bin = bins.find(b => b._id.equals(cp.binId));
      if (bin) {
        cp.binLevel = bin.currentLevel;
      }
    });

    // Optimize the route
    route.optimize();

    await route.save();

    // Populate after optimization
    await route.populate('assignedCollector', 'name contactNumber');
    await route.populate('collectionPoints.binId');

    res.json({
      success: true,
      message: 'Route optimized successfully',
      data: route
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

exports.assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;

    // Check if collector exists and has correct role
    const collector = await User.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ 
        success: false,
        message: 'Collector not found' 
      });
    }

    if (collector.role !== 'collector') {
      return res.status(400).json({ 
        success: false,
        message: 'User is not a collector' 
      });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { 
        assignedCollector: collectorId,
        status: 'assigned' 
      },
      { new: true }
    )
    .populate('assignedCollector', 'name contactNumber email')
    .populate('collectionPoints.binId');

    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    // Update collector workload
    await User.findByIdAndUpdate(collectorId, {
      $inc: { workload: 1 },
      $addToSet: { assignedRoutes: route._id }
    });

    res.json({
      success: true,
      message: 'Collector assigned successfully',
      data: route
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

    route.status = 'in-progress';
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

    route.status = 'completed';
    route.completedAt = Date.now();
    if (actualTime) route.actualTime = actualTime;
    if (actualDistance) route.actualDistance = actualDistance;

    await route.save();

    // Decrease collector workload
    if (route.assignedCollector) {
      await User.findByIdAndUpdate(route.assignedCollector, {
        $inc: { workload: -1 }
      });
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
