import Order from '../models/Order.js';
import User from '../models/User.js';
import {
  sendOrderPlacedEmail,
  sendPaymentConfirmedEmail,
  sendOrderProcessingEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from '../utils/sendEmail.js';

export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, totalPrice, isPaid, paidAt, shippingAddress, paymentMethod, manualPayment } = req.body;
    if (!orderItems?.length) {
      return res.status(400).json({ message: 'No order items' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      manualPayment: manualPayment ?? {},
      totalPrice,
      isPaid: isPaid ?? false,
      paidAt: isPaid ? (paidAt ? new Date(paidAt) : new Date()) : undefined,
    });

    const { name, email } = req.user;
    sendOrderPlacedEmail({ name, email, orderId: order._id.toString(), items: orderItems, total: totalPrice })
      .catch(err => console.error('[Email] Order placed email failed:', err.message));

    if (isPaid) {
      sendPaymentConfirmedEmail({ name, email, orderId: order._id.toString(), total: totalPrice })
        .catch(err => console.error('[Email] Payment confirmed email failed:', err.message));
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'name images');
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.trackingStatus;
    order.trackingStatus = req.body.trackingStatus ?? order.trackingStatus;

    // Handle isPaid toggle — supports both marking paid and unpaid
    if (req.body.isPaid === true) {
      order.isPaid = true;
      order.paidAt = new Date();
    } else if (req.body.isPaid === false || req.body.unpaid === true) {
      order.isPaid = false;
      order.paidAt = undefined;
    }
    const updated = await order.save();

    // Send status-change emails (non-blocking)
    const userName = order.user?.name ?? 'Customer';
    const userEmail = order.user?.email;
    const orderId = order._id.toString();

    if (userEmail && order.trackingStatus !== prevStatus) {
      if (order.trackingStatus === 'Processing') {
        sendOrderProcessingEmail({ name: userName, email: userEmail, orderId })
          .catch(err => console.error('[Email] Processing email failed:', err.message));
      } else if (order.trackingStatus === 'Shipped') {
        sendOrderShippedEmail({ name: userName, email: userEmail, orderId })
          .catch(err => console.error('[Email] Shipped email failed:', err.message));
      } else if (order.trackingStatus === 'Delivered') {
        sendOrderDeliveredEmail({ name: userName, email: userEmail, orderId })
          .catch(err => console.error('[Email] Delivered email failed:', err.message));
      }
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};
