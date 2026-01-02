import {
  getAllPayments,
  getPaymentById,
  getPaymentSummary,
  createPayment,
  updatePaymentStatus,
  deletePayment,
} from "../services/payment.service.js";

export const fetchAllPayments = async (req, res) => {
  try {
    const result = await getAllPayments(req.query);
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: result.payments,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching payments",
    });
  }
};

export const fetchPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching payment",
    });
  }
};

export const fetchPaymentSummary = async (req, res) => {
  try {
    const summary = await getPaymentSummary();
    res.status(200).json({
      success: true,
      message: "Payment summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching payment summary",
    });
  }
};

export const createNewPayment = async (req, res) => {
  try {
    const newPayment = await createPayment(req.body);
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating payment",
    });
  }
};

export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }
    const updatedPayment = await updatePaymentStatus(id, status);
    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating payment",
    });
  }
};

export const deletePaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPayment = await deletePayment(id);
    if (!deletedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting payment",
    });
  }
};









