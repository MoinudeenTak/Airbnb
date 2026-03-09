import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import healthRoutes from "./routes/health.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// connect database
connectDB();

// health route
app.use("/api", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});