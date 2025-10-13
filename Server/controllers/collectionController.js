const CollectionRequest = require('../models/CollectionRequest');
const WasteBin = require('../models/WasteBin');
const User = require('../models/User');

exports.createCollectionRequest = async (req, res) => {
  try {
    const { 
      binId, 
      requestType, 
      wasteCategory, 
      scheduledDate, 
      scheduledTime, 
      notes,
      weight,
      pickupLocation
    } = req.body;

    // Validate scheduled date is in the future
    const schedDate = new Date(scheduledDate);
    if (schedDate < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Scheduled date must be in the future' 
      });
    }

    const request = new CollectionRequest({
      userId: req.user.userId,
      binId: binId || null,
      requestType: requestType || 'regular',
      wasteCategory,
      scheduledDate,
      scheduledTime,
      notes,
      weight,
      pickupLocation,
      status: 'pending'
    });

    // Calculate estimated cost
    request.calculateCost();

    await request.save();

    // Populate the request
    await request.populate('userId', 'name email address contactNumber');
    if (binId) {
      await request.populate('binId');
    }

    res.status(201).json({
      success: true,
      message: 'Collection request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Create collection request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating request', 
      error: error.message 
    });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const { status, requestType } = req.query;
    
    let query = { userId: req.user.userId };
    
    if (status) query.status = status;
    if (requestType) query.requestType = requestType;

    const requests = await CollectionRequest.find(query)
      .populate('binId')
      .populate('assignedCollector', 'name contactNumber email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching requests', 
      error: error.message 
    });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status, wasteCategory, requestType, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (wasteCategory) query.wasteCategory = wasteCategory;
    if (requestType) query.requestType = requestType;
    
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const requests = await CollectionRequest.find(query)
      .populate('userId', 'name email address contactNumber')
      .populate('binId')
      .populate('assignedCollector', 'name contactNumber email')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching requests', 
      error: error.message 
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, assignedCollector, actualCost, collectorNotes, weight } = req.body;
    
    const updateData = { status };
    
    if (assignedCollector) {
      updateData.assignedCollector = assignedCollector;
      updateData.status = 'assigned';
    }
    
    if (actualCost) updateData.actualCost = actualCost;
    if (collectorNotes) updateData.collectorNotes = collectorNotes;
    if (weight) updateData.weight = weight;
    
    if (status === 'completed') {
      updateData.completedAt = Date.now();
      
      // Update bin level to 0 if bin is associated
      const request = await CollectionRequest.findById(req.params.id);
      if (request.binId) {
        await WasteBin.findByIdAndUpdate(request.binId, {
          currentLevel: 0,
          lastCollectionDate: Date.now()
        });
      }
    }
    
    if (status === 'cancelled') {
      updateData.cancelledAt = Date.now();
    }

    const request = await CollectionRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('userId', 'name email address')
    .populate('binId')
    .populate('assignedCollector', 'name contactNumber email');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating request', 
      error: error.message 
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const request = await CollectionRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel completed request' 
      });
    }

    request.status = 'cancelled';
    request.cancelledAt = Date.now();
    request.cancellationReason = cancellationReason;

    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling request', 
      error: error.message 
    });
  }
};
