import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../services/brand.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get all brands
 */
export const fetchAllBrands = asyncHandler(async (req, res) => {
  const brands = await getAllBrands(req.query);
  res.status(200).json({
    success: true,
    message: "Brands fetched successfully",
    data: brands,
  });
});

/**
 * Get brand by ID
 */
export const fetchBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await getBrandById(id);

  if (!brand) {
    return res.status(404).json({
      success: false,
      message: "Brand not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Brand fetched successfully",
    data: brand,
  });
});

/**
 * Create a new brand
 */
export const createNewBrand = asyncHandler(async (req, res) => {
  const { name, logo, description, website, isActive, order } = req.body;

  // Validate required fields
  if (!name || (typeof name === "string" && name.trim() === "")) {
    return res.status(400).json({
      success: false,
      message: "Brand name is required",
    });
  }

  const brand = await createBrand({
    name,
    logo,
    description,
    website,
    isActive,
    order,
  });

  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: brand,
  });
});

/**
 * Update brand
 */
export const updateExistingBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedBrand = await updateBrand(id, req.body);

  if (!updatedBrand) {
    return res.status(404).json({
      success: false,
      message: "Brand not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    data: updatedBrand,
  });
});

/**
 * Delete brand
 */
export const deleteBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteBrand(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Brand not found",
    });
  }

  res.status(200).json({
    success: true,
    message: result.message || "Brand deleted successfully",
  });
});

