import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // Require environment variables - no hardcoded fallbacks for security
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  const emailHost = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");

  // Validate required credentials
  if (!emailUser || !emailPass) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set in .env file. " +
      "For Gmail, use an App Password (not your regular password). " +
      "Get one at: https://myaccount.google.com/apppasswords"
    );
  }

  console.log("📧 Email Configuration:");
  console.log("   User:", emailUser);
  console.log("   Host:", emailHost);
  console.log("   Port:", emailPort);
  console.log("   Password:", emailPass ? "***" + emailPass.slice(-4) : "❌ NOT SET");
  console.log("   Password length:", emailPass ? emailPass.length : 0, "characters");

  // If EMAIL_HOST is set and it's Gmail, use Gmail service (more reliable)
  // Otherwise use custom SMTP configuration
  if (process.env.EMAIL_HOST && emailHost.toLowerCase().includes("gmail")) {
    console.log("   Using Gmail service (recommended for Gmail accounts)");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password, not regular password
      },
      // Add timeout and connection options
      connectionTimeout: 30000, // 30 seconds (increased for better reliability)
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // Debug mode for troubleshooting
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
      // Additional options for better Gmail compatibility
      secure: false, // Use TLS
      requireTLS: true,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in development
      },
    });
  }

  // If EMAIL_HOST is set for non-Gmail, use custom SMTP configuration
  if (process.env.EMAIL_HOST) {
    console.log("   Using custom SMTP configuration");
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Add timeout and connection options
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // Debug mode for troubleshooting
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
      // TLS options
      requireTLS: emailPort === 587,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in development
      },
    });
  }

  // Otherwise use Gmail service (default)
  console.log("   Using Gmail service (default)");
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass, // Use App Password, not regular password
    },
    // Add timeout and connection options
    connectionTimeout: 30000, // 30 seconds (increased for better reliability)
    greetingTimeout: 30000,
    socketTimeout: 30000,
    // Debug mode for troubleshooting
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
    // Additional options for better Gmail compatibility
    secure: false, // Use TLS
    requireTLS: true,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates in development
    },
  });
};

// Rate limiting: track last email sent per recipient
const emailRateLimit = new Map();

/**
 * Check if email can be sent (rate limiting)
 * In development, reduce rate limiting to 5 seconds for easier testing
 */
