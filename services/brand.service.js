import Brand from "../models/brand.model.js";
import Product from "../models/product.models.js";

/**
 * Get all brands
 */
export const getAllBrands = async (query = {}) => {
  try {
    const { isActive, sortBy = "order", sortOrder = "asc" } = query;

    const filter = {};

    // Filter by active status - only apply if explicitly provided
    // If not provided, return all brands (both active and inactive)
    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    // Sort - handle case where sortBy field might not exist
    const sortOptions = {};
    // Validate sortBy field exists in schema, default to createdAt if not
    const validSortFields = ["order", "name", "createdAt", "updatedAt", "isActive"];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortOptions[finalSortBy] = sortOrder === "asc" ? 1 : -1;

    // Debug logging
    console.log("🔍 Fetching brands with filter:", JSON.stringify(filter));
    console.log("🔍 Sort options:", JSON.stringify(sortOptions));
    console.log("🔍 Query params received:", query);

    const brands = await Brand.find(filter).sort(sortOptions).lean();

    console.log(`📊 Found ${brands.length} brands in database`);
    
    if (brands.length === 0) {
      console.warn("⚠️  No brands found with filter:", filter);
      // Try without any filter to see if brands exist
      const allBrands = await Brand.find({}).limit(5).lean();
      console.log(`📊 Total brands in database (no filter): ${allBrands.length}`);
      if (allBrands.length > 0) {
        console.log("📋 Sample brand:", JSON.stringify(allBrands[0], null, 2));
      }
      return [];
    }

    // Get product count per brand and ensure all fields are included
    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        try {
          const count = await Product.countDocuments({ brand: brand.name });
          const brandData = {
            _id: brand._id,
            name: brand.name,
            logo: brand.logo || "",
            description: brand.description || "",
            website: brand.website || "",
            isActive: brand.isActive !== undefined ? brand.isActive : true,
            order: brand.order || 0,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            __v: brand.__v || 0,
            productCount: count,
          };
          console.log(`✅ Processed brand: ${brand.name} (${count} products)`);
          return brandData;
        } catch (error) {
          console.error(`❌ Error processing brand ${brand.name}:`, error);
          // Return brand data without product count if count fails
          return {
            _id: brand._id,
            name: brand.name,
            logo: brand.logo || "",
            description: brand.description || "",
            website: brand.website || "",
            isActive: brand.isActive !== undefined ? brand.isActive : true,
            order: brand.order || 0,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            __v: brand.__v || 0,
            productCount: 0,
          };
        }
      })
    );

    console.log(`✅ Returning ${brandsWithCount.length} brands with product counts`);
    return brandsWithCount;
  } catch (error) {
    console.error("❌ Error in getAllBrands:", error);
    throw error;
  }
};

/**
 * Get brand by ID
 */
export const getBrandById = async (id) => {
  const brand = await Brand.findById(id).lean();
  if (!brand) return null;

  const productCount = await Product.countDocuments({ brand: brand.name });

  return {
    _id: brand._id,
    name: brand.name,
    logo: brand.logo || "",
    description: brand.description || "",
    website: brand.website || "",
    isActive: brand.isActive !== undefined ? brand.isActive : true,
    order: brand.order || 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
    __v: brand.__v || 0,
    productCount,
  };
};

/**
 * Get brand by name
 */
export const getBrandByName = async (name) => {
  const brand = await Brand.findOne({ name: name.trim() }).lean();
  if (!brand) return null;

  const productCount = await Product.countDocuments({ brand: brand.name });

  return {
    _id: brand._id,
    name: brand.name,
    logo: brand.logo || "",
    description: brand.description || "",
    website: brand.website || "",
    isActive: brand.isActive !== undefined ? brand.isActive : true,
    order: brand.order || 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
    __v: brand.__v || 0,
    productCount,
  };
};

/**
 * Create a new brand
 */
export const createBrand = async (brandData) => {
  // Check if brand with same name already exists
  const existingBrand = await Brand.findOne({
    name: { $regex: new RegExp(`^${brandData.name.trim()}$`, "i") },
  });

  if (existingBrand) {
    throw new Error(`Brand with name "${brandData.name}" already exists`);
  }

  const brand = new Brand({
    name: brandData.name.trim(),
    logo: brandData.logo?.trim() || "",
    description: brandData.description?.trim() || "",
    website: brandData.website?.trim() || "",
    isActive: brandData.isActive !== undefined ? brandData.isActive : true,
    order: brandData.order || 0,
  });

  const savedBrand = await brand.save();

  const productCount = await Product.countDocuments({ brand: savedBrand.name });

  return {
    ...savedBrand.toObject(),
    productCount,
  };
};

/**
 * Update brand
 */
export const updateBrand = async (id, brandData) => {
  const brand = await Brand.findById(id);
  if (!brand) return null;

  // If name is being updated, check for duplicates
  if (brandData.name && brandData.name.trim() !== brand.name) {
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${brandData.name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingBrand) {
      throw new Error(`Brand with name "${brandData.name}" already exists`);
    }

    // Update all products with the old brand name to the new brand name
    await Product.updateMany({ brand: brand.name }, { brand: brandData.name.trim() });
  }

  // Update brand fields
  if (brandData.name !== undefined) brand.name = brandData.name.trim();
  if (brandData.logo !== undefined) brand.logo = brandData.logo.trim();
  if (brandData.description !== undefined) brand.description = brandData.description.trim();
  if (brandData.website !== undefined) brand.website = brandData.website.trim();
  if (brandData.isActive !== undefined) brand.isActive = brandData.isActive;
  if (brandData.order !== undefined) brand.order = brandData.order;

  const updatedBrand = await brand.save();

  const productCount = await Product.countDocuments({ brand: updatedBrand.name });

  return {
    ...updatedBrand.toObject(),
    productCount,
  };
};

/**
 * Delete brand
 */
export const deleteBrand = async (id) => {
  const brand = await Brand.findById(id);
  if (!brand) return null;

  // Check if any products are using this brand
  const productCount = await Product.countDocuments({ brand: brand.name });

  if (productCount > 0) {
    throw new Error(
      `Cannot delete brand "${brand.name}" because ${productCount} product(s) are using it. Please update or remove those products first.`
    );
  }

  await Brand.findByIdAndDelete(id);
  return { message: `Brand "${brand.name}" deleted successfully` };
};





