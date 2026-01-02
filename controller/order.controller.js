import {
  getAllOrders,
  getOrderById,
  getOrderByBillNumber,
  createOrder,
  updateOrderStatus,
  deleteOrder,
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
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
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
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
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









