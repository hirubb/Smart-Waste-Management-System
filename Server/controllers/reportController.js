const CollectionRequest = require('../models/CollectionRequest');
const WasteBin = require('../models/WasteBin');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Report = require('../models/Report');

exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ 
        success: false,
        message: 'Month and year are required' 
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all collections for the period
    const collections = await CollectionRequest.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'address').populate('binId');

    // Get all bins
    const bins = await WasteBin.find();

    // Get payments for the period
    const payments = await Payment.find({
      paymentDate: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    });

    // Calculate statistics
    const totalCollections = collections.length;
    const completedCollections = collections.filter(c => c.status === 'completed').length;
    const pendingCollections = collections.filter(c => c.status === 'pending').length;
    const cancelledCollections = collections.filter(c => c.status === 'cancelled').length;

    // Waste by type
    const wasteByType = collections.reduce((acc, curr) => {
      acc[curr.wasteCategory] = (acc[curr.wasteCategory] || 0) + 1;
      return acc;
    }, {});

    // Total waste collected (sum of weights)
    const totalWasteCollected = collections
      .filter(c => c.weight)
      .reduce((sum, c) => sum + c.weight, 0);

    // Area statistics
    const areaStats = collections.reduce((acc, curr) => {
      const area = curr.userId?.address || 'Unknown';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    // High waste areas
    const highWasteAreas = Object.entries(areaStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({ 
        area, 
        totalCollections: count,
        wasteVolume: Math.round(count * 50) // Estimated
      }));

    // Revenue generated
    const revenueGenerated = payments.reduce((sum, p) => sum + p.amount, 0);

    // Average collection time
    const completedWithTime = collections.filter(c => c.completedAt && c.createdAt);
    const averageCollectionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, c) => {
          return sum + (new Date(c.completedAt) - new Date(c.createdAt));
        }, 0) / completedWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const report = {
      period: { month: parseInt(month), year: parseInt(year) },
      summary: {
        totalCollections,
        completedCollections,
        pendingCollections,
        cancelledCollections,
        totalBins: bins.length,
        activeBins: bins.filter(b => b.deviceStatus === 'active').length,
        totalWasteCollected: Math.round(totalWasteCollected),
        revenueGenerated: Math.round(revenueGenerated)
      },
      wasteByType,
      highWasteAreas,
      trends: {
        dailyAverage: (totalCollections / 30).toFixed(2),
        completionRate: totalCollections > 0 
          ? ((completedCollections / totalCollections) * 100).toFixed(2)
          : 0,
        averageCollectionTime: averageCollectionTime.toFixed(2)
      },
      recommendations: [
        highWasteAreas.length > 0 
          ? `Focus on ${highWasteAreas[0].area} - highest waste generation area`
          : 'Maintain current collection frequency',
        completedCollections < totalCollections * 0.8
          ? 'Increase collector availability to improve completion rate'
          : 'Collection efficiency is good',
        bins.filter(b => b.currentLevel > 80).length > 10
          ? 'Multiple bins need urgent collection'
          : 'Bin levels are manageable'
      ]
    };

    // Save report to database
    const savedReport = await Report.create({
      reportType: 'monthly',
      generatedBy: req.user.userId,
      period: {
        month: parseInt(month),
        year: parseInt(year),
        startDate,
        endDate
      },
      data: {
        totalCollections,
        completedCollections,
        pendingCollections,
        cancelledCollections,
        totalWasteCollected,
        wasteByType: new Map(Object.entries(wasteByType)),
        areaStats: new Map(Object.entries(areaStats)),
        revenueGenerated,
        averageCollectionTime
      },
      highWasteAreas,
      recommendations: report.recommendations,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Monthly report generated successfully',
      data: report,
      reportId: savedReport._id
    });
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating report', 
      error: error.message 
    });
  }
};

exports.getCollectorPerformance = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'collector' });

    if (collectors.length === 0) {
      return res.json({
        success: true,
        message: 'No collectors found',
        data: []
      });
    }

    const performance = await Promise.all(
      collectors.map(async (collector) => {
        const collections = await CollectionRequest.find({
          assignedCollector: collector._id
        });

        const routes = await Route.find({
          assignedCollector: collector._id
        });

        const completed = collections.filter(c => c.status === 'completed').length;
        const inProgress = collections.filter(c => c.status === 'in-progress').length;
        const completedRoutes = routes.filter(r => r.status === 'completed').length;
        
        // Calculate average rating
        const ratings = collections.filter(c => c.rating).map(c => c.rating);
        const averageRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
          : 0;

        return {
          collectorId: collector._id,
          name: collector.name,
          email: collector.email,
          contactNumber: collector.contactNumber,
          totalAssigned: collections.length,
          completed,
          inProgress,
          pending: collections.length - completed - inProgress,
          completionRate: collections.length > 0 
            ? ((completed / collections.length) * 100).toFixed(2)
            : 0,
          totalRoutes: routes.length,
          completedRoutes,
          currentWorkload: collector.workload || 0,
          averageRating,
          status: collector.accountStatus
        };
      })
    );

    // Sort by completion rate
    performance.sort((a, b) => b.completionRate - a.completionRate);

    res.json({
      success: true,
      count: performance.length,
      data: performance
    });
  } catch (error) {
    console.error('Get collector performance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching performance', 
      error: error.message 
    });
  }
};

exports.getAreaAnalysis = async (req, res) => {
  try {
    const bins = await WasteBin.find().populate('userId', 'address');
    
    const areaData = {};

    bins.forEach(bin => {
      const area = bin.location?.address || bin.userId?.address || 'Unknown';
      
      if (!areaData[area]) {
        areaData[area] = {
          area,
          totalBins: 0,
          averageLevel: 0,
          highLevelBins: 0,
          wasteTypes: {}
        };
      }

      areaData[area].totalBins++;
      areaData[area].averageLevel += bin.currentLevel;
      
      if (bin.currentLevel >= 80) {
        areaData[area].highLevelBins++;
      }

      areaData[area].wasteTypes[bin.wasteType] = 
        (areaData[area].wasteTypes[bin.wasteType] || 0) + 1;
    });

    // Calculate averages
    Object.keys(areaData).forEach(area => {
      areaData[area].averageLevel = 
        (areaData[area].averageLevel / areaData[area].totalBins).toFixed(2);
    });

    const analysis = Object.values(areaData)
      .sort((a, b) => b.highLevelBins - a.highLevelBins);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get area analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching area analysis', 
      error: error.message 
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching report', 
      error: error.message 
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    let query = {};
    
    if (reportType) query.reportType = reportType;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const reports = await Report.find(query)
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reports', 
      error: error.message 
    });
  }
};