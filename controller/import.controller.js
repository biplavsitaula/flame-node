import { generateProductTemplate, importProductsFromFile } from "../services/import.service.js";
import ExcelJS from "exceljs";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel files (.xlsx, .xls) are allowed."), false);
    }
  },
});

/**
 * GET /import/template
 * Download sample Excel template for product import
 */
export const downloadProductTemplate = asyncHandler(async (req, res) => {
  try {
    const templateData = generateProductTemplate();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    // Add headers
    worksheet.addRow(templateData.headers);

    // Add sample data rows
    templateData.sampleRows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Set column widths
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 30; // Name
      else if (index === 1) column.width = 15; // Category
      else if (index === 2) column.width = 15; // Brand
      else if (index === 3) column.width = 12; // Price
      else if (index === 4) column.width = 12; // Discount %
      else if (index === 5) column.width = 12; // Stock
      else if (index === 6) column.width = 12; // Alcohol %
      else if (index === 7) column.width = 12; // Volume
      else if (index === 8) column.width = 40; // Image URL
      else if (index === 9) column.width = 15; // Tag
      else if (index === 10) column.width = 15; // Is Recommended
      else column.width = 20;
    });

    // Add data validation for category
    worksheet.getColumn(2).eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header row
        worksheet.dataValidations.add(cell.address, {
          type: "list",
          allowBlank: false,
          formulae: [
            '"whiskey,vodka,rum,gin,tequila,cognac,champagne,wine,beer,brandy"',
          ],
        });
      }
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.addRow(["Product Import Template - Instructions"]);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow([
      "1. Fill in the product details in the 'Products' sheet",
    ]);
    instructionsSheet.addRow([
      "2. Required fields: Name, Category, Price, Stock",
    ]);
    instructionsSheet.addRow([
      "3. Optional fields: Brand, Discount Percent, Alcohol Percentage, Volume, Image URL, Tag, Is Recommended",
    ]);
    instructionsSheet.addRow([
      "4. Category must be one of: whiskey, vodka, rum, gin, tequila, cognac, champagne, wine, beer, brandy",
    ]);
    instructionsSheet.addRow([
      "5. Price and Stock must be positive numbers",
    ]);
    instructionsSheet.addRow([
      "6. Discount Percent must be between 0 and 100",
    ]);
    instructionsSheet.addRow([
      "7. Alcohol Percentage must be between 0 and 100",
    ]);
    instructionsSheet.addRow([
      "8. Is Recommended: Use 'true' or 'false' (case-insensitive)",
    ]);
    instructionsSheet.addRow([
      "9. If a product with the same name exists, it will be updated",
    ]);
    instructionsSheet.addRow([
      "10. Leave Image URL empty if you don't have an image",
    ]);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product-import-template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error generating template",
    });
  }
});

/**
 * POST /import/products
 * Import products from uploaded Excel file
 */
export const importProductsFromExcel = [
  upload.single("file"),
  asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Excel file is required. Please upload a file with the field name 'file'.",
        });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      // Log available worksheet names for debugging
      const worksheetNames = workbook.worksheets.map((ws) => ws.name);
      console.log("📋 Available worksheets:", worksheetNames);

      const worksheet = workbook.getWorksheet("Products");
      if (!worksheet) {
        return res.status(400).json({
          success: false,
          message: `Worksheet named 'Products' not found in the Excel file. Available worksheets: ${worksheetNames.join(", ")}. Please ensure the worksheet is named 'Products'.`,
        });
      }

      // Check if worksheet has data
      const rowCount = worksheet.rowCount;
      console.log(`📊 Worksheet 'Products' has ${rowCount} rows`);
      
      if (rowCount < 2) {
        return res.status(400).json({
          success: false,
          message: "Excel file is empty. Please add product data to the 'Products' worksheet.",
        });
      }

      // Log first few rows for debugging
      console.log("📝 First 3 rows preview:");
      for (let i = 1; i <= Math.min(3, rowCount); i++) {
        const row = worksheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          values.push(`Col${colNumber}: ${cell.value}`);
        });
        console.log(`  Row ${i}:`, values.join(", "));
      }

      const result = await importProductsFromFile(worksheet);

      res.status(200).json({
        success: true,
        message: `Import completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
        data: {
          created: result.created,
          updated: result.updated,
          total: result.created + result.updated,
          errors: result.errors,
        },
      });
    } catch (error) {
      // Handle multer errors
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum file size is 10MB.",
        });
      }
      if (error.message && error.message.includes("Invalid file type")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Error importing products",
      });
    }
  }),
];

