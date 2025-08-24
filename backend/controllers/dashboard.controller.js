const Car = require('../models/Car.model');
const InspectionReport = require('../models/InspectionReport.model');
const Booking = require('../models/Booking.model');
const User = require('../models/User.model');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin sees all statistics
      const [
        totalCars,
        totalInspections,
        publishedInspections,
        unpublishedInspections,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalUsers,
        totalInspectors,
        recentInspections,
        monthlyInspections
      ] = await Promise.all([
        Car.countDocuments({ isDeleted: false }),
        InspectionReport.countDocuments(),
        InspectionReport.countDocuments({ isPublished: true }),
        InspectionReport.countDocuments({ isPublished: false }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'completed' }),
        User.countDocuments({ role: 'user', isActive: true }),
        User.countDocuments({ role: 'inspector', isActive: true }),
        InspectionReport.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('car', 'make model registrationNo')
          .populate('inspector', 'name'),
        getMonthlyInspectionStats()
      ]);

      stats = {
        totalCars,
        totalInspections,
        publishedInspections,
        unpublishedInspections,
        publishedPercentage: totalInspections > 0 ? Math.round((publishedInspections / totalInspections) * 100) : 0,
        totalBookings,
        pendingBookings,
        completedBookings,
        upcomingBookings: await Booking.countDocuments({ 
          status: 'confirmed',
          scheduledDate: { $gte: new Date() }
        }),
        totalUsers,
        totalInspectors,
        recentInspections,
        monthlyInspections,
        averageRating: await calculateAverageRating(),
        todayInspections: await InspectionReport.countDocuments({
          createdAt: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        })
      };

    } else if (userRole === 'inspector') {
      // Inspector sees their own statistics
      const [
        myInspections,
        myPublishedInspections,
        myUnpublishedInspections,
        myAssignedBookings,
        myCompletedBookings,
        recentInspections
      ] = await Promise.all([
        InspectionReport.countDocuments({ inspector: userId }),
        InspectionReport.countDocuments({ inspector: userId, isPublished: true }),
        InspectionReport.countDocuments({ inspector: userId, isPublished: false }),
        Booking.countDocuments({ inspector: userId, status: { $in: ['confirmed', 'in_progress'] } }),
        Booking.countDocuments({ inspector: userId, status: 'completed' }),
        InspectionReport.find({ inspector: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('car', 'make model registrationNo')
      ]);

      stats = {
        totalInspections: myInspections,
        publishedInspections: myPublishedInspections,
        unpublishedInspections: myUnpublishedInspections,
        publishedPercentage: myInspections > 0 ? Math.round((myPublishedInspections / myInspections) * 100) : 0,
        assignedBookings: myAssignedBookings,
        completedBookings: myCompletedBookings,
        upcomingBookings: await Booking.countDocuments({ 
          inspector: userId,
          status: 'confirmed',
          scheduledDate: { $gte: new Date() }
        }),
        todayBookings: await Booking.countDocuments({
          inspector: userId,
          scheduledDate: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        }),
        recentInspections,
        averageRating: await calculateInspectorAverageRating(userId),
        monthlyInspections: await getInspectorMonthlyStats(userId)
      };

    } else {
      // Regular user sees their own car statistics
      const userCars = await Car.find({ owner: userId, isDeleted: false }).select('_id');
      const carIds = userCars.map(car => car._id);

      const [
        myCars,
        myInspections,
        myPublishedReports,
        myBookings,
        pendingBookings,
        completedInspections,
        recentInspections
      ] = await Promise.all([
        userCars.length,
        InspectionReport.countDocuments({ car: { $in: carIds } }),
        InspectionReport.countDocuments({ car: { $in: carIds }, isPublished: true }),
        Booking.countDocuments({ user: userId }),
        Booking.countDocuments({ user: userId, status: 'pending' }),
        Booking.countDocuments({ user: userId, status: 'completed' }),
        InspectionReport.find({ car: { $in: carIds } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('car', 'make model registrationNo')
          .populate('inspector', 'name')
      ]);

      stats = {
        totalCars: myCars,
        totalInspections: myInspections,
        publishedReports: myPublishedReports,
        unpublishedReports: myInspections - myPublishedReports,
        totalBookings: myBookings,
        pendingBookings,
        completedInspections,
        upcomingBookings: await Booking.countDocuments({ 
          user: userId,
          status: 'confirmed',
          scheduledDate: { $gte: new Date() }
        }),
        recentInspections,
        nextBooking: await Booking.findOne({
          user: userId,
          status: 'confirmed',
          scheduledDate: { $gte: new Date() }
        })
        .sort({ scheduledDate: 1 })
        .populate('car', 'make model registrationNo')
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to calculate average rating
async function calculateAverageRating() {
  const result = await InspectionReport.aggregate([
    { $match: { overallRating: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
  ]);
  return result.length > 0 ? result[0].avgRating.toFixed(1) : 0;
}

// Helper function to calculate inspector's average rating
async function calculateInspectorAverageRating(inspectorId) {
  const result = await InspectionReport.aggregate([
    { $match: { inspector: inspectorId, overallRating: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
  ]);
  return result.length > 0 ? result[0].avgRating.toFixed(1) : 0;
}

// Helper function to get monthly inspection statistics
async function getMonthlyInspectionStats() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const stats = await InspectionReport.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return stats.map(stat => ({
    month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
    count: stat.count
  }));
}

// Helper function to get inspector's monthly statistics
async function getInspectorMonthlyStats(inspectorId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const stats = await InspectionReport.aggregate([
    {
      $match: {
        inspector: inspectorId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return stats.map(stat => ({
    month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
    count: stat.count
  }));
}

exports.getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    let activities = [];

    if (userRole === 'admin') {
      // Get all recent activities
      const [recentInspections, recentBookings, recentUsers] = await Promise.all([
        InspectionReport.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model registrationNo')
          .populate('inspector', 'name'),
        Booking.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model')
          .populate('user', 'name')
          .populate('inspector', 'name'),
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name email role createdAt')
      ]);

      // Combine and sort activities
      activities = [
        ...recentInspections.map(i => ({
          type: 'inspection',
          message: `New inspection for ${i.car?.make} ${i.car?.model} by ${i.inspector?.name}`,
          date: i.createdAt,
          status: i.isPublished ? 'published' : 'draft'
        })),
        ...recentBookings.map(b => ({
          type: 'booking',
          message: `Booking for ${b.car?.make} ${b.car?.model} by ${b.user?.name}`,
          date: b.createdAt,
          status: b.status
        })),
        ...recentUsers.map(u => ({
          type: 'user',
          message: `New ${u.role} registered: ${u.name}`,
          date: u.createdAt,
          status: 'new'
        }))
      ].sort((a, b) => b.date - a.date).slice(0, limit);

    } else if (userRole === 'inspector') {
      // Get inspector's activities
      const [myInspections, myBookings] = await Promise.all([
        InspectionReport.find({ inspector: userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model registrationNo'),
        Booking.find({ inspector: userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model')
          .populate('user', 'name')
      ]);

      activities = [
        ...myInspections.map(i => ({
          type: 'inspection',
          message: `Inspection completed for ${i.car?.make} ${i.car?.model}`,
          date: i.createdAt,
          status: i.isPublished ? 'published' : 'draft'
        })),
        ...myBookings.map(b => ({
          type: 'booking',
          message: `Assigned booking for ${b.car?.make} ${b.car?.model}`,
          date: b.createdAt,
          status: b.status
        }))
      ].sort((a, b) => b.date - a.date).slice(0, limit);

    } else {
      // Get user's activities
      const userCars = await Car.find({ owner: userId }).select('_id make model');
      const carIds = userCars.map(car => car._id);

      const [myInspections, myBookings] = await Promise.all([
        InspectionReport.find({ car: { $in: carIds } })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model registrationNo')
          .populate('inspector', 'name'),
        Booking.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('car', 'make model')
      ]);

      activities = [
        ...myInspections.map(i => ({
          type: 'inspection',
          message: `Inspection report for ${i.car?.make} ${i.car?.model}`,
          date: i.createdAt,
          status: i.isPublished ? 'published' : 'draft'
        })),
        ...myBookings.map(b => ({
          type: 'booking',
          message: `Booking for ${b.car?.make} ${b.car?.model}`,
          date: b.createdAt,
          status: b.status
        }))
      ].sort((a, b) => b.date - a.date).slice(0, limit);
    }

    res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    next(error);
  }
};