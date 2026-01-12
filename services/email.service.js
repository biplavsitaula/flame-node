import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password, not regular password
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flame Beverage" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
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

