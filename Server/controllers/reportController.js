/**
 * Report Controller
 * 
 * Purpose: Handle waste management reporting operations
 * Responsibilities:
 * - Generate monthly waste collection reports
 * - Analyze waste generation patterns
 * - Provide recommendations for route optimization
 * - Track collector performance
 * 
 * @module reportController
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

const CollectionRequest = require('../models/CollectionRequest');
const WasteBin = require('../models/WasteBin');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Route = require('../models/Route');

/**
 * Report Data Analyzer Service
 * Follows Single Responsibility Principle: Only handles data analysis
 */
class ReportDataAnalyzer {
  /**
   * Analyzes waste by type from collection requests
   * @param {Array} collections - Collection requests
   * @returns {Object} Waste categorized by type
   */
  static analyzeWasteByType(collections) {
    return collections.reduce((acc, curr) => {
      const type = curr.wasteCategory;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalWeight: 0,
          percentage: 0
        };
      }
      acc[type].count++;
      acc[type].totalWeight += curr.weight || 0;
      return acc;
    }, {});
  }

  /**
   * Analyzes high waste generation areas
   * @param {Array} collections - Collection requests
   * @returns {Array} Top waste generation areas
   */
  static analyzeHighWasteAreas(collections) {
    const areaStats = collections.reduce((acc, curr) => {
      const area = curr.pickupLocation?.address || curr.userId?.address || 'Unknown';
      if (!acc[area]) {
        acc[area] = {
          area,
          totalCollections: 0,
          totalWeight: 0,
          wasteTypes: {}
        };
      }
      acc[area].totalCollections++;
      acc[area].totalWeight += curr.weight || 0;
      
      const type = curr.wasteCategory;
      acc[area].wasteTypes[type] = (acc[area].wasteTypes[type] || 0) + 1;
      
      return acc;
    }, {});

    return Object.values(areaStats)
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10)
      .map(area => ({
        ...area,
        wasteVolume: Math.round(area.totalWeight),
        dominantWasteType: Object.entries(area.wasteTypes)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
      }));
  }

  /**
   * Calculates collection frequency statistics
   * @param {Array} collections - Collection requests
   * @returns {Object} Frequency statistics
   */
  static analyzeCollectionFrequency(collections) {
    const dailyCollections = {};
    
    collections.forEach(collection => {
      const date = new Date(collection.scheduledDate).toISOString().split('T')[0];
      dailyCollections[date] = (dailyCollections[date] || 0) + 1;
    });

    const frequencies = Object.values(dailyCollections);
    const average = frequencies.length > 0 
      ? frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length 
      : 0;
    const max = frequencies.length > 0 ? Math.max(...frequencies) : 0;
    const min = frequencies.length > 0 ? Math.min(...frequencies) : 0;

    return {
      daily: dailyCollections,
      average: average.toFixed(2),
      max,
      min,
      totalDays: frequencies.length
    };
  }

  /**
   * Generates optimization recommendations
   * @param {Object} reportData - Report data
   * @returns {Array} Recommendations
   */
  static generateRecommendations(reportData) {
    const recommendations = [];
    const { summary, highWasteAreas, trends, wasteByType } = reportData;

    // Area-based recommendations
    if (highWasteAreas.length > 0) {
      const topArea = highWasteAreas[0];
      recommendations.push({
        priority: 'high',
        category: 'Route Optimization',
        message: `Increase collection frequency in ${topArea.area} - highest waste generation (${topArea.totalCollections} collections)`,
        impact: 'Reduce overflow and improve service quality'
      });
    }

    // Collection efficiency recommendations
    const completionRate = parseFloat(trends.completionRate);
    if (completionRate < 85) {
      recommendations.push({
        priority: 'high',
        category: 'Operational Efficiency',
        message: `Collection completion rate is ${completionRate}% - below target of 85%`,
        impact: 'Assign more collectors or optimize routes to improve efficiency'
      });
    } else if (completionRate >= 95) {
      recommendations.push({
        priority: 'low',
        category: 'Performance',
        message: 'Excellent completion rate - maintain current operational standards',
        impact: 'Continue monitoring for consistency'
      });
    }

    // Waste type recommendations
    const hazardousCount = wasteByType.hazardous?.count || 0;
    if (hazardousCount > summary.totalCollections * 0.1) {
      recommendations.push({
        priority: 'critical',
        category: 'Safety',
        message: `High volume of hazardous waste detected (${hazardousCount} collections)`,
        impact: 'Ensure proper handling protocols and specialized collection teams'
      });
    }

    // Bin management recommendations
    if (summary.activeBins < summary.totalBins * 0.9) {
      recommendations.push({
        priority: 'medium',
        category: 'Infrastructure',
        message: `${summary.totalBins - summary.activeBins} bins are inactive`,
        impact: 'Service or reactivate bins to maintain coverage'
      });
    }

    // Collection time recommendations
    const avgTime = parseFloat(trends.averageCollectionTime);
    if (avgTime > 48) {
      recommendations.push({
        priority: 'medium',
        category: 'Response Time',
        message: `Average collection time is ${avgTime} hours - above target of 48 hours`,
        impact: 'Optimize scheduling to reduce response time'
      });
    }

    // Revenue recommendations
    if (summary.revenueGenerated < summary.completedCollections * 100) {
      recommendations.push({
        priority: 'low',
        category: 'Revenue',
        message: 'Consider reviewing pricing structure for better revenue optimization',
        impact: 'Ensure sustainable operations'
      });
    }

    return recommendations;
  }
}

