const Dustbin = require('../models/Dustbin');
const Notification = require('../models/Notification');

// Get all dustbins
exports.getAllDustbins = async (req, res) => {
  try {
    const dustbins = await Dustbin.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Dustbins retrieved successfully',
      dustbins
    });
  } catch (error) {
    console.error('Error fetching dustbins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dustbins',
      error: error.message
    });
  }
};

// Get single dustbin by ID
exports.getDustbinById = async (req, res) => {
  try {
    const dustbin = await Dustbin.findById(req.params.id)
      .populate('addedBy', 'name email');

    if (!dustbin) {
      return res.status(404).json({
        success: false,
        message: 'Dustbin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dustbin retrieved successfully',
      dustbin
    });
  } catch (error) {
    console.error('Error fetching dustbin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dustbin',
      error: error.message
    });
  }
};

// Create new dustbin
exports.createDustbin = async (req, res) => {
  try {
    const { binId, location, fillPercentage, latitude, longitude, binType, locationZone, collectionRoute } = req.body;

    // Check if bin ID already exists
    const existingBin = await Dustbin.findOne({ binId });
    if (existingBin) {
      return res.status(400).json({
        success: false,
        message: 'Bin ID already exists'
      });
    }

    const dustbin = new Dustbin({
      binId,
      location,
      fillPercentage,
      latitude,
      longitude,
      binType,
      locationZone,
      collectionRoute,
      addedBy: req.user ? req.user._id : null
    });

    await dustbin.save();

    // Create notification if bin is Full or Overflow
    if (dustbin.fillPercentage > 75) {
      const notificationType = dustbin.fillPercentage > 100 ? 'OVERFLOW' : 'FULL';
      const severity = dustbin.fillPercentage > 100 ? 'critical' : 'warning';
      
      await Notification.create({
        title: `${notificationType} ALERT`,
        message: `Bin ${dustbin.binId} at ${dustbin.location} is ${notificationType.toLowerCase()} (${dustbin.fillPercentage}%). ${dustbin.fillPercentage > 100 ? 'Immediate attention required!' : 'Collection needed soon.'}`,
        type: 'dustbin',
        severity: severity,
        relatedId: dustbin._id.toString(),
        binId: dustbin.binId,
        location: dustbin.location,
        fillPercentage: dustbin.fillPercentage,
        userId: req.user ? req.user._id : null
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dustbin created successfully',
      dustbin
    });
  } catch (error) {
    console.error('Error creating dustbin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating dustbin',
      error: error.message
    });
  }
};

// Update dustbin
exports.updateDustbin = async (req, res) => {
  try {
    const { binId, location, fillPercentage, latitude, longitude, binType, locationZone, collectionRoute } = req.body;

    let dustbin = await Dustbin.findById(req.params.id);

    if (!dustbin) {
      return res.status(404).json({
        success: false,
        message: 'Dustbin not found'
      });
    }

    // Check if binId is being changed and if it already exists
    if (binId && binId !== dustbin.binId) {
      const existingBin = await Dustbin.findOne({ binId });
      if (existingBin) {
        return res.status(400).json({
          success: false,
          message: 'Bin ID already exists'
        });
      }
    }

    // Update fields
    dustbin.binId = binId || dustbin.binId;
    dustbin.location = location || dustbin.location;
    dustbin.fillPercentage = fillPercentage !== undefined ? fillPercentage : dustbin.fillPercentage;
    dustbin.latitude = latitude !== undefined ? latitude : dustbin.latitude;
    dustbin.longitude = longitude !== undefined ? longitude : dustbin.longitude;
    dustbin.binType = binType !== undefined ? binType : dustbin.binType;
    dustbin.locationZone = locationZone !== undefined ? locationZone : dustbin.locationZone;
    dustbin.collectionRoute = collectionRoute !== undefined ? collectionRoute : dustbin.collectionRoute;

    await dustbin.save();

    // Create notification if bin is Full or Overflow
    if (dustbin.fillPercentage > 75) {
      const notificationType = dustbin.fillPercentage > 100 ? 'OVERFLOW' : 'FULL';
      const severity = dustbin.fillPercentage > 100 ? 'critical' : 'warning';
      
      await Notification.create({
        title: `${notificationType} ALERT`,
        message: `Bin ${dustbin.binId} at ${dustbin.location} is ${notificationType.toLowerCase()} (${dustbin.fillPercentage}%). ${dustbin.fillPercentage > 100 ? 'Immediate attention required!' : 'Collection needed soon.'}`,
        type: 'dustbin',
        severity: severity,
        relatedId: dustbin._id.toString(),
        binId: dustbin.binId,
        location: dustbin.location,
        fillPercentage: dustbin.fillPercentage,
        userId: req.user ? req.user._id : null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dustbin updated successfully',
      dustbin
    });
  } catch (error) {
    console.error('Error updating dustbin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating dustbin',
      error: error.message
    });
  }
};

// Delete dustbin
exports.deleteDustbin = async (req, res) => {
  try {
    const dustbin = await Dustbin.findById(req.params.id);

    if (!dustbin) {
      return res.status(404).json({
        success: false,
        message: 'Dustbin not found'
      });
    }

    await dustbin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Dustbin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dustbin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dustbin',
      error: error.message
    });
  }
};

// Get dustbins by status
exports.getDustbinsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const dustbins = await Dustbin.find({ status })
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `${status} dustbins retrieved successfully`,
      dustbins
    });
  } catch (error) {
    console.error('Error fetching dustbins by status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dustbins',
      error: error.message
    });
  }
};

