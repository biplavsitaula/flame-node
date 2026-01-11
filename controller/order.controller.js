import {
  getAllOrders,
  getOrderById,
  getOrderByBillNumber,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  checkout,
  acceptOrder,
  rejectOrder,
} from "../services/order.service.js";

export const fetchAllOrders = async (req, res) => {
  try {
    const result = await getAllOrders(req.query);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching orders",
    });
  }
};

export const fetchOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    // Format response with status information for frontend
    let statusMessage = "";
    let buttonText = "";
    let showSuccess = false;
    let showReject = false;
    
    switch (order.status) {
      case "pending":
        statusMessage = "Waiting for admin approval";
        buttonText = "Pending Approval";
        break;
      case "accepted":
        statusMessage = "Order accepted and being processed";
        buttonText = "Order Accepted";
        showSuccess = true;
        break;
      case "rejected":
        statusMessage = order.rejectionReason || "Order has been rejected";
        buttonText = "Order Rejected";
        showReject = true;
        break;
      case "in-progress":
        statusMessage = "Order is being prepared";
        buttonText = "In Progress";
        showSuccess = true;
        break;
      case "delivered":
        statusMessage = "Order has been delivered";
        buttonText = "Delivered";
        showSuccess = true;
        break;
      case "completed":
        statusMessage = "Order completed";
        buttonText = "Completed";
        showSuccess = true;
        break;
      default:
        statusMessage = "Order status: " + order.status;
        buttonText = order.status;
    }
    
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: {
        ...order,
        statusInfo: {
          status: order.status,
          message: statusMessage,
          buttonText,
          showSuccess,
          showReject,
          rejectionReason: order.rejectionReason || null,
          acceptedAt: order.acceptedAt || null,
          rejectedAt: order.rejectedAt || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching order",
    });
  }
};

export const fetchOrderByBillNumber = async (req, res) => {
  const { billNumber } = req.params;
  try {
    const order = await getOrderByBillNumber(billNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    // Format response with status information for frontend
    let statusMessage = "";
    let buttonText = "";
    let showSuccess = false;
    let showReject = false;
    
    switch (order.status) {
      case "pending":
        statusMessage = "Waiting for admin approval";
        buttonText = "Pending Approval";
        break;
      case "accepted":
        statusMessage = "Order accepted and being processed";
        buttonText = "Order Accepted";
        showSuccess = true;
        break;
      case "rejected":
        statusMessage = order.rejectionReason || "Order has been rejected";
        buttonText = "Order Rejected";
        showReject = true;
        break;
      case "in-progress":
        statusMessage = "Order is being prepared";
        buttonText = "In Progress";
        showSuccess = true;
        break;
      case "delivered":
        statusMessage = "Order has been delivered";
        buttonText = "Delivered";
        showSuccess = true;
        break;
      case "completed":
        statusMessage = "Order completed";
        buttonText = "Completed";
        showSuccess = true;
        break;
      default:
        statusMessage = "Order status: " + order.status;
        buttonText = order.status;
    }
    
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: {
        ...order,
        statusInfo: {
          status: order.status,
          message: statusMessage,
          buttonText,
          showSuccess,
          showReject,
          rejectionReason: order.rejectionReason || null,
          acceptedAt: order.acceptedAt || null,
          rejectedAt: order.rejectedAt || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching order",
    });
  }
};

export const createNewOrder = async (req, res) => {
  try {
    const newOrder = await createOrder(req.body);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating order",
    });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }
    const updatedOrder = await updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating order",
    });
  }
};

export const deleteOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await deleteOrder(id);
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting order",
    });
  }
};

/**
 * POST /checkout
 * Public endpoint for customers to place orders
 */
export const processCheckout = async (req, res) => {
  try {
    const result = await checkout(req.body);
    
    // Get order status
    const orderStatus = result.order?.status || "pending";
    
    // Determine message, button text, and flags based on order status
    let message = "Order placed successfully. Waiting for admin approval.";
    let buttonText = "Pending Approval";
    let showSuccess = false;
    let showReject = false;
    
    switch (orderStatus) {
      case "pending":
        message = "Order placed successfully. Waiting for admin approval.";
        buttonText = "Pending Approval";
        break;
      case "accepted":
        message = "Order accepted successfully! Your order is being processed.";
        buttonText = "Order Accepted";
        showSuccess = true;
        break;
      case "rejected":
        message = result.order?.rejectionReason 
          ? `Order rejected: ${result.order.rejectionReason}`
          : "Order has been rejected. Please contact support.";
        buttonText = "Order Rejected";
        showReject = true;
        break;
      case "in-progress":
        message = "Order is being prepared";
        buttonText = "In Progress";
        showSuccess = true;
        break;
      case "delivered":
        message = "Order has been delivered";
        buttonText = "Delivered";
        showSuccess = true;
        break;
      case "completed":
        message = "Order completed";
        buttonText = "Completed";
        showSuccess = true;
        break;
      default:
        message = "Order placed successfully";
        buttonText = orderStatus;
    }
    
    res.status(201).json({
      success: true,
      message,
      status: orderStatus,
      data: {
        ...result,
        orderStatus,
        billNumber: result.order?.billNumber,
        canCheckStatus: true, // Flag to indicate status can be checked
        statusInfo: {
          status: orderStatus,
          message,
          buttonText,
          showSuccess,
          showReject,
          rejectionReason: result.order?.rejectionReason || null,
          acceptedAt: result.order?.acceptedAt || null,
          rejectedAt: result.order?.rejectedAt || null,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error processing checkout",
    });
  }
};

/**
 * POST /orders/:id/accept
 * Accept a pending order (admin only)
 */
export const acceptOrderController = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await acceptOrder(id);
    res.status(200).json({
      success: true,
      message: "Order accepted successfully. Stock has been updated.",
      status: "accepted",
      data: {
        ...order,
        statusInfo: {
          status: "accepted",
          message: "Order accepted and being processed",
          buttonText: "Order Accepted",
          showSuccess: true,
          showReject: false,
          acceptedAt: order.acceptedAt || new Date(),
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error accepting order",
    });
  }
};

/**
 * POST /orders/:id/reject
 * Reject a pending order (admin only)
 */
export const rejectOrderController = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  try {
    const order = await rejectOrder(id, rejectionReason);
    res.status(200).json({
      success: true,
      message: rejectionReason 
        ? `Order rejected: ${rejectionReason}` 
        : "Order rejected successfully",
      status: "rejected",
      data: {
        ...order,
        statusInfo: {
          status: "rejected",
          message: rejectionReason || "Order has been rejected",
          buttonText: "Order Rejected",
          showSuccess: false,
          showReject: true,
          rejectionReason: order.rejectionReason || rejectionReason || null,
          rejectedAt: order.rejectedAt || new Date(),
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error rejecting order",
    });
  }
};
















