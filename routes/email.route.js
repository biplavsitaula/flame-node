import express from "express";
import { sendEmail } from "../services/email.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Test email endpoint
router.post("/email/test", authenticate, async (req, res) => {
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

export default router;





