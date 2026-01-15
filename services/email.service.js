import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // Use environment variables if available, otherwise fall back to hardcoded (for development)
  const emailUser = process.env.EMAIL_USER || "hasinadhungel15@gmail.com";
  const emailPass = process.env.EMAIL_PASS || "igjb befr pjim wcpg";
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");

  // If EMAIL_HOST is set, use custom SMTP configuration
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // Otherwise use Gmail service
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass, // Use App Password, not regular password
    },
  });
};

// Rate limiting: track last email sent per recipient
const emailRateLimit = new Map();

/**
 * Check if email can be sent (rate limiting)
 */
const canSendEmail = (to, minIntervalMs = 60000) => { // 1 minute cooldown
  const lastSent = emailRateLimit.get(to);
  if (!lastSent) {
    return true;
  }
  const timeSinceLastSent = Date.now() - lastSent;
  return timeSinceLastSent >= minIntervalMs;
};

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Rate limiting check
    if (!canSendEmail(to)) {
      const lastSent = emailRateLimit.get(to);
      const waitTime = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
      console.warn(`⏳ Rate limit: Please wait ${waitTime} seconds before sending another email to ${to}`);
      return { 
        success: false, 
        error: `Please wait ${waitTime} seconds before requesting another email. This prevents spam.`,
        rateLimited: true 
      };
    }

    const transporter = createTransporter();

    // Verify connection
    console.log("🔍 Verifying email connection...");
    try {
      await transporter.verify();
      console.log("✅ Email server connection verified");
    } catch (verifyError) {
      console.error("❌ Email server verification failed:", verifyError.message);
      return {
        success: false,
        error: `Email server verification failed: ${verifyError.message}. Please check your email configuration.`,
      };
    }

    const emailUser = process.env.EMAIL_USER || "hasinadhungel15@gmail.com";
    const emailFrom = process.env.EMAIL_FROM || `"Flame Beverage" <${emailUser}>`;

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    console.log("📧 To:", to);
    console.log("📝 Subject:", subject);
    
    // Update rate limit
    emailRateLimit.set(to, Date.now());
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error("Full error:", error);
    
    // Check for specific Gmail errors
    if (error.code === 'EAUTH') {
      console.error("❌ Authentication failed. Check:");
      console.error("   - Email credentials in .env file");
      console.error("   - If using Gmail, ensure you're using an App Password (not regular password)");
      console.error("   - Enable 'Less secure app access' or use OAuth2");
      return { 
        success: false, 
        error: "Email authentication failed. Please check email credentials. For Gmail, use an App Password." 
      };
    }
    if (error.code === 'EENVELOPE') {
      return { 
        success: false, 
        error: "Invalid email address." 
      };
    }
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: "Connection to email server failed. Please check your internet connection and email server settings.",
      };
    }
    if (error.responseCode === 550 || error.responseCode === 553) {
      return { 
        success: false, 
        error: "Email rejected by server. Please check the recipient email address." 
      };
    }
    
    return { 
      success: false, 
      error: error.message || "Failed to send email",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.total.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔥 Flame Beverage</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p style="color: #666;">Thank you for your order! Here are your order details:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Bill Number:</strong> ${order.billNumber}</p>
          <p><strong>Customer:</strong> ${order.customer.fullName}</p>
          <p><strong>Phone:</strong> ${order.customer.mobile}</p>
          <p><strong>Delivery Address:</strong> ${order.customer.location}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px;">
          <thead>
            <tr style="background: #FF5050; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 10px; text-align: right;">Rs. ${(order.subtotal || order.totalAmount).toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Delivery Fee:</strong></td>
              <td style="padding: 10px; text-align: right;">Rs. ${(order.deliveryFee || 0).toLocaleString()}</td>
            </tr>
            <tr style="background: #f0f0f0;">
              <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total Amount:</strong></td>
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #FF5050;"><strong>Rs. ${order.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
          <p style="margin: 0; color: #856404;">
            <strong>📦 Delivery Status:</strong> ${order.status}
          </p>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Thank you for choosing Flame Beverage!</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Questions? Contact us at ${process.env.EMAIL_USER}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${order.billNumber}`,
    text: `Your order ${order.billNumber} has been placed successfully. Total: Rs. ${order.totalAmount}`,
    html,
  });
};

/**
 * Send low stock alert email to admin
 */
export const sendLowStockAlertEmail = async (product, adminEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc3545; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Stock Running Low!</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Current Stock:</strong> <span style="color: #dc3545; font-weight: bold;">${product.stock} units</span></p>
        </div>

        <p style="color: #666;">Please restock this product soon to avoid out-of-stock situations.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${product.name}`,
    text: `Low stock alert for ${product.name}. Current stock: ${product.stock} units.`,
    html,
  });
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (payment, customerEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #28a745; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">✅ Payment Confirmed</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Payment Received Successfully!</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Bill Number:</strong> ${payment.billNumber}</p>
          <p><strong>Amount:</strong> <span style="color: #28a745; font-size: 24px;">Rs. ${payment.amount.toLocaleString()}</span></p>
          <p><strong>Payment Method:</strong> ${payment.method}${payment.gateway ? ` (${payment.gateway})` : ""}</p>
          <p><strong>Status:</strong> ${payment.status}</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Payment Confirmed - ${payment.billNumber}`,
    text: `Payment of Rs. ${payment.amount} received for order ${payment.billNumber}.`,
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔥 Flame Beverage</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Password Reset Request</h2>
        
        <p style="color: #666; font-size: 16px;">
          Hello ${userName || "User"},
        </p>
        
        <p style="color: #666; font-size: 16px;">
          You requested to reset your password. Click the button below to reset it:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #999; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${resetUrl}" style="color: #FF5050;">${resetUrl}</a>
        </p>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            ⚠️ This link will expire in <strong>10 minutes</strong>.
          </p>
          <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          This is an automated email from Flame Beverage. Please do not reply.
        </p>
      </div>
    </div>
  `;

  console.log("📧 Sending password reset email to:", email);
  console.log("🔗 Reset URL:", resetUrl);
  console.log("👤 User Name:", userName || "User");

  const result = await sendEmail({
    to: email,
    subject: "🔐 Password Reset - Flame Beverage",
    text: `You requested to reset your password. Click this link to reset: ${resetUrl}. This link expires in 10 minutes.`,
    html,
  });

  if (result.success) {
    console.log("✅ Password reset email sent successfully!");
    console.log("   Message ID:", result.messageId);
  } else {
    console.error("❌ Failed to send password reset email");
    console.error("   Error:", result.error);
    if (result.rateLimited) {
      console.warn("   ⚠️  Rate limited - please wait before requesting again");
    }
  }

  return result;
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmationEmail = async (email, userName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #28a745; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">✅ Password Changed</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Password Reset Successful!</h2>
        
        <p style="color: #666; font-size: 16px;">
          Hello ${userName || "User"},
        </p>
        
        <p style="color: #666; font-size: 16px;">
          Your password has been successfully changed.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #333;">
            <strong>Changed at:</strong> ${new Date().toLocaleString()}
          </p>
        </div>

        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #721c24; font-size: 14px;">
            ⚠️ If you didn't make this change, please contact us immediately or reset your password again.
          </p>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Stay secure! 🔒</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">The Flame Beverage Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "✅ Password Changed Successfully - Flame Beverage",
    text: `Your password has been successfully changed. If you didn't make this change, please contact us immediately.`,
    html,
  });
};

/**
 * Send welcome email for new user registration
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🔥 Welcome to Flame Beverage!</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hello ${user.fullName}! 👋</h2>
        
        <p style="color: #666; font-size: 16px;">
          Thank you for registering with Flame Beverage. Your account has been created successfully.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.mobile || "Not provided"}</p>
        </div>

        <p style="color: #666;">
          Start exploring our premium collection of beverages and enjoy exclusive offers!
        </p>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Cheers! 🥂</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">The Flame Beverage Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: "Welcome to Flame Beverage! 🔥",
    text: `Welcome to Flame Beverage, ${user.fullName}! Your account has been created successfully.`,
    html,
  });
};

export default {
  sendEmail,
  sendOrderConfirmationEmail,
  sendLowStockAlertEmail,
  sendPaymentConfirmationEmail,
  sendWelcomeEmail,
};

