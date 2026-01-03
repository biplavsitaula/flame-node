import {
  getAnalyticsSummary,
  getSalesTrend,
  getStockByCategory,
  getProductsByCategory,
  getRevenueByCategory,
} from "../services/analytics.service.js";

export const fetchAnalyticsSummary = async (req, res) => {
  try {
    const summary = await getAnalyticsSummary();
    res.status(200).json({
      success: true,
      message: "Analytics summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching analytics summary",
    });
  }
};

export const fetchSalesTrend = async (req, res) => {
  try {
    const trend = await getSalesTrend();
    res.status(200).json({
      success: true,
      message: "Sales trend fetched successfully",
      data: trend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching sales trend",
    });
  }
};

export const fetchStockByCategory = async (req, res) => {
  try {
    const stock = await getStockByCategory();
    res.status(200).json({
      success: true,
      message: "Stock by category fetched successfully",
      data: stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching stock by category",
    });
  }
};

export const fetchProductsByCategory = async (req, res) => {
  try {
    const products = await getProductsByCategory();
    res.status(200).json({
      success: true,
      message: "Products by category fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching products by category",
    });
  }
};

export const fetchRevenueByCategory = async (req, res) => {
  try {
    const revenue = await getRevenueByCategory();
    res.status(200).json({
      success: true,
      message: "Revenue by category fetched successfully",
      data: revenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching revenue by category",
    });
  }
};