const canSendEmail = (to, minIntervalMs = process.env.NODE_ENV === "development" ? 5000 : 60000) => {
  // Skip rate limiting in development for easier testing
  if (process.env.NODE_ENV === "development" && process.env.DISABLE_EMAIL_RATE_LIMIT === "true") {
    return true;
  }
  
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
    console.log("\n" + "=".repeat(80));
    console.log("📧 EMAIL SEND REQUEST");
    console.log("=".repeat(80));
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Environment:", process.env.NODE_ENV || "development");
    
    // Rate limiting check
    if (!canSendEmail(to)) {
      const lastSent = emailRateLimit.get(to);
      const minInterval = process.env.NODE_ENV === "development" ? 5000 : 60000;
      const waitTime = Math.ceil((minInterval - (Date.now() - lastSent)) / 1000);
      console.warn(`⏳ Rate limit: Please wait ${waitTime} seconds before sending another email to ${to}`);
      console.log("=".repeat(80) + "\n");
      return { 
        success: false, 
        error: `Please wait ${waitTime} seconds before requesting another email. This prevents spam.`,
        rateLimited: true 
      };
    }

    let transporter;
    try {
      transporter = createTransporter();
    } catch (configError) {
      console.error("❌ Email configuration error!");
      console.error("Error:", configError.message);
      console.log("=".repeat(80) + "\n");
      return {
        success: false,
        error: configError.message,
        troubleshooting: [
          "1. Check your .env file has EMAIL_USER and EMAIL_PASS set",
          "2. For Gmail, use an App Password: https://myaccount.google.com/apppasswords",
          "3. Make sure 2-Step Verification is enabled",
          "4. Restart your server after updating .env",
        ],
      };
    }

    // Verify connection with detailed error reporting
    console.log("🔍 Verifying email connection...");
    try {
      await transporter.verify();
      console.log("✅ Email server connection verified successfully!");
    } catch (verifyError) {
      console.error("❌ Email server verification failed!");
      console.error("Error code:", verifyError.code);
      console.error("Error message:", verifyError.message);
      console.error("Full error:", verifyError);
      
      // Provide specific guidance based on error
      let errorMessage = `Email server verification failed: ${verifyError.message}`;
      let troubleshooting = [];
      
      if (verifyError.code === 'EAUTH') {
        errorMessage = "Authentication failed. Please check your email credentials.";
        troubleshooting = [
          "1. Verify EMAIL_USER and EMAIL_PASS in your .env file",
          "2. For Gmail, you MUST use an App Password (not your regular password)",
          "3. Make sure 2-Step Verification is enabled on your Google Account",
          "4. Generate a new App Password: https://myaccount.google.com/apppasswords",
          "5. Use the 16-character App Password (with spaces) in EMAIL_PASS",
        ];
      } else if (verifyError.code === 'ECONNECTION' || verifyError.code === 'ETIMEDOUT') {
        errorMessage = "Connection to email server failed.";
        troubleshooting = [
          "1. Check your internet connection",
          "2. Verify EMAIL_HOST and EMAIL_PORT in .env (if using custom SMTP)",
          "3. Check if your firewall is blocking the connection",
        ];
      }
      
      console.error("\n🔧 Troubleshooting Steps:");
      troubleshooting.forEach(step => console.error("   " + step));
      console.log("=".repeat(80) + "\n");
      
      return {
        success: false,
        error: errorMessage,
        troubleshooting: troubleshooting.length > 0 ? troubleshooting : undefined,
      };
    }

    const emailUser = process.env.EMAIL_USER?.trim();
    if (!emailUser) {
      throw new Error("EMAIL_USER is not set in .env file");
    }
    // Handle EMAIL_FROM - remove surrounding quotes if present, or use default format
    let emailFrom = process.env.EMAIL_FROM;
    if (emailFrom) {
      // Remove surrounding quotes if present (handles "Your Store Name <email@example.com>")
      emailFrom = emailFrom.trim().replace(/^["']|["']$/g, '');
    } else {
      emailFrom = `"Flame Beverage" <${emailUser}>`;
    }

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      text,
      html,
    };

    console.log("📤 Sending email...");
    console.log("   From:", emailFrom);
    console.log("   To:", to);
    console.log("   Subject:", subject);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    console.log("   Accepted:", info.accepted);
    console.log("   Rejected:", info.rejected);
    console.log("   📬 Email should arrive shortly. Check inbox and spam folder.");
    console.log("=".repeat(80) + "\n");
    
    // Update rate limit
    emailRateLimit.set(to, Date.now());
    
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ EMAIL SEND ERROR");
    console.error("=".repeat(80));
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error("Error responseCode:", error.responseCode);
    if (process.env.NODE_ENV === "development") {
      console.error("Full error stack:", error.stack);
    }
    console.error("=".repeat(80));
    
    // Check for specific Gmail errors and provide detailed guidance
    if (error.code === 'EAUTH') {
      console.error("\n🔧 GMAIL AUTHENTICATION ERROR - Troubleshooting:");
      console.error("   1. Verify EMAIL_USER and EMAIL_PASS in your .env file");
      console.error("   2. For Gmail, you MUST use an App Password (NOT your regular password)");
      console.error("   3. Steps to create Gmail App Password:");
      console.error("      a. Go to: https://myaccount.google.com/security");
      console.error("      b. Enable 2-Step Verification (required)");
      console.error("      c. Go to: https://myaccount.google.com/apppasswords");
      console.error("      d. Select 'Mail' and 'Other (Custom name)'");
      console.error("      e. Enter 'Flame Beverage API' as the name");
      console.error("      f. Copy the 16-character password (with spaces)");
      console.error("      g. Use it in EMAIL_PASS in your .env file");
      console.error("   4. Make sure there are no extra spaces in EMAIL_PASS");
      console.error("   5. Restart your server after updating .env");
      console.error("=".repeat(80) + "\n");
      return { 
        success: false, 
        error: "Email authentication failed. Please check email credentials. For Gmail, use an App Password (not regular password).",
        troubleshooting: [
          "Verify EMAIL_USER and EMAIL_PASS in .env",
          "For Gmail, use App Password: https://myaccount.google.com/apppasswords",
          "Enable 2-Step Verification first",
          "Restart server after updating .env",
        ],
      };
    }
    if (error.code === 'EENVELOPE') {
      console.error("\n🔧 Invalid email address provided");
      console.error("=".repeat(80) + "\n");
      return { 
        success: false, 
        error: `Invalid email address: ${to}`,
      };
    }
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error("\n🔧 Connection error - Troubleshooting:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify EMAIL_HOST and EMAIL_PORT (if using custom SMTP)");
      console.error("   3. Check firewall settings");
      console.error("   4. Try again in a few moments");
      console.error("=".repeat(80) + "\n");
      return {
        success: false,
        error: "Connection to email server failed. Please check your internet connection and email server settings.",
      };
    }
    if (error.responseCode === 550 || error.responseCode === 553) {
      console.error("\n🔧 Email rejected by server");
      console.error("=".repeat(80) + "\n");
      return { 
        success: false, 
        error: `Email rejected by server. Please check the recipient email address: ${to}`,
      };
    }
    
    console.error("=".repeat(80) + "\n");
    return { 
      success: false, 
      error: error.message || "Failed to send email",
      errorCode: error.code,
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
  // Always log the reset link to console (for development/debugging)
  console.log("\n" + "=".repeat(80));
  console.log("🔐 PASSWORD RESET LINK");
  console.log("=".repeat(80));
  console.log(`To: ${email}`);
  console.log(`User: ${userName || "User"}`);
  console.log(`\nReset URL: ${resetUrl}`);
  console.log(`\n⚠️  This link will expire in 10 minutes.`);
  console.log("=".repeat(80) + "\n");

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
          <a href="${resetUrl}" style="color: #FF5050; word-break: break-all;">${resetUrl}</a>
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

  console.log("📧 Attempting to send password reset email to:", email);

  try {
    const result = await sendEmail({
      to: email,
      subject: "🔐 Password Reset - Flame Beverage",
      text: `You requested to reset your password. Click this link to reset: ${resetUrl}. This link expires in 10 minutes.`,
      html,
    });

    if (result.success) {
      console.log("✅ Password reset email sent successfully!");
      console.log("   Message ID:", result.messageId);
      console.log("   📬 Check your inbox (and spam folder) at:", email);
    } else {
      console.error("❌ Failed to send password reset email");
      console.error("   Error:", result.error);
      if (result.rateLimited) {
        console.warn("   ⚠️  Rate limited - please wait before requesting again");
      }
      console.warn("   ⚠️  However, the reset link is logged above. You can still use it to reset your password.");
    }

    return result;
  } catch (error) {
    console.error("❌ Exception while sending password reset email:", error.message);
    console.error("   Full error:", error);
    console.warn("   ⚠️  The reset link is logged above. You can still use it to reset your password.");
    
    return {
      success: false,
      error: error.message || "Failed to send email",
      resetLinkAvailable: true, // Indicate that reset link is in console
    };
  }
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

/**
 * Send order acceptance email to customer
 */
export const sendOrderAcceptanceEmail = async (order, customerEmail) => {
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
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">✅ Order Accepted</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Great News! Your Order Has Been Accepted</h2>
        <p style="color: #666;">Your order is now being processed and will be prepared for delivery.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p><strong>Bill Number:</strong> ${order.billNumber}</p>
          <p><strong>Customer:</strong> ${order.customer.fullName}</p>
          <p><strong>Phone:</strong> ${order.customer.mobile}</p>
          <p><strong>Delivery Address:</strong> ${order.customer.location}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Accepted</span></p>
          ${order.acceptedAt ? `<p><strong>Accepted At:</strong> ${new Date(order.acceptedAt).toLocaleString()}</p>` : ""}
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px;">
          <thead>
            <tr style="background: #28a745; color: white;">
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
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #28a745;"><strong>Rs. ${order.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724;">
            <strong>📦 Order Status:</strong> Your order has been accepted and is being prepared for delivery.
          </p>
          <p style="margin: 10px 0 0 0; color: #155724;">
            We will notify you once your order is ready for delivery.
          </p>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Thank you for choosing Flame Beverage!</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Questions? Contact us at ${process.env.EMAIL_USER || "support@flamebeverage.com"}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Order Accepted - ${order.billNumber}`,
    text: `Your order ${order.billNumber} has been accepted and is being processed. Total: Rs. ${order.totalAmount.toLocaleString()}`,
    html,
  });
};

/**
 * Send order rejection email to customer
 */
export const sendOrderRejectionEmail = async (order, customerEmail) => {
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

  const rejectionReason = order.rejectionReason || "Order rejected by admin";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">❌ Order Rejected</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p style="color: #666;">We regret to inform you that your order has been rejected.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p><strong>Bill Number:</strong> ${order.billNumber}</p>
          <p><strong>Customer:</strong> ${order.customer.fullName}</p>
          <p><strong>Phone:</strong> ${order.customer.mobile}</p>
          <p><strong>Delivery Address:</strong> ${order.customer.location}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Rejected</span></p>
          ${order.rejectedAt ? `<p><strong>Rejected At:</strong> ${new Date(order.rejectedAt).toLocaleString()}</p>` : ""}
        </div>

        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0; color: #721c24;">
            <strong>Rejection Reason:</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #721c24;">
            ${rejectionReason}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px;">
          <thead>
            <tr style="background: #dc3545; color: white;">
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
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #dc3545;"><strong>Rs. ${order.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
          <p style="margin: 0; color: #856404;">
            <strong>💳 Payment Information:</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #856404;">
            ${order.paymentMethod === "Online" 
              ? "If you have already made a payment, a refund will be processed within 5-7 business days." 
              : "No payment was required for this order."}
          </p>
        </div>

        <div style="margin-top: 20px; padding: 20px; background: #d1ecf1; border-radius: 8px;">
          <p style="margin: 0; color: #0c5460;">
            <strong>Need Help?</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #0c5460;">
            If you have any questions or concerns about this rejection, please contact our support team.
          </p>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">We apologize for any inconvenience.</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Contact us at ${process.env.EMAIL_USER || "support@flamebeverage.com"}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Order Rejected - ${order.billNumber}`,
    text: `Your order ${order.billNumber} has been rejected. Reason: ${rejectionReason}`,
    html,
  });
};

