import {
  getTopSellingProducts,
  getSalesInsights,
} from "../services/topSellers.service.js";

export const fetchTopSellingProducts = async (req, res) => {
  try {
    const result = await getTopSellingProducts(req.query);
    res.status(200).json({
      success: true,
      message: "Top selling products fetched successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching top selling products",
    });
  }
};

export const fetchSalesInsights = async (req, res) => {
  try {
    const insights = await getSalesInsights();
    res.status(200).json({
      success: true,
      message: "Sales insights fetched successfully",
      data: insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching sales insights",
    });
  }
};












