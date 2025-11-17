import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import auditRoutes from "./routes/audit";
import contractRoutes from "./routes/contract";
import { errorHandler } from "./middleware/errorHandler";
import { connectDatabase } from "./config/database";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDatabase().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/audits", auditRoutes);
app.use("/api/contracts", contractRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 BlockSecure Chain API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
