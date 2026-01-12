import Order from "../models/order.models.js";
import Product from "../models/product.models.js";
import Payment from "../models/payment.models.js";
import Notification from "../models/notification.models.js";
import Inventory from "../models/inventory.model.js";

export const getAllOrders = async (query = {}) => {
  const {
    search,
    status,
    paymentMethod,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Search filter
  if (search) {
    filter.$or = [
      { billNumber: { $regex: search, $options: "i" } },
      { "customer.fullName": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.location": { $regex: search, $options: "i" } },
    ];
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Payment method filter
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate("items.productId", "name imageUrl category stock price finalPrice")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("items.productId", "name imageUrl category price finalPrice stock")
    .lean();
};

export const getOrderByBillNumber = async (billNumber) => {
  return await Order.findOne({ billNumber })
    .populate("items.productId", "name imageUrl category price finalPrice stock")
    .lean();
};

export const createOrder = async (orderData) => {
  // Validate products and check stock
  for (const item of orderData.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  // Calculate item totals
  const itemsWithTotals = await Promise.all(
    orderData.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const price = product.finalPrice || product.price;
      return {
        ...item,
        name: item.name || product.name,
        price,
        total: price * item.quantity,
      };
    })
  );

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  // Calculate delivery fee (free if subtotal >= 2000)
  const deliveryFee = orderData.deliveryFee !== undefined 
    ? orderData.deliveryFee 
    : (subtotal >= 2000 ? 0 : 500);

  // Calculate total amount
  const totalAmount = subtotal + deliveryFee;

  // Generate bill number if not provided
  let billNumber = orderData.billNumber;
  if (!billNumber) {
    const currentYear = new Date().getFullYear();
    const lastOrder = await Order.findOne(
      { billNumber: { $regex: `^FB-${currentYear}-` } },
      {},
      { sort: { billNumber: -1 } }
    );
    
    let nextBillNumber = 1;
    if (lastOrder && lastOrder.billNumber) {
      const lastBillParts = lastOrder.billNumber.split("-");
      if (lastBillParts.length === 3 && lastBillParts[2]) {
        const lastNumber = parseInt(lastBillParts[2]);
        if (!isNaN(lastNumber)) {
          nextBillNumber = lastNumber + 1;
        }
      }
    }
    billNumber = `FB-${currentYear}-${String(nextBillNumber).padStart(3, "0")}`;
  }

  // Create order
  const order = new Order({
    ...orderData,
    billNumber,
    items: itemsWithTotals,
    subtotal,
    deliveryFee,
    totalAmount,
  });

  const savedOrder = await order.save();

  // Update product stock and sales, create inventory transactions
  for (const item of itemsWithTotals) {
    const product = await Product.findById(item.productId);
    const previousStock = product.stock;
    const newStock = previousStock - item.quantity;

    // Update product stock
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, totalSold: item.quantity },
    });

    // Create inventory transaction record
    await Inventory.create({
      productId: item.productId,
      productName: item.name,
      type: "remove",
      quantity: item.quantity,
      previousStock,
      newStock,
      reason: `Sold via Order ${savedOrder.billNumber}`,
      notes: `Customer: ${savedOrder.customer.fullName}`,
    });

    // Create low stock alert if needed
    if (newStock > 0 && newStock < 10) {
      await Notification.create({
        type: "Low Stock Alert",
        title: "Low Stock Alert",
        message: `${item.name} is running low. Only ${newStock} units remaining.`,
        relatedId: item.productId,
        relatedModel: "Product",
        priority: "high",
      });
    } else if (newStock === 0) {
      await Notification.create({
        type: "Low Stock Alert",
        title: "Out of Stock",
        message: `${item.name} is now OUT OF STOCK.`,
        relatedId: item.productId,
        relatedModel: "Product",
        priority: "high",
      });
    }
  }

  // Create payment record
  await Payment.create({
    orderId: savedOrder._id,
    billNumber: savedOrder.billNumber,
    customer: {
      fullName: savedOrder.customer.fullName,
      mobile: savedOrder.customer.mobile,
    },
    amount: savedOrder.totalAmount,
    method: savedOrder.paymentMethod,
    gateway: savedOrder.paymentGateway || null,
    status: savedOrder.paymentMethod === "COD" ? "pending" : "completed",
  });

  // Create notification
  await Notification.create({
    type: "New Order",
    title: "New Order Received",
    message: `New order ${savedOrder.billNumber} from ${savedOrder.customer.fullName}`,
    relatedId: savedOrder._id,
    relatedModel: "Order",
    priority: "high",
  });

  return await Order.findById(savedOrder._id)
    .populate("items.productId", "name imageUrl category stock")
    .lean();
};

