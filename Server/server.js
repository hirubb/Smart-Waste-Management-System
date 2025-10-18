const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app); // Create HTTP server for WebSocket
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.MONGODB_URI;

// Import WebSocket service
const websocketService = require('./services/websocketService');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Multer error handling
app.use((error, req, res, next) => {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'error',
        error: 'File size too large. Maximum 5MB allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'error',
        error: 'Too many files. Maximum 11 files allowed.'
      });
    }
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'error',
      error: 'Only image files are allowed!'
    });
  }

  next(error);
});

// Connect to MongoDB
mongoose.connect(DB_URL)
    .then(() => {
      console.log("✅ Connected to MongoDB");

      // Initialize WebSocket service after DB connection
      websocketService.initialize(server);
      console.log("✅ WebSocket service initialized");

      // Start periodic updates for live monitoring
      startPeriodicUpdates();
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const collectionRequestRoutes = require("./routes/collectionRequestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const alertRoutes = require("./routes/alertRoutes");
const reportRoutes = require("./routes/reportRoutes");
const routeRoutes = require('./routes/Route');
const collectorRoutes = require('./routes/Collector');
const dustbinRoutes = require("./routes/dustbinRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const monitoringRoutes = require('./routes/monitoringRoutes'); // NEW

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRequestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/collectors', collectorRoutes);
app.use("/api/dustbins", dustbinRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/monitoring', monitoringRoutes); // NEW - Live monitoring endpoints

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Smart Waste Management System API",
    version: "1.0.0",
    status: "running",
    websocket: {
      enabled: true,
      connectedClients: websocketService.getConnectedClientsCount()
    },
    endpoints: {
      auth: "/api/auth",
      collections: "/api/collections",
      payments: "/api/payments",
      alerts: "/api/alerts",
      routes: "/api/routes",
      collectors: "/api/collectors",
      dustbins: "/api/dustbins",
      notifications: "/api/notifications",
      monitoring: "/api/monitoring"
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    websocket: {
      enabled: true,
      connectedClients: websocketService.getConnectedClientsCount()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/**
 * Start periodic updates for live monitoring
 * This broadcasts real-time data to connected WebSocket clients
 */
function startPeriodicUpdates() {
  const Route = require('./models/Route');
  const Collector = require('./models/Collector');

  console.log("✅ Starting periodic updates for live monitoring");

  // Update dashboard stats every 30 seconds
  setInterval(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [activeRoutes, completedToday, collectors] = await Promise.all([
        Route.countDocuments({ status: 'Active' }),
        Route.countDocuments({ status: 'Completed', completedAt: { $gte: today } }),
        Collector.find({ isActive: true }).lean()
      ]);

      const onRoute = collectors.filter(c => c.status === 'On Route').length;
      const onBreak = collectors.filter(c => c.status === 'On Break').length;
      const available = collectors.filter(c => c.status === 'Available').length;

      websocketService.broadcastDashboardStats({
        routes: {
          active: activeRoutes,
          completedToday: completedToday
        },
        collectors: {
          total: collectors.length,
          onRoute: onRoute,
          onBreak: onBreak,
          available: available
        }
      });
    } catch (error) {
      console.error('Error broadcasting stats:', error.message);
    }
  }, 30000); // Every 30 seconds

  // Simulate vehicle location updates every 10 seconds
  // In production, this would receive actual GPS data from devices
  setInterval(async () => {
    try {
      const activeCollectors = await Collector.find({
        status: 'On Route',
        isActive: true
      })
          .limit(20)
          .lean();

      activeCollectors.forEach(collector => {
        // Generate mock GPS coordinates around Negombo area
        const baseLat = 7.2906;
        const baseLng = 80.6337;
        const offset = 0.002; // ~200 meters

        websocketService.broadcastVehicleLocation({
          vehicleId: collector.vehicleId,
          collectorId: collector._id,
          position: {
            latitude: baseLat + (Math.random() - 0.5) * offset,
            longitude: baseLng + (Math.random() - 0.5) * offset,
            speed: 15 + Math.random() * 25, // 15-40 km/h
            heading: Math.random() * 360,
            accuracy: 5 + Math.random() * 5 // 5-10 meters
          },
          status: collector.status,
          workload: collector.workload
        });
      });
    } catch (error) {
      console.error('Error broadcasting vehicle locations:', error.message);
    }
  }, 10000); // Every 10 seconds

  // Check for alerts every 60 seconds
  setInterval(async () => {
    try {
      // Check for delayed routes
      const delayedRoutes = await Route.find({ status: 'Delayed' })
          .limit(5)
          .lean();

      delayedRoutes.forEach(route => {
        websocketService.broadcastAlert({
          type: 'warning',
          category: 'route_delayed',
          title: 'Route Delayed',
          message: `Route ${route.routeName} (${route.routeCode}) is experiencing delays`,
          routeId: route._id,
          severity: 'medium'
        });
      });

      // Check for high workload collectors
      const collectors = await Collector.find({ isActive: true }).lean();

      collectors.forEach(collector => {
        const workloadValue = parseInt(collector.workload) || 0;
        if (workloadValue > 85) {
          websocketService.broadcastAlert({
            type: 'danger',
            category: 'high_workload',
            title: 'High Workload Alert',
            message: `Collector ${collector.vehicleId} has ${collector.workload} workload`,
            collectorId: collector._id,
            severity: 'high'
          });
        }
      });
    } catch (error) {
      console.error('Error checking alerts:', error.message);
    }
  }, 60000); // Every 60 seconds
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server with WebSocket support
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🚛 Smart Waste Management System - Backend Server          ║
  ║                                                               ║
  ║   🚀 Server running at http://localhost:${PORT}                  ║
  ║   🌐 Network: http://10.4.2.1:${PORT}                           ║
  ║   🔌 WebSocket: Enabled (Socket.IO)                          ║
  ║   📊 Live Monitoring: Active                                  ║
  ║   💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}                               ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                                ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  
  📍 API Endpoints:
     • Auth: http://localhost:${PORT}/api/auth
     • Routes: http://localhost:${PORT}/api/routes
     • Collectors: http://localhost:${PORT}/api/collectors
     • Monitoring: http://localhost:${PORT}/api/monitoring
     • Health: http://localhost:${PORT}/api/health
  
  🔌 WebSocket Events:
     • vehicle:location - Real-time vehicle positions
     • dashboard:stats - Live statistics updates
     • alert:new - System alerts
     • route:progress - Route completion progress
  `);
});

module.exports = { app, server };