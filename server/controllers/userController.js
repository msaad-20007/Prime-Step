import User from '../models/User.js';
import Order from '../models/Order.js';

// GET /api/users — all customers (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });

    // For each user, get their order stats
    const userIds = users.map(u => u._id);
    const orders = await Order.find({ user: { $in: userIds } });

    const statsMap = {};
    orders.forEach(o => {
      const uid = o.user.toString();
      if (!statsMap[uid]) statsMap[uid] = { orderCount: 0, totalSpent: 0 };
      statsMap[uid].orderCount += 1;
      if (o.isPaid) statsMap[uid].totalSpent += o.totalPrice;
    });

    const result = users.map(u => ({
      ...u.toJSON(),
      orderCount: statsMap[u._id.toString()]?.orderCount ?? 0,
      totalSpent: statsMap[u._id.toString()]?.totalSpent ?? 0,
    }));

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id — delete customer (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