/**
 * Generate comprehensive monthly waste collection report
 * Follows Open/Closed Principle: Can be extended without modification
 * 
 * @route POST /api/reports/monthly
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.month - Month (1-12)
 * @param {number} req.query.year - Year
 * @param {Object} res - Express response object
 */
exports.generateMonthlyReport = async (req, res) => {
  try {
    console.log('📊 Starting monthly report generation...');
    console.log('Query params:', req.query);
    console.log('User:', req.user);
    
    const { month, year } = req.query;

    // Validate input parameters
    if (!month || !year) {
      console.log('❌ Missing month or year');
      return res.status(400).json({ 
        success: false,
        message: 'Month and year are required' 
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      console.log('❌ Invalid month:', monthNum);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid month. Must be between 1 and 12' 
      });
    }

    console.log('✅ Validation passed. Generating report for:', monthNum, yearNum);

    // Define date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    console.log('📅 Date range:', startDate, 'to', endDate);

    // Fetch all required data in parallel for better performance
    console.log('🔍 Fetching data from database...');
    const [collections, bins, payments] = await Promise.all([
      CollectionRequest.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('userId', 'name address')
        .populate('binId')
        .populate('assignedCollector', 'name'),
      
      WasteBin.find().populate('userId', 'address'),
      
      Payment.find({
        paymentDate: { $gte: startDate, $lte: endDate },
        paymentStatus: 'completed'
      })
    ]);

    console.log(`✅ Data fetched: ${collections.length} collections, ${bins.length} bins, ${payments.length} payments`);

    console.log(`✅ Data fetched: ${collections.length} collections, ${bins.length} bins, ${payments.length} payments`);

    // Calculate basic statistics
    console.log('📊 Calculating statistics...');
    const totalCollections = collections.length;
    const completedCollections = collections.filter(c => c.status === 'completed').length;
    const pendingCollections = collections.filter(c => c.status === 'pending').length;
    const inProgressCollections = collections.filter(c => c.status === 'in-progress').length;
    const cancelledCollections = collections.filter(c => c.status === 'cancelled').length;

    // Analyze waste by type using analyzer service
    const wasteByType = ReportDataAnalyzer.analyzeWasteByType(collections);
    
    // Calculate percentages for waste types
    Object.keys(wasteByType).forEach(type => {
      wasteByType[type].percentage = totalCollections > 0 
        ? ((wasteByType[type].count / totalCollections) * 100).toFixed(2)
        : 0;
    });

    // Total waste collected (sum of weights)
    const totalWasteCollected = collections
      .filter(c => c.weight)
      .reduce((sum, c) => sum + c.weight, 0);

    // Analyze high waste areas
    const highWasteAreas = ReportDataAnalyzer.analyzeHighWasteAreas(collections);

    // Collection frequency analysis
    const collectionFrequency = ReportDataAnalyzer.analyzeCollectionFrequency(collections);

    // Revenue statistics
    const revenueGenerated = payments.reduce((sum, p) => sum + p.amount, 0);
    const averageRevenuePerCollection = completedCollections > 0 
      ? (revenueGenerated / completedCollections).toFixed(2)
      : 0;

    // Time-based analysis
    const completedWithTime = collections.filter(c => c.completedAt && c.createdAt);
    const averageCollectionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, c) => {
          return sum + (new Date(c.completedAt) - new Date(c.createdAt));
        }, 0) / completedWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Bin statistics
    const activeBins = bins.filter(b => b.deviceStatus === 'active').length;
    const binsNeedingCollection = bins.filter(b => b.currentLevel >= 80).length;

    // Compile summary data
    const summary = {
      totalCollections,
      completedCollections,
      pendingCollections,
      inProgressCollections,
      cancelledCollections,
      totalBins: bins.length,
      activeBins,
      binsNeedingCollection,
      totalWasteCollected: Math.round(totalWasteCollected),
      revenueGenerated: Math.round(revenueGenerated),
      averageRevenuePerCollection: parseFloat(averageRevenuePerCollection)
    };

    // Compile trends data
    const trends = {
      dailyAverage: parseFloat(collectionFrequency.average),
      weeklyAverage: (parseFloat(collectionFrequency.average) * 7).toFixed(2),
      completionRate: totalCollections > 0 
        ? ((completedCollections / totalCollections) * 100).toFixed(2)
        : 0,
      cancellationRate: totalCollections > 0 
        ? ((cancelledCollections / totalCollections) * 100).toFixed(2)
        : 0,
      averageCollectionTime: averageCollectionTime.toFixed(2)
    };

    // Prepare report data for recommendations
    const reportData = {
      summary,
      highWasteAreas,
      trends,
      wasteByType
    };

    // Generate recommendations using analyzer service
    const recommendations = ReportDataAnalyzer.generateRecommendations(reportData);

    // Compile complete report
    const report = {
      period: { 
        month: monthNum, 
        year: yearNum,
        startDate,
        endDate,
        monthName: new Date(yearNum, monthNum - 1).toLocaleString('default', { month: 'long' })
      },
      summary,
      wasteByType,
      highWasteAreas,
      collectionFrequency: {
        average: collectionFrequency.average,
        max: collectionFrequency.max,
        min: collectionFrequency.min,
        totalDays: collectionFrequency.totalDays
      },
      trends,
      recommendations,
      generatedAt: new Date(),
      generatedBy: req.user?.name || 'System'
    };

    // Save report to database
    console.log('💾 Saving report to database...');
    
    // Prepare report document
    const reportDoc = {
      reportType: 'monthly',
      period: {
        month: monthNum,
        year: yearNum,
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
        areaStats: new Map(highWasteAreas.map(a => [a.area, a])),
        revenueGenerated,
        averageCollectionTime
      },
      highWasteAreas,
      recommendations: recommendations.map(r => r.message),
      status: 'completed'
    };

    // Only include generatedBy if it's a valid ObjectId (not hardcoded user)
    const userId = req.user?._id || req.user?.id;
    if (userId && userId !== 'waste_manager_001') {
      reportDoc.generatedBy = userId;
    }
    
    const savedReport = await Report.create(reportDoc);

    console.log('✅ Report saved with ID:', savedReport._id);
    console.log('📤 Sending response...');

    res.json({
      success: true,
      message: 'Monthly waste collection report generated successfully',
      data: report,
      reportId: savedReport._id
    });
    
    console.log('✅ Report generation completed successfully!');
  } catch (error) {
    console.error('❌ Generate monthly report error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Error generating monthly report', 
      error: error.message 
    });
  }
};

/**
 * Get collector performance report
 * Analyzes individual collector efficiency and workload
 * 
 * @route GET /api/reports/collector-performance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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