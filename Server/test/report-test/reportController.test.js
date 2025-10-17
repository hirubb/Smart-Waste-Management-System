/**
 * Report Controller Unit Tests
 * 
 * Purpose: Test all report generation and analysis functionality
 * Coverage:
 * - Monthly report generation
 * - Custom report generation
 * - Collector performance analysis
 * - Area analysis
 * - Report history retrieval
 * - Filter options
 * 
 * @module reportController.test
 * @author Smart Waste Management System
 * @since 2025-10-17
 */

const {
  generateMonthlyReport,
  getCollectorPerformance,
  getAreaAnalysis,
  generateCustomReport,
  getFilterOptions,
  getReportHistory,
  getReportDetails,
  getAllReports,
  getReportById
} = require('../../controllers/reportController');

// Mock all required models
jest.mock('../../models/CollectionRequest');
jest.mock('../../models/WasteBin');
jest.mock('../../models/User');
jest.mock('../../models/Payment');
jest.mock('../../models/Report');
jest.mock('../../models/Route');

const CollectionRequest = require('../../models/CollectionRequest');
const WasteBin = require('../../models/WasteBin');
const User = require('../../models/User');
const Payment = require('../../models/Payment');
const Report = require('../../models/Report');
const Route = require('../../models/Route');

describe('Report Controller', () => {
  let req, res, mockCollections, mockBins, mockPayments, mockUsers, mockReports, mockRoutes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      query: {},
      body: {},
      params: {},
      headers: {
        authorization: 'Bearer test-token'
      },
      user: {
        _id: 'user123',
        id: 'user123',
        userId: 'user123',
        name: 'Test Manager',
        role: 'waste_manager'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Mock collection data
    mockCollections = [
      {
        _id: 'collection1',
        userId: { 
          _id: 'user1', 
          name: 'John Doe', 
          address: 'Downtown Area' 
        },
        binId: { 
          _id: 'bin1', 
          location: 'Main Street' 
        },
        assignedCollector: { 
          _id: 'collector1', 
          name: 'Collector A' 
        },
        wasteCategory: 'recyclable',
        weight: 25.5,
        status: 'completed',
        createdAt: new Date('2024-10-15T10:00:00Z'),
        completedAt: new Date('2024-10-15T14:00:00Z'),
        scheduledDate: new Date('2024-10-15T08:00:00Z'),
        pickupLocation: { address: 'Downtown Area' },
        rating: 4.5
      },
      {
        _id: 'collection2',
        userId: { 
          _id: 'user2', 
          name: 'Jane Smith', 
          address: 'Uptown Area' 
        },
        binId: { 
          _id: 'bin2', 
          location: 'Park Avenue' 
        },
        assignedCollector: { 
          _id: 'collector2', 
          name: 'Collector B' 
        },
        wasteCategory: 'organic',
        weight: 15.2,
        status: 'pending',
        createdAt: new Date('2024-10-16T09:00:00Z'),
        scheduledDate: new Date('2024-10-16T10:00:00Z'),
        pickupLocation: { address: 'Uptown Area' }
      },
      {
        _id: 'collection3',
        userId: { 
          _id: 'user3', 
          name: 'Bob Wilson', 
          address: 'Industrial Zone' 
        },
        binId: { 
          _id: 'bin3', 
          location: 'Factory Street' 
        },
        assignedCollector: { 
          _id: 'collector1', 
          name: 'Collector A' 
        },
        wasteCategory: 'hazardous',
        weight: 30.0,
        status: 'completed',
        createdAt: new Date('2024-10-17T11:00:00Z'),
        completedAt: new Date('2024-10-17T16:00:00Z'),
        scheduledDate: new Date('2024-10-17T12:00:00Z'),
        pickupLocation: { address: 'Industrial Zone' },
        rating: 5.0
      }
    ];

    // Mock waste bin data
    mockBins = [
      {
        _id: 'bin1',
        userId: { _id: 'user1', address: 'Downtown Area' },
        location: 'Main Street',
        deviceStatus: 'active',
        currentLevel: 85,
        wasteType: 'recyclable'
      },
      {
        _id: 'bin2',
        userId: { _id: 'user2', address: 'Uptown Area' },
        location: 'Park Avenue',
        deviceStatus: 'active',
        currentLevel: 45,
        wasteType: 'organic'
      },
      {
        _id: 'bin3',
        userId: { _id: 'user3', address: 'Industrial Zone' },
        location: 'Factory Street',
        deviceStatus: 'inactive',
        currentLevel: 90,
        wasteType: 'hazardous'
      }
    ];

    // Mock payment data
    mockPayments = [
      {
        _id: 'payment1',
        amount: 150.00,
        paymentDate: new Date('2024-10-15T15:00:00Z'),
        paymentStatus: 'completed',
        collectionId: 'collection1'
      },
      {
        _id: 'payment2',
        amount: 200.00,
        paymentDate: new Date('2024-10-17T17:00:00Z'),
        paymentStatus: 'completed',
        collectionId: 'collection3'
      }
    ];

    // Mock user/collector data
    mockUsers = [
      {
        _id: 'collector1',
        name: 'Collector A',
        email: 'collector.a@waste.com',
        role: 'collector'
      },
      {
        _id: 'collector2',
        name: 'Collector B',
        email: 'collector.b@waste.com',
        role: 'collector'
      }
    ];

    // Mock report data
    mockReports = [
      {
        _id: 'report1',
        reportType: 'monthly',
        period: {
          month: 10,
          year: 2024,
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-31')
        },
        data: {
          totalCollections: 50,
          completedCollections: 45,
          pendingCollections: 3,
          cancelledCollections: 2,
          totalWasteCollected: 1250,
          revenueGenerated: 7500
        },
        status: 'completed',
        generatedBy: {
          _id: 'user123',
          name: 'Test Manager',
          email: 'manager@waste.com',
          role: 'waste_manager'
        },
        createdAt: new Date('2024-10-17T10:00:00Z'),
        updatedAt: new Date('2024-10-17T10:00:00Z')
      }
    ];

    // Mock route data
    mockRoutes = [
      {
        _id: 'route1',
        assignedCollector: 'collector1',
        status: 'completed'
      },
      {
        _id: 'route2',
        assignedCollector: 'collector2',
        status: 'in-progress'
      }
    ];
  });

  describe('generateMonthlyReport', () => {
    beforeEach(() => {
      // Mock database queries
      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockCollections)
          })
        })
      });

      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });

      Payment.find = jest.fn().mockResolvedValue(mockPayments);
      Report.create = jest.fn().mockResolvedValue({ _id: 'report123' });
    });

    test('should generate monthly report successfully', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Monthly waste collection report generated successfully',
          data: expect.objectContaining({
            period: expect.objectContaining({
              month: 10,
              year: 2024,
              monthName: 'October'
            }),
            summary: expect.objectContaining({
              totalCollections: 3,
              completedCollections: 2,
              pendingCollections: 1,
              totalBins: 3,
              activeBins: 2
            })
          }),
          reportId: 'report123'
        })
      );
    });

    test('should return 400 error when month is missing', async () => {
      req.query = { year: '2024' };

      await generateMonthlyReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Month and year are required'
      });
    });

    test('should return 400 error when year is missing', async () => {
      req.query = { month: '10' };

      await generateMonthlyReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Month and year are required'
      });
    });

    test('should return 400 error for invalid month', async () => {
      req.query = { month: '13', year: '2024' };

      await generateMonthlyReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid month. Must be between 1 and 12'
      });
    });

    test('should handle database errors gracefully', async () => {
      req.query = { month: '10', year: '2024' };
      
      CollectionRequest.find = jest.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await generateMonthlyReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error generating monthly report',
        error: 'Database connection failed'
      });
    });

    test('should analyze waste by type correctly', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      const response = res.json.mock.calls[0][0];
      const wasteByType = response.data.wasteByType;

      expect(wasteByType).toEqual({
        recyclable: {
          count: 1,
          totalWeight: 25.5,
          percentage: '33.33'
        },
        organic: {
          count: 1,
          totalWeight: 15.2,
          percentage: '33.33'
        },
        hazardous: {
          count: 1,
          totalWeight: 30,
          percentage: '33.33'
        }
      });
    });

    test('should generate recommendations based on data', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      const response = res.json.mock.calls[0][0];
      const recommendations = response.data.recommendations;

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Check for high waste area recommendation
      const areaRecommendation = recommendations.find(r => 
        r.category === 'Route Optimization'
      );
      expect(areaRecommendation).toBeDefined();
    });
  });

  describe('getCollectorPerformance', () => {
    beforeEach(() => {
      User.find = jest.fn().mockResolvedValue(mockUsers);
      CollectionRequest.find = jest.fn().mockResolvedValue(mockCollections);
      Route.find = jest.fn().mockResolvedValue(mockRoutes);
    });

    test('should return collector performance data successfully', async () => {
      await getCollectorPerformance(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: expect.any(Number),
          data: expect.arrayContaining([
            expect.objectContaining({
              collectorId: expect.any(String),
              name: expect.any(String),
              email: expect.any(String),
              totalAssigned: expect.any(Number),
              completed: expect.any(Number),
              completionRate: expect.any(String)
            })
          ])
        })
      );
    });

    test('should handle no collectors found', async () => {
      User.find = jest.fn().mockResolvedValue([]);

      await getCollectorPerformance(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'No collectors found',
        data: []
      });
    });

    test('should handle database errors', async () => {
      User.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await getCollectorPerformance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching performance',
        error: 'Database error'
      });
    });
  });

  describe('generateCustomReport', () => {
    beforeEach(() => {
      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockCollections)
          })
        })
      });

      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });

      Payment.find = jest.fn().mockResolvedValue(mockPayments);
      Report.create = jest.fn().mockResolvedValue({ _id: 'customreport123' });
    });

    test('should generate custom report successfully', async () => {
      req.body = {
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        reportName: 'Custom Test Report'
      };

      await generateCustomReport(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Custom report generated successfully',
          data: expect.objectContaining({
            reportName: 'Custom Test Report',
            period: expect.objectContaining({
              duration: expect.stringContaining('days')
            })
          }),
          reportId: 'customreport123'
        })
      );
    });

    test('should return 400 error when start date is missing', async () => {
      req.body = { endDate: '2024-10-31' };

      await generateCustomReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date and end date are required'
      });
    });

    test('should return 400 error when end date is missing', async () => {
      req.body = { startDate: '2024-10-01' };

      await generateCustomReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date and end date are required'
      });
    });

    test('should return 400 error when start date is after end date', async () => {
      req.body = {
        startDate: '2024-10-31',
        endDate: '2024-10-01'
      };

      await generateCustomReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date cannot be after end date'
      });
    });

    test('should filter by waste types when provided', async () => {
      req.body = {
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        wasteTypes: ['recyclable', 'organic']
      };

      await generateCustomReport(req, res);

      expect(CollectionRequest.find).toHaveBeenCalledWith(
        expect.objectContaining({
          wasteCategory: { $in: ['recyclable', 'organic'] }
        })
      );
    });

    test('should filter by collectors when provided', async () => {
      req.body = {
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        collectors: ['collector1', 'collector2']
      };

      await generateCustomReport(req, res);

      expect(CollectionRequest.find).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedCollector: { $in: ['collector1', 'collector2'] }
        })
      );
    });

    test('should filter by status when provided', async () => {
      req.body = {
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'completed'
      };

      await generateCustomReport(req, res);

      expect(CollectionRequest.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed'
        })
      );
    });
  });

  describe('getFilterOptions', () => {
    beforeEach(() => {
      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCollections)
      });
      
      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });
      
      User.find = jest.fn().mockResolvedValue(mockUsers);
    });

    test('should return filter options successfully', async () => {
      await getFilterOptions(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Filter options retrieved successfully',
          data: expect.objectContaining({
            regions: expect.arrayContaining(['Downtown Area', 'Industrial Zone', 'Uptown Area']),
            wasteTypes: expect.arrayContaining(['electronic', 'general', 'hazardous', 'organic', 'recyclable']),
            collectors: expect.arrayContaining([
              expect.objectContaining({
                id: 'collector1',
                name: 'Collector A',
                email: 'collector.a@waste.com'
              })
            ]),
            statusOptions: ['pending', 'in-progress', 'completed', 'cancelled']
          })
        })
      );
    });

    test('should handle database errors', async () => {
      CollectionRequest.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getFilterOptions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching filter options',
        error: 'Database error'
      });
    });
  });

  describe('getReportHistory', () => {
    beforeEach(() => {
      Report.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockReports)
              })
            })
          })
        })
      });
      
      Report.countDocuments = jest.fn().mockResolvedValue(1);
    });

    test('should return report history successfully', async () => {
      req.query = { page: '1', limit: '10' };

      await getReportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            reports: expect.any(Array),
            pagination: expect.objectContaining({
              currentPage: 1,
              totalPages: 1,
              totalReports: 1
            })
          }),
          message: 'Report history retrieved successfully'
        })
      );
    });

    test('should handle missing user', async () => {
      req.user = null;

      await getReportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not authenticated'
        })
      );
    });

    test('should filter by report type', async () => {
      req.query = { reportType: 'monthly', page: '1', limit: '10' };

      await getReportHistory(req, res);

      expect(Report.find).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'monthly'
        })
      );
    });

    test('should handle database errors', async () => {
      Report.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getReportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Failed to fetch report history',
          error: expect.any(String)
        })
      );
    });
  });

  describe('getReportDetails', () => {
    beforeEach(() => {
      Report.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockReports[0])
        })
      });
    });

    test('should return report details successfully', async () => {
      req.params = { reportId: '507f1f77bcf86cd799439011' }; // Valid ObjectId
      req.user = {
        _id: 'user123',
        userId: 'user123',
        role: 'waste_manager'
      };
      
      // Mock report with matching user
      const mockReport = {
        ...mockReports[0],
        generatedBy: {
          _id: 'user123',
          name: 'Test Manager',
          email: 'manager@test.com',
          role: 'waste_manager'
        }
      };
      
      Report.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockReport)
        })
      });

      await getReportDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            _id: expect.any(String),
            reportType: 'monthly'
          }),
          message: 'Report details retrieved successfully'
        })
      );
    });

    test('should return 400 error for invalid report ID', async () => {
      req.params = { reportId: 'invalid-id' };

      await getReportDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid report ID'
      });
    });

    test('should return 404 error when report not found', async () => {
      req.params = { reportId: '507f1f77bcf86cd799439011' };
      
      Report.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      await getReportDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report not found'
      });
    });

    test('should handle database errors', async () => {
      req.params = { reportId: '507f1f77bcf86cd799439011' };
      
      Report.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getReportDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch report details',
        error: 'Database error'
      });
    });
  });

  describe('getAreaAnalysis', () => {
    beforeEach(() => {
      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });
    });

    test('should return area analysis successfully', async () => {
      await getAreaAnalysis(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              area: expect.any(String),
              totalBins: expect.any(Number),
              averageLevel: expect.any(String),
              highLevelBins: expect.any(Number),
              wasteTypes: expect.any(Object)
            })
          ])
        })
      );
    });

    test('should handle database errors', async () => {
      WasteBin.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getAreaAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching area analysis',
        error: 'Database error'
      });
    });
  });

  describe('getAllReports', () => {
    beforeEach(() => {
      Report.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockReports)
        })
      });
    });

    test('should return all reports successfully', async () => {
      await getAllReports(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: mockReports.length,
          data: mockReports
        })
      );
    });

    test('should filter by date range when provided', async () => {
      req.query = {
        startDate: '2024-10-01',
        endDate: '2024-10-31'
      };

      await getAllReports(req, res);

      expect(Report.find).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date)
          })
        })
      );
    });

    test('should handle database errors', async () => {
      Report.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getAllReports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching reports',
        error: 'Database error'
      });
    });
  });

  describe('getReportById', () => {
    beforeEach(() => {
      Report.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockReports[0])
      });
    });

    test('should return report by ID successfully', async () => {
      req.params = { id: 'report1' };

      await getReportById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockReports[0]
        })
      );
    });

    test('should return 404 when report not found', async () => {
      req.params = { id: 'nonexistent' };
      
      Report.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report not found'
      });
    });

    test('should handle database errors', async () => {
      req.params = { id: 'report1' };
      
      Report.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching report',
        error: 'Database error'
      });
    });
  });

  // Test the ReportDataAnalyzer class methods indirectly through controller calls
  describe('ReportDataAnalyzer Integration', () => {
    beforeEach(() => {
      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockCollections)
          })
        })
      });

      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });

      Payment.find = jest.fn().mockResolvedValue(mockPayments);
      Report.create = jest.fn().mockResolvedValue({ _id: 'report123' });
    });

    test('should analyze waste by type correctly', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      const response = res.json.mock.calls[0][0];
      const wasteByType = response.data.wasteByType;

      // Verify waste type analysis
      expect(wasteByType.recyclable).toBeDefined();
      expect(wasteByType.organic).toBeDefined();
      expect(wasteByType.hazardous).toBeDefined();
      expect(wasteByType.recyclable.count).toBe(1);
      expect(wasteByType.organic.count).toBe(1);
      expect(wasteByType.hazardous.count).toBe(1);
    });

    test('should analyze high waste areas correctly', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      const response = res.json.mock.calls[0][0];
      const highWasteAreas = response.data.highWasteAreas;

      expect(Array.isArray(highWasteAreas)).toBe(true);
      expect(highWasteAreas.length).toBeGreaterThan(0);
      
      // Verify area with highest waste is first
      const topArea = highWasteAreas[0];
      expect(topArea).toHaveProperty('area');
      expect(topArea).toHaveProperty('totalCollections');
      expect(topArea).toHaveProperty('totalWeight');
      expect(topArea).toHaveProperty('wasteVolume');
      expect(topArea).toHaveProperty('dominantWasteType');
    });

    test('should generate appropriate recommendations', async () => {
      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      const response = res.json.mock.calls[0][0];
      const recommendations = response.data.recommendations;

      expect(Array.isArray(recommendations)).toBe(true);
      
      // Check recommendation structure
      if (recommendations.length > 0) {
        const recommendation = recommendations[0];
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('category');
        expect(recommendation).toHaveProperty('message');
        expect(recommendation).toHaveProperty('impact');
        expect(['critical', 'high', 'medium', 'low']).toContain(recommendation.priority);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty collections gracefully', async () => {
      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
          })
        })
      });

      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      Payment.find = jest.fn().mockResolvedValue([]);
      Report.create = jest.fn().mockResolvedValue({ _id: 'report123' });

      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            summary: expect.objectContaining({
              totalCollections: 0,
              completedCollections: 0,
              pendingCollections: 0
            })
          })
        })
      );
    });

    test('should handle null values in collection data', async () => {
      const incompleteCollections = [
        {
          _id: 'collection1',
          wasteCategory: 'recyclable',
          status: 'completed',
          createdAt: new Date('2024-10-15T10:00:00Z'),
          scheduledDate: new Date('2024-10-15T10:00:00Z'),
          userId: { name: 'Test User', address: 'Test Area' },
          binId: { location: 'Test Location' },
          assignedCollector: { name: 'Test Collector' },
          pickupLocation: { address: 'Test Area' }
          // Missing weight, completedAt, etc.
        }
      ];

      CollectionRequest.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(incompleteCollections)
          })
        })
      });

      WasteBin.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBins)
      });

      Payment.find = jest.fn().mockResolvedValue(mockPayments);
      Report.create = jest.fn().mockResolvedValue({ _id: 'report123' });

      req.query = { month: '10', year: '2024' };

      await generateMonthlyReport(req, res);

      expect(res.json).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});