/**
 * Checkout - Create order from cart (public endpoint for customers)
 */
export const checkout = async (checkoutData) => {
  const {
    fullName,
    phoneNumber,
    email,
    deliveryAddress,
    paymentMethod, // "cod" or "online"
    paymentGateway, // "esewa", "khalti", "card" (required if online)
    items, // Array of { productId, quantity }
  } = checkoutData;

  // Validate required fields
  if (!fullName || !phoneNumber || !deliveryAddress) {
    throw new Error("Full name, phone number, and delivery address are required");
  }

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (!paymentMethod) {
    throw new Error("Payment method is required");
  }

  if (paymentMethod === "online" && !paymentGateway) {
    throw new Error("Payment gateway is required for online payment");
  }

  // Validate products and check stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  // Build items with totals
  const itemsWithTotals = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const price = product.finalPrice || product.price;
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    })
  );

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  // Calculate delivery fee (free if subtotal >= 2000)
  const deliveryFee = subtotal >= 2000 ? 0 : 500;

  // Calculate total amount
  const totalAmount = subtotal + deliveryFee;

  // Generate bill number
  const currentYear = new Date().getFullYear();
  const lastOrder = await Order.findOne(
    { billNumber: { $regex: `^FB-${currentYear}-` } },
    {},
    { sort: { billNumber: -1 } }
  );
  
  let nextBillNumber = 1;
  if (lastOrder && lastOrder.billNumber) {
    const lastBillParts = lastOrder.billNumber.split("-");
    if (lastBillParts.length === 3 && lastBillParts[2]) {
      const lastNumber = parseInt(lastBillParts[2]);
      if (!isNaN(lastNumber)) {
        nextBillNumber = lastNumber + 1;
      }
    }
  }
  const billNumber = `FB-${currentYear}-${String(nextBillNumber).padStart(3, "0")}`;

  // Prepare order data - set status to "pending" (requires admin acceptance)
  const orderData = {
    billNumber,
    customer: {
      fullName,
      mobile: phoneNumber,
      location: deliveryAddress,
      email: email,
    },
    items: itemsWithTotals,
    subtotal,
    deliveryFee,
    totalAmount,
    paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
    paymentGateway: paymentMethod === "online" ? paymentGateway : null,
    paymentStatus: paymentMethod === "online" ? "completed" : "pending",
    status: "pending", // Changed from "placed" to "pending" - requires admin acceptance
  };

  // Create order
  const order = new Order(orderData);
  const savedOrder = await order.save();

  // DO NOT update stock here - stock will be updated only when order is accepted
  // This prevents stock from being reserved before admin approval

  // Create payment record
  const payment = await Payment.create({
    orderId: savedOrder._id,
    billNumber: savedOrder.billNumber,
    customer: {
      fullName: savedOrder.customer.fullName,
      mobile: savedOrder.customer.mobile,
    },
    amount: savedOrder.totalAmount,
    method: savedOrder.paymentMethod,
    gateway: savedOrder.paymentGateway,
    status: savedOrder.paymentStatus,
    notes: paymentMethod === "online" 
      ? `Paid via ${paymentGateway}` 
      : "Cash on Delivery",
  });

  // Create notification for admin - order needs approval
  await Notification.create({
    type: "New Order",
    title: "New Order Pending Approval",
    message: `New order ${savedOrder.billNumber} from ${savedOrder.customer.fullName} - Rs. ${savedOrder.totalAmount.toLocaleString()} - Requires approval`,
    relatedId: savedOrder._id,
    relatedModel: "Order",
    priority: "high",
  });

  // Create payment notification
  await Notification.create({
    type: "New Payment",
    title: paymentMethod === "online" ? "Online Payment Received" : "COD Order Placed",
    message: `Payment of Rs. ${savedOrder.totalAmount.toLocaleString()} via ${savedOrder.paymentMethod}${savedOrder.paymentGateway ? ` (${savedOrder.paymentGateway})` : ""}`,
    relatedId: payment._id,
    relatedModel: "Payment",
    priority: paymentMethod === "online" ? "high" : "medium",
  });

  // Return populated order
  const populatedOrder = await Order.findById(savedOrder._id)
    .populate("items.productId", "name imageUrl category stock")
    .lean();

  // Format response with name and address
  const formattedOrder = {
    ...populatedOrder,
    customer: {
      ...populatedOrder.customer,
      name: populatedOrder.customer.fullName,
      address: populatedOrder.customer.location,
    },
  };

  return {
    order: formattedOrder,
    payment: {
      _id: payment._id,
      billNumber: payment.billNumber,
      amount: payment.amount,
      method: payment.method,
      gateway: payment.gateway,
      status: payment.status,
    },
  };
};

