const WasteBin = require('../models/WasteBin');
const Alert = require('../models/Alert');

exports.createBin = async (req, res) => {
  try {
    const { binId, capacity, wasteType, location, alertThreshold, collectionFrequency } = req.body;

    // Check if bin ID already exists
    const existingBin = await WasteBin.findOne({ binId });
    if (existingBin) {
      return res.status(400).json({ 
        success: false,
        message: 'Bin with this ID already exists' 
      });
    }

    const bin = new WasteBin({
      userId: req.user.userId,
      binId,
      capacity,
      wasteType: wasteType || 'general',
      location,
      alertThreshold: alertThreshold || 80,
      collectionFrequency: collectionFrequency || 'weekly',
      currentLevel: 0
    });

    await bin.save();

    res.status(201).json({
      success: true,
      message: 'Waste bin created successfully',
      data: bin
    });
  } catch (error) {
    console.error('Create bin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating bin', 
      error: error.message 
    });
  }
};

exports.getUserBins = async (req, res) => {
  try {
    const bins = await WasteBin.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    console.error('Get user bins error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bins', 
      error: error.message 
    });
  }
};

exports.getAllBins = async (req, res) => {
  try {
    const { area, wasteType, status, minLevel } = req.query;
    
    let query = {};
    
    if (area) query['location.address'] = { $regex: area, $options: 'i' };
    if (wasteType) query.wasteType = wasteType;
    if (status) query.deviceStatus = status;
    if (minLevel) query.currentLevel = { $gte: parseInt(minLevel) };

    const bins = await WasteBin.find(query)
      .populate('userId', 'name email address contactNumber')
      .sort({ currentLevel: -1 });

    res.json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    console.error('Get all bins error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bins', 
      error: error.message 
    });
  }
};

exports.getBinById = async (req, res) => {
  try {
    const bin = await WasteBin.findById(req.params.id)
      .populate('userId', 'name email address contactNumber');
      
    if (!bin) {
      return res.status(404).json({ 
        success: false,
        message: 'Bin not found' 
      });
    }

    res.json({
      success: true,
      data: bin
    });
  } catch (error) {
    console.error('Get bin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bin', 
      error: error.message 
    });
  }
};

exports.updateBinLevel = async (req, res) => {
  try {
    const { currentLevel } = req.body;

    if (currentLevel < 0 || currentLevel > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Current level must be between 0 and 100' 
      });
    }

    const bin = await WasteBin.findByIdAndUpdate(
      req.params.id,
      { 
        currentLevel, 
        lastUpdated: Date.now() 
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!bin) {
      return res.status(404).json({ 
        success: false,
        message: 'Bin not found' 
      });
    }

    // Create alert if level exceeds threshold
    if (bin.needsCollection()) {
      const existingAlert = await Alert.findOne({
        binId: bin._id,
        isResolved: false,
        alertType: { $in: ['level-warning', 'level-critical'] }
      });

      if (!existingAlert) {
        const alertType = currentLevel >= 90 ? 'level-critical' : 'level-warning';
        const severity = currentLevel >= 90 ? 'critical' : 'high';
        
        await Alert.create({
          binId: bin._id,
          userId: bin.userId,
          alertType,
          severity,
          message: `Bin ${bin.binId} is ${currentLevel}% full. Collection recommended.`
        });
      }
    }

    res.json({
      success: true,
      message: 'Bin level updated successfully',
      data: bin,
      needsCollection: bin.needsCollection()
    });
  } catch (error) {
    console.error('Update bin level error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating bin level', 
      error: error.message 
    });
  }
};

exports.deleteBin = async (req, res) => {
  try {
    const bin = await WasteBin.findByIdAndDelete(req.params.id);
    
    if (!bin) {
      return res.status(404).json({ 
        success: false,
        message: 'Bin not found' 
      });
    }

    res.json({
      success: true,
      message: 'Bin deleted successfully'
    });
  } catch (error) {
    console.error('Delete bin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting bin', 
      error: error.message 
    });
  }
};
