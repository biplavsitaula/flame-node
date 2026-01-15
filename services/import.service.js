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

  // Get total row count
  const totalRows = worksheet.rowCount;
  console.log(`📊 Total rows in worksheet: ${totalRows}`);

  // Skip header row (row 1), start from row 2
  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
    try {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (!row || !row.hasValues) {
        console.log(`⏭️  Skipping empty row ${rowNumber}`);
        continue;
      }

      const productData = parseProductRow(row, rowNumber);
      console.log(`📝 Parsing row ${rowNumber}:`, productData);

      // Validate required fields
      if (!productData.name || !productData.category || productData.price === undefined || productData.stock === undefined) {
        const missingFields = [];
        if (!productData.name) missingFields.push("Name");
        if (!productData.category) missingFields.push("Category");
        if (productData.price === undefined) missingFields.push("Price");
        if (productData.stock === undefined) missingFields.push("Stock");
        
        results.errors.push({
          row: rowNumber,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          data: productData,
        });
        console.log(`❌ Row ${rowNumber} validation failed: Missing ${missingFields.join(", ")}`);
        continue;
      }

      // Validate category
      if (!validCategories.includes(productData.category.toLowerCase())) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Invalid category: ${productData.category}. Valid categories: ${validCategories.join(", ")}`,
        });
        console.log(`❌ Row ${rowNumber} validation failed: Invalid category ${productData.category}`);
        continue;
      }

      // Validate price
      if (productData.price < 0 || isNaN(productData.price)) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Price must be a positive number. Got: ${productData.price}`,
        });
        console.log(`❌ Row ${rowNumber} validation failed: Invalid price ${productData.price}`);
        continue;
      }

      // Validate stock
      if (productData.stock < 0 || isNaN(productData.stock)) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Stock must be a positive number. Got: ${productData.stock}`,
        });
        console.log(`❌ Row ${rowNumber} validation failed: Invalid stock ${productData.stock}`);
        continue;
      }

      // Validate discount percent
      if (productData.discountPercent !== undefined && productData.discountPercent !== null) {
        if (productData.discountPercent < 0 || productData.discountPercent > 100 || isNaN(productData.discountPercent)) {
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            error: `Discount Percent must be between 0 and 100. Got: ${productData.discountPercent}`,
          });
          console.log(`❌ Row ${rowNumber} validation failed: Invalid discount percent ${productData.discountPercent}`);
          continue;
        }
      }

      // Validate alcohol percentage
      if (productData.alcoholPercentage !== undefined && productData.alcoholPercentage !== null) {
        if (productData.alcoholPercentage < 0 || productData.alcoholPercentage > 100 || isNaN(productData.alcoholPercentage)) {
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            error: `Alcohol Percentage must be between 0 and 100. Got: ${productData.alcoholPercentage}`,
          });
          console.log(`❌ Row ${rowNumber} validation failed: Invalid alcohol percentage ${productData.alcoholPercentage}`);
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

        const newProduct = await Product.create({
          name: productData.name,
          category: productData.category,
          brand: productData.brand || "",
          price: productData.price,
          discountPercent: discountPercent,
          discountAmount,
          finalPrice,
          stock: productData.stock,
          alcoholPercentage: productData.alcoholPercentage || undefined,
          volume: productData.volume || "",
          imageUrl: productData.imageUrl || "",
          tag: productData.tag || "",
          isRecommended: productData.isRecommended || false,
        });

        console.log(`✅ Created product: ${newProduct.name}`);
        results.created++;
      }
    } catch (error) {
      console.error(`❌ Error processing row ${rowNumber}:`, error.message);
      results.errors.push({
        row: rowNumber,
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  console.log(`📊 Import summary: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`);
  return results;
};

/**
 * Parse a single row from Excel worksheet
 */
const parseProductRow = (row, rowNumber) => {
  const getCellValue = (index) => {
    try {
      const cell = row.getCell(index);
      if (!cell || cell.value === null || cell.value === undefined || cell.value === "") {
        return null;
      }
      // Handle formula cells
      if (cell.type === "formula") {
        return cell.result || null;
      }
      return cell.value;
    } catch (error) {
      console.warn(`⚠️  Error reading cell ${index} in row ${rowNumber}:`, error.message);
      return null;
    }
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

