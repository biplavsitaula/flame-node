import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import stockAlertsRoutes from "./routes/stockAlerts.route.js";
import topSellersRoutes from "./routes/topSellers.route.js";
import reviewRoutes from "./routes/review.route.js";
import notificationRoutes from "./routes/notification.route.js";
import exportRoutes from "./routes/export.route.js";
import importRoutes from "./routes/import.route.js";
import settingsRoutes from "./routes/settings.route.js";
import seasonalThemeRoutes from "./routes/seasonalTheme.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import emailRoutes from "./routes/email.route.js";
import offerRoutes from "./routes/offer.route.js";
import featureImageRoutes from "./routes/featureImage.route.js";
import customerDashboardRoutes from "./routes/customerDashboard.route.js";
import referralRoutes from "./routes/referral.route.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "*",
  })
);
// Increase body size limit to 50MB to allow large image uploads (base64 encoded images can be large)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/api/check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Password Reset Page (HTML form)
app.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password - Flame Beverage</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 420px;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo h1 {
          font-size: 28px;
          background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo p { color: #666; margin-top: 5px; }
        h2 {
          color: #333;
          margin-bottom: 10px;
          font-size: 24px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 25px;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        input:focus {
          outline: none;
          border-color: #FF5050;
          box-shadow: 0 0 0 3px rgba(255, 80, 80, 0.1);
        }
        button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #FF5050 0%, #FF8C00 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 80, 80, 0.3);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: none;
        }
        .message.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }
        .message.success {
          background: #dcfce7;
          color: #16a34a;
          border: 1px solid #86efac;
        }
        .password-requirements {
          font-size: 12px;
          color: #888;
          margin-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>🔥 Flame Beverage</h1>
          <p>Premium Spirits & More</p>
        </div>
        
        <h2>Reset Your Password</h2>
        <p class="subtitle">Enter your new password below</p>
        
        <div id="message" class="message"></div>
        
        <form id="resetForm">
          <div class="form-group">
            <label for="password">New Password</label>
            <input type="password" id="password" name="password" placeholder="Enter new password" required minlength="6">
            <p class="password-requirements">Must be at least 6 characters</p>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm new password" required>
          </div>
          
          <button type="submit" id="submitBtn">Reset Password</button>
        </form>
      </div>

      <script>
        const form = document.getElementById('resetForm');
        const messageDiv = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');
        const token = '${token}';

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          
          // Validate passwords match
          if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
          }
          
          // Validate password length
          if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
          }
          
          submitBtn.disabled = true;
          submitBtn.textContent = 'Resetting...';
          
          try {
            const response = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resetToken: token, newPassword: password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showMessage('Password reset successful! You can now login with your new password.', 'success');
              form.style.display = 'none';
              
              // Redirect to login page after 3 seconds (if frontend exists)
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } else {
              showMessage(data.message || 'Failed to reset password', 'error');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Reset Password';
            }
          } catch (error) {
            showMessage('Network error. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reset Password';
          }
        });
        
        function showMessage(text, type) {
          messageDiv.textContent = text;
          messageDiv.className = 'message ' + type;
          messageDiv.style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", stockAlertsRoutes);
app.use("/api", topSellersRoutes);
app.use("/api", reviewRoutes);
app.use("/api", notificationRoutes);
app.use("/api", exportRoutes);
app.use("/api", importRoutes);
app.use("/api", settingsRoutes);
app.use("/api", seasonalThemeRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", emailRoutes);
app.use("/api", offerRoutes);
app.use("/api", featureImageRoutes);
app.use("/api", customerDashboardRoutes);
app.use("/api", referralRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must have 4 parameters for Express to recognize it as error handler)
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

