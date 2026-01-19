import express from "express";
import { sendEmail, clearEmailRateLimit } from "../services/email.service.js";

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
        data: { 
          messageId: result.messageId,
          response: result.response,
          note: "Check your inbox and spam folder. Email may take a few moments to arrive.",
        },
      });
    } else {
      // Provide detailed error information
      const errorResponse = {
        success: false,
        message: `Failed to send email: ${result.error}`,
        error: result.error,
        rateLimited: result.rateLimited || false,
      };
      
      // Include troubleshooting steps if available
      if (result.troubleshooting) {
        errorResponse.troubleshooting = result.troubleshooting;
      }
      
      // Include error code if available
      if (result.errorCode) {
        errorResponse.errorCode = result.errorCode;
      }
      
      res.status(500).json(errorResponse);
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
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS ? "***" + process.env.EMAIL_PASS.slice(-4) : "❌ NOT SET";
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com (Gmail service)";
    const emailPort = process.env.EMAIL_PORT || "587 (default)";
    const nodeEnv = process.env.NODE_ENV || "development";
    const rateLimitDisabled = process.env.DISABLE_EMAIL_RATE_LIMIT === "true";

    // Check if credentials are set
    if (!emailUser || !process.env.EMAIL_PASS) {
      return res.status(400).json({
        success: false,
        error: "EMAIL_USER and EMAIL_PASS must be set in .env file",
        configuration: {
          emailUser: emailUser || "❌ NOT SET",
          emailPass: emailPass,
          emailHost,
          emailPort,
          nodeEnv,
          rateLimitDisabled,
        },
        instructions: {
          message: "Please set EMAIL_USER and EMAIL_PASS in your .env file",
          steps: [
            "1. Create or update your .env file",
            "2. Add: EMAIL_USER=your-email@gmail.com",
            "3. Add: EMAIL_PASS=your-app-password (16 characters with spaces)",
            "4. Get App Password: https://myaccount.google.com/apppasswords",
            "5. Restart your server",
          ],
        },
      });
    }

    // Try to verify connection using the same method as the service
    const nodemailer = await import("nodemailer");
    
    // Create transporter exactly like in the service
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASS.trim(),
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: nodeEnv === "development",
      logger: nodeEnv === "development",
      secure: false,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    let connectionStatus = "Unknown";
    let connectionError = null;
    try {
      await transporter.verify();
      connectionStatus = "✅ Connected successfully";
    } catch (error) {
      connectionStatus = `❌ Connection failed: ${error.message}`;
      connectionError = {
        code: error.code,
        message: error.message,
        command: error.command,
      };
    }

    res.status(200).json({
      success: true,
      configuration: {
        emailUser,
        emailPass: emailPass,
        emailHost,
        emailPort,
        nodeEnv,
        rateLimitDisabled,
        connectionStatus,
        connectionError,
      },
      instructions: {
        gmail: "For Gmail, you need to use an App Password (not your regular password).",
        steps: [
          "1. Go to: https://myaccount.google.com/security",
          "2. Enable 2-Step Verification (required for App Passwords)",
          "3. Go to: https://myaccount.google.com/apppasswords",
          "4. Select 'Mail' and device type",
          "5. Generate and copy the 16-character App Password (with spaces)",
          "6. Add to .env: EMAIL_PASS='your app password here'",
          "7. Restart your server",
        ],
        testing: [
          "1. Use POST /api/email/test with body: { \"to\": \"your-email@gmail.com\" }",
          "2. Check console logs for detailed error messages",
          "3. Check spam folder if email doesn't arrive",
          "4. In development, set DISABLE_EMAIL_RATE_LIMIT=true in .env to bypass rate limiting",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Clear rate limit endpoint (useful for testing)
router.post("/email/clear-rate-limit", async (req, res) => {
  try {
    const { email } = req.body;
    const result = clearEmailRateLimit(email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error clearing rate limit",
    });
  }
});

export default router;







