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
      "Product ID",
      "Name",
      "Category",
      "Price",
      "Stock",
      "Status",
      "Rating",
      "Sales",
      "In Stock",
      "Is New",
      "Volume",
      "Alcohol Co",
      "Origin",
      "Created Date",
    ],
    sampleRows: [
      [
        "",
        "Johnnie Walker Black Label",
        "whiskey",
        2500,
        50,
        "In Stock",
        4.5,
        120,
        "Yes",
        "Yes",
        "750ml",
        40,
        "Scotland",
        "",
      ],
      [
        "",
        "Absolut Vodka",
        "vodka",
        1800,
        75,
        "In Stock",
        4.2,
        95,
        "Yes",
        "No",
        "750ml",
        40,
        "Sweden",
        "",
      ],
      [
        "",
        "Bacardi White Rum",
        "rum",
        1200,
        100,
        "In Stock",
        4.0,
        150,
        "Yes",
        "No",
        "750ml",
        40,
        "Puerto Rico",
        "",
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

      // Find existing product: first by Product ID if provided, otherwise by name
      let existingProduct = null;
      
      if (productData.productId) {
        // Try to find by MongoDB _id
        try {
          existingProduct = await Product.findById(productData.productId);
          if (existingProduct) {
            console.log(`🔍 Found product by ID: ${productData.productId}`);
          }
        } catch (error) {
          console.log(`⚠️  Invalid Product ID format: ${productData.productId}`);
        }
      }
      
      // If not found by ID, try to find by name (case-insensitive)
      if (!existingProduct && productData.name) {
        existingProduct = await Product.findOne({
          name: { $regex: new RegExp(`^${productData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
        });
        if (existingProduct) {
          console.log(`🔍 Found product by name: ${productData.name}`);
        }
      }

      if (existingProduct) {
        // Update existing product
        console.log(`🔄 Updating product: ${existingProduct.name} -> ${productData.name}`);
        
        // Calculate discount and final price
        const discountPercent = productData.discountPercent !== undefined ? productData.discountPercent : existingProduct.discountPercent || 0;
        const discountAmount = (productData.price * discountPercent) / 100;
        const finalPrice = productData.price - discountAmount;

        // Build update data - update all provided fields
        const updateData = {
          name: productData.name, // Update name even if it changed
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          discountPercent,
          discountAmount,
          finalPrice,
        };

        // Update rating if provided
        if (productData.rating !== undefined && productData.rating !== null && !isNaN(productData.rating)) {
          updateData.rating = Math.min(5, Math.max(0, productData.rating)); // Clamp between 0-5
        }

        // Update totalSold (Sales) if provided
        if (productData.totalSold !== undefined && productData.totalSold !== null && !isNaN(productData.totalSold)) {
          updateData.totalSold = Math.max(0, productData.totalSold);
        }

        // Update optional fields if provided (even if empty string)
        if (productData.brand !== undefined && productData.brand !== null) {
          updateData.brand = productData.brand;
        }
        if (productData.alcoholPercentage !== undefined && productData.alcoholPercentage !== null) {
          updateData.alcoholPercentage = productData.alcoholPercentage;
        }
        if (productData.volume !== undefined && productData.volume !== null) {
          updateData.volume = productData.volume;
        }
        if (productData.imageUrl !== undefined && productData.imageUrl !== null) {
          updateData.imageUrl = productData.imageUrl;
        }
        if (productData.tag !== undefined && productData.tag !== null) {
          updateData.tag = productData.tag;
        }
        if (productData.isRecommended !== undefined) {
          updateData.isRecommended = productData.isRecommended;
        }

        // Update the product and ensure it's saved
        const updatedProduct = await Product.findByIdAndUpdate(
          existingProduct._id,
          updateData,
          { new: true, runValidators: true }
        );

        if (updatedProduct) {
          console.log(`✅ Updated product: ${updatedProduct.name} (ID: ${updatedProduct._id})`);
          results.updated++;
        } else {
          console.error(`❌ Failed to update product: ${existingProduct._id}`);
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            error: "Failed to update product in database",
          });
        }
      } else {
        // Create new product
        // Calculate discount and final price
        const discountPercent = productData.discountPercent || 0;
        const discountAmount = (productData.price * discountPercent) / 100;
        const finalPrice = productData.price - discountAmount;

        // Double-check that product doesn't exist by name (to prevent duplicates)
        const duplicateCheck = await Product.findOne({
          name: { $regex: new RegExp(`^${productData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
        });

        if (duplicateCheck) {
          console.log(`⚠️  Product with name "${productData.name}" already exists. Updating instead of creating.`);
          // Update the existing product instead
          const discountPercent = productData.discountPercent || duplicateCheck.discountPercent || 0;
          const discountAmount = (productData.price * discountPercent) / 100;
          const finalPrice = productData.price - discountAmount;

          const updateData = {
            name: productData.name,
            category: productData.category,
            price: productData.price,
            stock: productData.stock,
            discountPercent,
            discountAmount,
            finalPrice,
          };

          // Update rating if provided
          if (productData.rating !== undefined && productData.rating !== null && !isNaN(productData.rating)) {
            updateData.rating = Math.min(5, Math.max(0, productData.rating));
          }

          // Update totalSold if provided
          if (productData.totalSold !== undefined && productData.totalSold !== null && !isNaN(productData.totalSold)) {
            updateData.totalSold = Math.max(0, productData.totalSold);
          }

          if (productData.brand !== undefined && productData.brand !== null) {
            updateData.brand = productData.brand;
          }
          if (productData.alcoholPercentage !== undefined && productData.alcoholPercentage !== null) {
            updateData.alcoholPercentage = productData.alcoholPercentage;
          }
          if (productData.volume !== undefined && productData.volume !== null) {
            updateData.volume = productData.volume;
          }
          if (productData.imageUrl !== undefined && productData.imageUrl !== null) {
            updateData.imageUrl = productData.imageUrl;
          }
          if (productData.tag !== undefined && productData.tag !== null) {
            updateData.tag = productData.tag;
          }
          if (productData.isRecommended !== undefined) {
            updateData.isRecommended = productData.isRecommended;
          }

          await Product.findByIdAndUpdate(
            duplicateCheck._id,
            updateData,
            { new: true, runValidators: true }
          );

          console.log(`✅ Updated existing product: ${productData.name} (ID: ${duplicateCheck._id})`);
          results.updated++;
        } else {
          const newProduct = await Product.create({
            name: productData.name,
            category: productData.category,
            brand: productData.brand || "",
            price: productData.price,
            discountPercent: discountPercent,
            discountAmount,
            finalPrice,
            stock: productData.stock,
            rating: productData.rating || 0,
            totalSold: productData.totalSold || 0,
            alcoholPercentage: productData.alcoholPercentage || undefined,
            volume: productData.volume || "",
            imageUrl: productData.imageUrl || "",
            tag: productData.tag || "",
            isRecommended: productData.isRecommended || false,
          });

          console.log(`✅ Created new product: ${newProduct.name} (ID: ${newProduct._id})`);
          results.created++;
        }
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

  // Parse columns according to the new template structure:
  // 1: Product ID, 2: Name, 3: Category, 4: Price, 5: Stock, 6: Status (ignored), 
  // 7: Rating, 8: Sales, 9: In Stock (ignored), 10: Is New, 11: Volume, 
  // 12: Alcohol Co, 13: Origin, 14: Created Date (ignored)
  
  const productId = getCellValue(1);
  const productIdString = productId ? productId.toString().trim() : null;

  // Parse "Is New" - map to isRecommended
  const isNew = parseBoolean(getCellValue(10));
  
  // Parse "Origin" - map to tag field
  const origin = getCellValue(13)?.toString().trim() || "";

  return {
    productId: productIdString || null,
    name: getCellValue(2)?.toString().trim() || null,
    category: getCellValue(3)?.toString().trim().toLowerCase() || null,
    brand: "", // Brand not in template, keep empty
    price: parseNumber(getCellValue(4)),
    discountPercent: 0, // Discount not in template, default to 0
    stock: parseNumber(getCellValue(5), 0),
    rating: parseNumber(getCellValue(7), 0), // Rating from column 7
    totalSold: parseNumber(getCellValue(8), 0), // Sales from column 8
    alcoholPercentage: parseNumber(getCellValue(12)), // Alcohol Co from column 12
    volume: getCellValue(11)?.toString().trim() || "", // Volume from column 11
    imageUrl: "", // Image URL not in template
    tag: origin, // Origin maps to tag
    isRecommended: isNew, // Is New maps to isRecommended
    // Status, In Stock, Created Date are ignored (calculated/auto-generated)
  };
};

