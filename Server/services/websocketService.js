// services/websocketService.js
/**
 * WebSocket Service for Real-time Vehicle Tracking
 * This provides live updates to connected clients
 *
 * Usage: Save this file as services/websocketService.js
 */

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedClients = new Map();
    }

    /**
     * Initialize WebSocket server
     * @param {Object} server - HTTP server instance
     */
    initialize(server) {
        const socketIO = require('socket.io');

        this.io = socketIO(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.setupEventHandlers();
        console.log('✅ WebSocket service initialized');
    }

    /**
     * Setup socket event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            // Store client connection
            this.connectedClients.set(socket.id, {
                connectedAt: new Date(),
                subscriptions: []
            });

            // Handle client subscription to specific routes/vehicles
            socket.on('subscribe:route', (routeId) => {
                socket.join(`route:${routeId}`);
                console.log(`Client ${socket.id} subscribed to route ${routeId}`);
            });

            socket.on('subscribe:vehicle', (vehicleId) => {
                socket.join(`vehicle:${vehicleId}`);
                console.log(`Client ${socket.id} subscribed to vehicle ${vehicleId}`);
            });

            socket.on('subscribe:alerts', () => {
                socket.join('alerts');
                console.log(`Client ${socket.id} subscribed to alerts`);
            });

            // Handle vehicle location updates from mobile app
            socket.on('vehicle:location:update', (data) => {
                this.broadcastVehicleLocation(data);
            });

            // Handle collection point status update
            socket.on('collection:point:update', (data) => {
                this.broadcastCollectionPointUpdate(data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.connectedClients.delete(socket.id);
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Broadcast vehicle location update to subscribers
     */
    broadcastVehicleLocation(data) {
        const { vehicleId, collectorId, position, status } = data;

        this.io.to(`vehicle:${vehicleId}`).emit('vehicle:location', {
            vehicleId,
            collectorId,
            position,
            status,
            timestamp: new Date()
        });

        // Also broadcast to general monitoring room
        this.io.emit('vehicles:update', {
            vehicleId,
            position,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast route progress update
     */
    broadcastRouteProgress(routeId, progress) {
        this.io.to(`route:${routeId}`).emit('route:progress', {
            routeId,
            progress,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast collection point update
     */
    broadcastCollectionPointUpdate(data) {
        const { routeId, pointId, status, timestamp } = data;

        this.io.to(`route:${routeId}`).emit('collection:point:update', {
            routeId,
            pointId,
            status,
            timestamp: timestamp || new Date()
        });
    }

    /**
     * Broadcast alert to all connected clients
     */
    broadcastAlert(alert) {
        this.io.to('alerts').emit('alert:new', {
            ...alert,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast collector status change
     */
    broadcastCollectorStatus(collectorId, status) {
        this.io.emit('collector:status', {
            collectorId,
            status,
            timestamp: new Date()
        });
    }

    /**
     * Send dashboard stats update
     */
    broadcastDashboardStats(stats) {
        this.io.emit('dashboard:stats', {
            ...stats,
            timestamp: new Date()
        });
    }

    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }

    /**
     * Send message to specific client
     */
    sendToClient(socketId, event, data) {
        this.io.to(socketId).emit(event, data);
    }
}

// Export singleton instance
module.exports = new WebSocketService();