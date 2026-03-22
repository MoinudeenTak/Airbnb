import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/features/auth/authRoutes.js";
import listingRoutes from "./src/features/listing/listingRoutes.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";

const app = express();

connectDB();

// Security headers
app.use(helmet());

// Body parser
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API is working" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




