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
      "Image",
      "Created Date",
    ],
    sampleRows: [
      [
        "Remy Martin VSOP",
        "cognac",
        "Rs. 4500.00",
        25,
        "In Stock",
        4.3,
        88,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Ciroc Vodka",
        "vodka",
        "Rs. 3200.00",
        43,
        "In Stock",
        4.0,
        98,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Jameson Irish Whiskey",
        "whiskey",
        "Rs. 2800.00",
        77,
        "In Stock",
        3.9,
        138,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Tanqueray London Dry",
        "gin",
        "Rs. 2400.00",
        27,
        "In Stock",
        4.2,
        201,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Jack Daniel's",
        "whiskey",
        "Rs. 3500.00",
        41,
        "In Stock",
        4.1,
        158,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Glenfiddich 21 Year",
        "whiskey",
        "Rs. 12500.00",
        34,
        "In Stock",
        4.5,
        234,
        "Yes",
        "No",
        "750ml",
        43,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Dom Perignon",
        "champagne",
        "Rs. 18000.00",
        62,
        "In Stock",
        4.6,
        56,
        "Yes",
        "No",
        "750ml",
        12.5,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Johnnie Walker Blue Label",
        "whiskey",
        "Rs. 22000.00",
        46,
        "In Stock",
        4.4,
        70,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Don Julio 1942",
        "tequila",
        "Rs. 8500.00",
        45,
        "In Stock",
        4.3,
        90,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
        "",
      ],
      [
        "Patron Silver",
        "tequila",
        "Rs. 6500.00",
        32,
        "In Stock",
        4.2,
        156,
        "Yes",
        "No",
        "750ml",
        40,
        "",
        "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=400",
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

  // Detect column structure from header row
  const headerRow = worksheet.getRow(1);
  const columnOffsets = detectColumnStructure(headerRow);
  console.log(`📋 Column structure detected:`, columnOffsets);

  // Log header row for debugging
  const headerValues = [];
  for (let i = 1; i <= 15; i++) {
    const cell = headerRow.getCell(i);
    headerValues.push(cell.value?.toString() || "");
  }
  console.log(`📋 Header row values:`, headerValues);

  // Skip header row (row 1), start from row 2
  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
    try {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (!row || !row.hasValues) {
        console.log(`⏭️  Skipping empty row ${rowNumber}`);
        continue;
      }

      const productData = parseProductRow(row, rowNumber, columnOffsets);
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

      // Validate category - check if it looks like a currency value
      if (!productData.category || productData.category.match(/^(rs\.?|[\d.,]+)/i)) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Invalid category: "${productData.category}". Category appears to be a price value. Please check your Excel file structure. Valid categories: ${validCategories.join(", ")}`,
        });
        console.log(`❌ Row ${rowNumber} validation failed: Category looks like currency: ${productData.category}`);
        continue;
      }

      if (!validCategories.includes(productData.category.toLowerCase())) {
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          error: `Invalid category: "${productData.category}". Valid categories: ${validCategories.join(", ")}`,
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
 * Detect column structure by finding column headers dynamically
 */
const detectColumnStructure = (headerRow) => {
  const getCellValue = (index) => {
    try {
      const cell = headerRow.getCell(index);
      if (!cell || cell.value === null || cell.value === undefined) {
        return null;
      }
      return cell.value.toString().trim().toLowerCase();
    } catch (error) {
      return null;
    }
  };

  // Find column indices by searching for header names
  const findColumnIndex = (searchTerms, startFrom = 1, maxColumns = 20) => {
    for (let i = startFrom; i <= maxColumns; i++) {
      const cellValue = getCellValue(i);
      if (cellValue) {
        for (const term of searchTerms) {
          if (cellValue.includes(term)) {
            return i;
          }
        }
      }
    }
    return null;
  };

  // Check if Product ID column exists
  const productIdIndex = findColumnIndex(["product id", "id"], 1, 3);
  const hasProductId = productIdIndex !== null;

  // Find all column indices dynamically
  const nameIndex = findColumnIndex(["name"], hasProductId ? 2 : 1) || (hasProductId ? 2 : 1);
  const categoryIndex = findColumnIndex(["category"], nameIndex + 1) || (hasProductId ? 3 : 2);
  const priceIndex = findColumnIndex(["price"], categoryIndex + 1) || (hasProductId ? 4 : 3);
  const stockIndex = findColumnIndex(["stock"], priceIndex + 1) || (hasProductId ? 5 : 4);
  const ratingIndex = findColumnIndex(["rating"], stockIndex + 1) || (hasProductId ? 7 : 6);
  const salesIndex = findColumnIndex(["sales"], ratingIndex + 1) || (hasProductId ? 8 : 7);
  const isNewIndex = findColumnIndex(["is new", "isnew"], salesIndex + 1) || (hasProductId ? 10 : 9);
  const volumeIndex = findColumnIndex(["volume"], isNewIndex + 1) || (hasProductId ? 11 : 10);
  const alcoholIndex = findColumnIndex(["alcohol co", "alcohol", "alcoholco"], volumeIndex + 1) || (hasProductId ? 12 : 11);
  const originIndex = findColumnIndex(["origin"], alcoholIndex + 1) || (hasProductId ? 13 : 12);
  const imageIndex = findColumnIndex(["image", "imageurl", "image url"], originIndex + 1) || (hasProductId ? 14 : 13);

  console.log(`🔍 Column detection - Product ID: ${hasProductId}, Image column found at index: ${imageIndex}`);
  
  return {
    hasProductId: hasProductId,
    nameOffset: nameIndex,
    categoryOffset: categoryIndex,
    priceOffset: priceIndex,
    stockOffset: stockIndex,
    ratingOffset: ratingIndex,
    salesOffset: salesIndex,
    isNewOffset: isNewIndex,
    volumeOffset: volumeIndex,
    alcoholOffset: alcoholIndex,
    originOffset: originIndex,
    imageOffset: imageIndex,
  };
};

/**
 * Parse a single row from Excel worksheet
 */
const parseProductRow = (row, rowNumber, columnOffsets) => {
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
      return lower === "true" || lower === "yes" || lower === "1" || lower === "y";
    }
    return Boolean(value);
  };

  const parseNumber = (value, defaultValue = null) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Remove currency symbols (Rs., $, etc.), commas, and whitespace
      const cleaned = value.replace(/[Rs$.,\s]/gi, "").trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  const cleanCategory = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
      // Remove any currency symbols or numbers that might have been read incorrectly
      const cleaned = value.toString().trim().toLowerCase();
      // If it looks like a currency value, return null
      if (cleaned.match(/^(rs\.?|[\d.,]+)/i)) {
        return null;
      }
      return cleaned;
    }
    return value.toString().trim().toLowerCase() || null;
  };

  // Get Product ID if column exists (not in current template structure)
  const productId = null; // No Product ID column in current template
  const productIdString = null;

  // Parse "Is New" - map to isRecommended
  const isNew = parseBoolean(getCellValue(columnOffsets.isNewOffset));
  
  // Parse "Origin" - map to tag field
  const origin = getCellValue(columnOffsets.originOffset)?.toString().trim() || "";

  // Get raw values for debugging
  const rawName = getCellValue(columnOffsets.nameOffset);
  const rawCategory = getCellValue(columnOffsets.categoryOffset);
  const rawPrice = getCellValue(columnOffsets.priceOffset);
  const rawStock = getCellValue(columnOffsets.stockOffset);

  // Parse values with better handling
  const name = rawName?.toString().trim() || null;
  const category = cleanCategory(rawCategory);
  const price = parseNumber(rawPrice);
  const stock = parseNumber(rawStock, 0);

  // Debug logging for first few rows
  if (rowNumber <= 5) {
    console.log(`🔍 Row ${rowNumber} raw values:`, {
      name: rawName,
      category: rawCategory,
      price: rawPrice,
      stock: rawStock,
      offsets: columnOffsets,
    });
    console.log(`🔍 Row ${rowNumber} parsed values:`, {
      name,
      category,
      price,
      stock,
    });
  }

  // Get image URL from Image column
  const rawImageUrl = getCellValue(columnOffsets.imageOffset);
  const imageUrl = rawImageUrl ? rawImageUrl.toString().trim() : "";

  // Debug logging for image column
  if (rowNumber <= 5) {
    console.log(`🖼️  Row ${rowNumber} Image column (offset ${columnOffsets.imageOffset}): "${imageUrl}"`);
  }

  return {
    productId: productIdString || null,
    name,
    category,
    brand: "", // Brand not in template, keep empty
    price,
    discountPercent: 0, // Discount not in template, default to 0
    stock,
    rating: parseNumber(getCellValue(columnOffsets.ratingOffset), 0),
    totalSold: parseNumber(getCellValue(columnOffsets.salesOffset), 0),
    alcoholPercentage: parseNumber(getCellValue(columnOffsets.alcoholOffset)),
    volume: getCellValue(columnOffsets.volumeOffset)?.toString().trim() || "",
    imageUrl: imageUrl, // Image URL from Image column
    tag: origin, // Origin maps to tag
    isRecommended: isNew, // Is New maps to isRecommended
    // Status, In Stock, Created Date are ignored (calculated/auto-generated)
  };
};

