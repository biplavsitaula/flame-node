import { generateMonthlyReport, formatDataForExcel } from "../services/export.service.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const exportMonthlyData = async (req, res) => {
  try {
    const { year, month, type } = req.query;

    if (!year || !month || !type) {
      return res.status(400).json({
        success: false,
        message: "Year, month, and type (excel|pdf) are required",
      });
    }

    const reportData = await generateMonthlyReport(
      parseInt(year),
      parseInt(month)
    );
    const formattedData = formatDataForExcel(reportData);

    if (type === "excel") {
      // Generate Excel file
      const workbook = new ExcelJS.Workbook();

      // Summary sheet
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRows(formattedData.summary);

      // Orders sheet
      const ordersSheet = workbook.addWorksheet("Orders");
      ordersSheet.addRows(formattedData.orders);

      // Payments sheet
      const paymentsSheet = workbook.addWorksheet("Payments");
      paymentsSheet.addRows(formattedData.payments);

      // Product Sales sheet
      const productSalesSheet = workbook.addWorksheet("Product Sales");
      productSalesSheet.addRows(formattedData.productSales);

      // Stock Levels sheet
      const stockSheet = workbook.addWorksheet("Stock Levels");
      stockSheet.addRows(formattedData.stockLevels);

      // Set headers style
      [summarySheet, ordersSheet, paymentsSheet, productSalesSheet, stockSheet].forEach(
        (sheet) => {
          if (sheet.getRow(1)) {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFE0E0E0" },
            };
          }
        }
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=monthly-report-${year}-${month}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (type === "pdf") {
      // Generate PDF file
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=monthly-report-${year}-${month}.pdf`
      );

      doc.pipe(res);

      // Title
      doc.fontSize(20).text("Monthly Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${month}/${year}`, { align: "center" });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).text("Summary", { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      formattedData.summary.slice(1).forEach((row) => {
        doc.text(`${row[0]}: ${row[1]}`);
      });
      doc.moveDown();

      // Orders
      doc.fontSize(16).text("Orders", { underline: true });
      doc.moveDown();
      doc.fontSize(8);
      formattedData.orders.slice(0, 10).forEach((row) => {
        doc.text(row.join(" | "));
      });
      doc.moveDown();

      // Payments
      doc.fontSize(16).text("Payments", { underline: true });
      doc.moveDown();
      doc.fontSize(8);
      formattedData.payments.slice(0, 10).forEach((row) => {
        doc.text(row.join(" | "));
      });

      doc.end();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'excel' or 'pdf'",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error exporting data",
    });
  }
};









