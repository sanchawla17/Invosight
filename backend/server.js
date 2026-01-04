import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import toolsRoutes from "./routes/toolsRoutes.js";

const app = express();

app.set("trust proxy", 1);

const defaultOrigins = ["http://localhost:5173", "http://localhost:4173"];
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

// Middleware to handle CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect Database
connectDB();

// Middleware
app.use(express.json({ limit: "6mb" }));
app.use(cookieParser());

// Routes Here
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/tools", toolsRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
