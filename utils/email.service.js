/**
 * Email Service
 * Handles sending emails for password reset and other notifications
 * 
 * For production, configure SMTP settings in .env:
 * - EMAIL_HOST
 * - EMAIL_PORT
 * - EMAIL_USER
 * - EMAIL_PASS
 * - EMAIL_FROM
 */

// Simple email service using nodemailer (install: npm install nodemailer)
// For now, we'll use a console log approach. Replace with actual email service in production.

export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  try {
    // Check if nodemailer is available
    let nodemailer;
    try {
      nodemailer = await import("nodemailer");
    } catch (error) {
      // If nodemailer is not installed, log the reset link
      console.log("=".repeat(60));
      console.log("PASSWORD RESET EMAIL");
      console.log("=".repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset Request`);
      console.log(`\nHello ${userName || "User"},\n`);
      console.log(`You requested to reset your password. Click the link below to reset it:`);
      console.log(`\n${resetUrl}\n`);
      console.log(`This link will expire in 10 minutes.`);
      console.log(`If you didn't request this, please ignore this email.\n`);
      console.log("=".repeat(60));
      return;
    }

    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${process.env.STORE_NAME || "LiquorHub"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4CAF50;">${resetUrl}</p>
              <p><strong>This link will expire in 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "LiquorHub"}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${userName || "User"},
        
        You requested to reset your password. Click the link below to reset it:
        
        ${resetUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Log the reset link as fallback
    console.log("=".repeat(60));
    console.log("PASSWORD RESET EMAIL (FALLBACK)");
    console.log("=".repeat(60));
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=".repeat(60));
    throw error;
  }
};

