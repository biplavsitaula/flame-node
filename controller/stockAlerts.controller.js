import {
  getOutOfStockProducts,
  getLowStockProducts,
  getAllStockAlerts,
  generateReorderReport,
  reorderProduct,
} from "../services/stockAlerts.service.js";

export const fetchOutOfStockProducts = async (req, res) => {
  try {
    const result = await getOutOfStockProducts(req.query);
    res.status(200).json({
      success: true,
      message: "Out of stock products fetched successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching out of stock products",
    });
  }
};

export const fetchLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const result = await getLowStockProducts(req.query, threshold);
    res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching low stock products",
    });
  }
};

export const fetchAllStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const alerts = await getAllStockAlerts(threshold);
    res.status(200).json({
      success: true,
      message: "Stock alerts fetched successfully",
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching stock alerts",
    });
  }
};

export const generateReorderReportData = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const report = await generateReorderReport(threshold);
    res.status(200).json({
      success: true,
      message: "Reorder report generated successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error generating reorder report",
    });
  }
};

export const reorderProductStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }
    const product = await reorderProduct(id, quantity);
    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating product stock",
    });
  }
};









