const Collector = require('../models/Collector');
const User = require('../models/User');

exports.getAllCollectors = async (req, res) => {
    try {
        const { status, availability, workload } = req.query;

        let query = { isActive: true };

        if (status) query.status = status;

        const collectors = await Collector.find(query)
            .populate('assignedRoute', 'routeName routeCode')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        // Apply workload filter if specified
        let filteredCollectors = collectors;
        if (workload) {
            filteredCollectors = collectors.filter(collector => {
                const workloadValue = parseInt(collector.workload) || 0;
                if (workload === 'low') return workloadValue < 50;
                if (workload === 'medium') return workloadValue >= 50 && workloadValue < 80;
                if (workload === 'high') return workloadValue >= 80;
                return true;
            });
        }

        // Format for frontend
        const formattedCollectors = filteredCollectors.map(collector => ({
            id: collector._id,
            name: collector.name,
            email: collector.email,
            phone: collector.phone,
            status: collector.status,
            currentLocation: collector.currentLocation,
            workload: collector.workload,
            assignedRoute: collector.assignedRoute ? collector.assignedRoute.routeCode : null,
            vehicleId: collector.vehicleId,
            vehicleType: collector.vehicleType,
            completedRoutes: collector.completedRoutes,
            rating: collector.rating
        }));

        res.json({
            success: true,
            count: formattedCollectors.length,
            data: formattedCollectors
        });
    } catch (error) {
        console.error('Get collectors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collectors',
            error: error.message
        });
    }
};

exports.getCollectorById = async (req, res) => {
    try {
        const collector = await Collector.findById(req.params.id)
            .populate('assignedRoute', 'routeName routeCode area')
            .populate('userId', 'name email');

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: 'Collector not found'
            });
        }

        res.json({
            success: true,
            data: collector
        });
    } catch (error) {
        console.error('Get collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collector',
            error: error.message
        });
    }
};

exports.createCollector = async (req, res) => {
    try {
        const { userId, name, email, phone, vehicleId, vehicleType, currentLocation } = req.body;

        // Check if user exists and has collector role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'collector') {
            return res.status(400).json({
                success: false,
                message: 'User must have collector role'
            });
        }

        // Check if collector already exists
        const existingCollector = await Collector.findOne({ userId });
        if (existingCollector) {
            return res.status(400).json({
                success: false,
                message: 'Collector profile already exists for this user'
            });
        }

        const collector = new Collector({
            userId,
            name: name || user.name,
            email: email || user.email,
            phone,
            vehicleId,
            vehicleType: vehicleType || 'Truck',
            currentLocation: currentLocation || 'Base Station',
            status: 'Available',
            workload: '0%'
        });

        await collector.save();

        res.status(201).json({
            success: true,
            message: 'Collector created successfully',
            data: collector
        });
    } catch (error) {
        console.error('Create collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating collector',
            error: error.message
        });
    }
};

exports.updateCollector = async (req, res) => {
    try {
        const updates = req.body;

        const collector = await Collector.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate('assignedRoute', 'routeName routeCode')
            .populate('userId', 'name email');

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: 'Collector not found'
            });
        }

        res.json({
            success: true,
            message: 'Collector updated successfully',
            data: collector
        });
    } catch (error) {
        console.error('Update collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating collector',
            error: error.message
        });
    }
};

exports.deleteCollector = async (req, res) => {
    try {
        const collector = await Collector.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!collector) {
            return res.status(404).json({
                success: false,
                message: 'Collector not found'
            });
        }

        res.json({
            success: true,
            message: 'Collector deactivated successfully'
        });
    } catch (error) {
        console.error('Delete collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting collector',
            error: error.message
        });
    }
};