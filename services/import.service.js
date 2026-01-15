import Product from "../models/product.models.js";

// Valid categories
const validCategories = [
  "whiskey",
  "vodka",
  "rum",
  "gin",
  "tequila",
  "cognac",
  "champagne",
  "wine",
  "beer",
  "brandy",
];

/**
 * Generate product template data structure
 */
export const generateProductTemplate = () => {
  return {
    headers: [
      "Name",
      "Category",
      "Brand",
      "Price",
      "Discount Percent",
      "Stock",
      "Alcohol Percentage",
      "Volume",
      "Image URL",
      "Tag",
      "Is Recommended",
    ],
    sampleRows: [
      [
        "Johnnie Walker Black Label",
        "whiskey",
        "Johnnie Walker",
        2500,
        10,
        50,
        40,
        "750ml",
        "",
        "premium",
        "true",
      ],
      [
        "Absolut Vodka",
        "vodka",
        "Absolut",
        1800,
        5,
        75,
        40,
        "750ml",
        "",
        "popular",
        "false",
      ],
      [
        "Bacardi White Rum",
        "rum",
        "Bacardi",
        1200,
        0,
        100,
        40,
        "750ml",
        "",
        "",
        "false",
      ],
    ],
  };
};

/**
 * Parse Excel worksheet and import products
 */
export const importProductsFromFile = async (worksheet) => {
  const results = {
    created: 0,
    updated: 0,
    errors: [],
  };

  // Skip header row (row 1)
  let rowNumber = 2;

  for (const row of worksheet.getRows(2)) {
    try {
      const productData = parseProductRow(row, rowNumber);

      // Validate required fields
      if (!productData.name || !productData.category || productData.price === undefined || productData.stock === undefined) {
        results.errors.push({
          row: rowNumber,
          error: "Missing required fields: Name, Category, Price, or Stock",
        });
        rowNumber++;
        continue;
      }

      // Validate category
      if (!validCategories.includes(productData.category.toLowerCase())) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Invalid category: ${productData.category}. Valid categories: ${validCategories.join(", ")}`,
        });
        rowNumber++;
        continue;
      }

      // Validate price
      if (productData.price < 0) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: "Price must be positive",
        });
        rowNumber++;
        continue;
      }

      // Validate stock
      if (productData.stock < 0) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: "Stock must be positive",
        });
        rowNumber++;
        continue;
      }

      // Validate discount percent
      if (productData.discountPercent !== undefined) {
        if (productData.discountPercent < 0 || productData.discountPercent > 100) {
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            error: "Discount Percent must be between 0 and 100",
          });
          rowNumber++;
          continue;
        }
      }

      // Validate alcohol percentage
      if (productData.alcoholPercentage !== undefined) {
        if (productData.alcoholPercentage < 0 || productData.alcoholPercentage > 100) {
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            error: "Alcohol Percentage must be between 0 and 100",
          });
          rowNumber++;
          continue;
        }
      }

      // Check if product exists (by name, case-insensitive)
      const existingProduct = await Product.findOne({
        name: { $regex: new RegExp(`^${productData.name}$`, "i") },
      });

      if (existingProduct) {
        // Update existing product
        // Calculate discount and final price
        const discountPercent = productData.discountPercent !== undefined ? productData.discountPercent : existingProduct.discountPercent || 0;
        const discountAmount = (productData.price * discountPercent) / 100;
        const finalPrice = productData.price - discountAmount;

        // Preserve existing fields that shouldn't be overwritten
        const updateData = {
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          discountPercent,
          discountAmount,
          finalPrice,
        };

        // Only update optional fields if provided
        if (productData.brand !== undefined && productData.brand !== "") {
          updateData.brand = productData.brand;
        }
        if (productData.alcoholPercentage !== undefined) {
          updateData.alcoholPercentage = productData.alcoholPercentage;
        }
        if (productData.volume !== undefined) {
          updateData.volume = productData.volume;
        }
        if (productData.imageUrl !== undefined) {
          updateData.imageUrl = productData.imageUrl;
        }
        if (productData.tag !== undefined) {
          updateData.tag = productData.tag;
        }
        if (productData.isRecommended !== undefined) {
          updateData.isRecommended = productData.isRecommended;
        }

        await Product.findByIdAndUpdate(
          existingProduct._id,
          updateData,
          { new: true, runValidators: true }
        );

        results.updated++;
      } else {
        // Create new product
        // Calculate discount and final price
        const discountPercent = productData.discountPercent || 0;
        const discountAmount = (productData.price * discountPercent) / 100;
        const finalPrice = productData.price - discountAmount;

        await Product.create({
          ...productData,
          discountAmount,
          finalPrice,
        });

        results.created++;
      }
    } catch (error) {
      results.errors.push({
        row: rowNumber,
        error: error.message || "Unknown error",
      });
    }

    rowNumber++;
  }

  return results;
};

/**
 * Parse a single row from Excel worksheet
 */
const parseProductRow = (row, rowNumber) => {
  const getCellValue = (index) => {
    const cell = row.getCell(index);
    if (!cell || cell.value === null || cell.value === undefined) {
      return null;
    }
    return cell.value;
  };

  const parseBoolean = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      return lower === "true" || lower === "yes" || lower === "1";
    }
    return Boolean(value);
  };

  const parseNumber = (value, defaultValue = null) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.trim());
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  return {
    name: getCellValue(1)?.toString().trim() || null,
    category: getCellValue(2)?.toString().trim().toLowerCase() || null,
    brand: getCellValue(3)?.toString().trim() || "",
    price: parseNumber(getCellValue(4)),
    discountPercent: parseNumber(getCellValue(5), 0),
    stock: parseNumber(getCellValue(6), 0),
    alcoholPercentage: parseNumber(getCellValue(7)),
    volume: getCellValue(8)?.toString().trim() || "",
    imageUrl: getCellValue(9)?.toString().trim() || "",
    tag: getCellValue(10)?.toString().trim() || "",
    isRecommended: parseBoolean(getCellValue(11)),
  };
};

