import {
  getAllInventoryTransactions,
  bulkAddStock,
  bulkRemoveStock,
  getInventoryTransactionById,
  getProductStockHistory,
} from "../services/inventory.service.js";

/**
 * GET /inventory
 * Get all inventory transactions
 */
export const fetchAllInventoryTransactions = async (req, res) => {
  try {
    const result = await getAllInventoryTransactions(req.query);
    res.status(200).json({
      success: true,
      message: "Inventory transactions fetched successfully",
      data: result.transactions,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching inventory transactions",
    });
  }
};

/**
 * GET /inventory/:id
 * Get inventory transaction by ID
 */
export const fetchInventoryTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await getInventoryTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Inventory transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching inventory transaction",
    });
  }
};

/**
 * GET /inventory/product/:productId
 * Get stock history for a product
 */
export const fetchProductStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await getProductStockHistory(productId);
    res.status(200).json({
      success: true,
      message: "Product stock history fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Error fetching product stock history",
    });
  }
};

/**
 * POST /inventory/add
 * Bulk add stock to a product
 */
export const addBulkStock = async (req, res) => {
  try {
    const result = await bulkAddStock(req.body);
    res.status(201).json({
      success: true,
      message: `Successfully added ${result.product.addedQuantity} units to ${result.product.name}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error adding stock",
    });
  }
};

/**
 * POST /inventory/remove
 * Bulk remove stock from a product
 */
export const removeBulkStock = async (req, res) => {
  try {
    const result = await bulkRemoveStock(req.body);
    res.status(200).json({
      success: true,
      message: `Successfully removed ${result.product.removedQuantity} units from ${result.product.name}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error removing stock",
    });
  }
};