/**
 * Clear rate limit for a specific email (useful for testing)
 */
export const clearEmailRateLimit = (email) => {
  if (email) {
    emailRateLimit.delete(email);
    console.log(`✅ Rate limit cleared for: ${email}`);
    return { success: true, message: `Rate limit cleared for ${email}` };
  } else {
    emailRateLimit.clear();
    console.log("✅ All rate limits cleared");
    return { success: true, message: "All rate limits cleared" };
  }
};

/**
 * Send referral invitation email
 */
export const sendReferralInvitationEmail = async (friendEmail, friendName, referrerName, referralCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎁 You've been invited!</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hello ${friendName},</h2>
        
        <p style="color: #666; font-size: 16px;">
          Your friend <strong>${referrerName}</strong> has invited you to join Flame Beverage!
        </p>
        
        <p style="color: #666; font-size: 16px;">
          Sign up using their referral code and get an exclusive reward on your first order.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #333; font-size: 14px; text-transform: uppercase;">Referral Code</p>
          <p style="margin: 10px 0 0 0; color: #FF5050; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${referralCode}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/signup?ref=${referralCode}" style="background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Join Now
          </a>
        </div>
      </div>

      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Cheers! 🥂</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">The Flame Beverage Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: friendEmail,
    subject: `🎁 ${referrerName} invited you to join Flame Beverage!`,
    text: `Your friend ${referrerName} has invited you to join Flame Beverage. Use referral code: ${referralCode}`,
    html,
  });
};


export default {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderAcceptanceEmail,
  sendOrderRejectionEmail,
  sendLowStockAlertEmail,
  sendPaymentConfirmationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendReferralInvitationEmail,
  clearEmailRateLimit,
};