export const updateOrderStatus = async (id, status) => {
  const validStatuses = ["pending", "placed", "accepted", "rejected", "in-progress", "delivered", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("items.productId", "name imageUrl category stock")
    .lean();

  if (!order) return null;

  // If order is completed, update payment status
  if (status === "completed") {
    await Payment.findOneAndUpdate(
      { orderId: id },
      { status: "completed" },
      { new: true }
    );
  }

  return order;
};

/**
 * Accept a pending order
 * This will update stock and mark order as accepted
 */
export const acceptOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    throw new Error(`Order cannot be accepted. Current status: ${order.status}`);
  }

  // Update order status to accepted
  order.status = "accepted";
  order.acceptedAt = new Date();
  await order.save();

  // Now update product stock and sales, create inventory transactions
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    // Check stock again (in case it changed since order was placed)
    if (product.stock < item.quantity) {
      // Reject order if stock is insufficient
      order.status = "rejected";
      order.rejectedAt = new Date();
      order.rejectionReason = `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`;
      await order.save();
      throw new Error(order.rejectionReason);
    }

    const previousStock = product.stock;
    const newStock = previousStock - item.quantity;

    // Update product stock
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, totalSold: item.quantity },
    });

    // Create inventory transaction record
    await Inventory.create({
      productId: item.productId,
      productName: item.name,
      type: "remove",
      quantity: item.quantity,
      previousStock,
      newStock,
      reason: `Sold via Order ${order.billNumber}`,
      notes: `Customer: ${order.customer.fullName}`,
    });

    // Create low stock alert if needed
    if (newStock > 0 && newStock < 10) {
      await Notification.create({
        type: "Low Stock Alert",
        title: "Low Stock Alert",
        message: `${item.name} is running low. Only ${newStock} units remaining.`,
        relatedId: item.productId,
        relatedModel: "Product",
        priority: "high",
      });
    } else if (newStock === 0) {
      await Notification.create({
        type: "Low Stock Alert",
        title: "Out of Stock",
        message: `${item.name} is now OUT OF STOCK.`,
        relatedId: item.productId,
        relatedModel: "Product",
        priority: "high",
      });
    }
  }

  // Create notification
  await Notification.create({
    type: "New Order",
    title: "Order Accepted",
    message: `Order ${order.billNumber} has been accepted and stock updated.`,
    relatedId: order._id,
    relatedModel: "Order",
    priority: "medium",
  });

  return await Order.findById(orderId)
    .populate("items.productId", "name imageUrl category stock")
    .lean();
};

/**
 * Reject a pending order
 */
export const rejectOrder = async (orderId, rejectionReason = "") => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    throw new Error(`Order cannot be rejected. Current status: ${order.status}`);
  }

  // Update order status to rejected
  order.status = "rejected";
  order.rejectedAt = new Date();
  order.rejectionReason = rejectionReason || "Order rejected by admin";
  await order.save();

  // If payment was made online, refund should be processed (not implemented here)
  // For COD orders, no refund needed

  // Create notification
  await Notification.create({
    type: "New Order",
    title: "Order Rejected",
    message: `Order ${order.billNumber} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
    relatedId: order._id,
    relatedModel: "Order",
    priority: "medium",
  });

  return await Order.findById(orderId)
    .populate("items.productId", "name imageUrl category stock")
    .lean();
};

export const deleteOrder = async (id) => {
  return await Order.findByIdAndDelete(id);
};















