import express from "express";
import { sendEmail } from "../services/email.service.js";

const router = express.Router();

// Test email endpoint (public for testing)
router.post("/email/test", async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Email address (to) is required",
      });
    }

    const result = await sendEmail({
      to,
      subject: "🔥 Flame Beverage - Test Email",
      text: "This is a test email from Flame Beverage API.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔥 Flame Beverage</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Test Email Successful! ✅</h2>
            <p style="color: #666;">
              If you're reading this, your email configuration is working correctly.
            </p>
            <p style="color: #666;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        data: { messageId: result.messageId },
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send email: ${result.error}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error sending test email",
    });
  }
});

// Email configuration diagnostic endpoint
router.get("/email/diagnostic", async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER || "hasinadhungel15@gmail.com";
    const emailPass = process.env.EMAIL_PASS ? "***" + process.env.EMAIL_PASS.slice(-4) : "Not set";
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com (Gmail service)";
    const emailPort = process.env.EMAIL_PORT || "587 (default)";

    // Try to verify connection
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "hasinadhungel15@gmail.com",
        pass: process.env.EMAIL_PASS || "igjb befr pjim wcpg",
      },
    });

    let connectionStatus = "Unknown";
    try {
      await transporter.verify();
      connectionStatus = "✅ Connected successfully";
    } catch (error) {
      connectionStatus = `❌ Connection failed: ${error.message}`;
    }

    res.status(200).json({
      success: true,
      configuration: {
        emailUser,
        emailPass: emailPass,
        emailHost,
        emailPort,
        connectionStatus,
      },
      instructions: {
        gmail: "For Gmail, you need to use an App Password (not your regular password).",
        steps: [
          "1. Go to your Google Account settings",
          "2. Enable 2-Step Verification",
          "3. Go to App Passwords",
          "4. Generate a new App Password for 'Mail'",
          "5. Use that 16-character password (with spaces) in EMAIL_PASS",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;







