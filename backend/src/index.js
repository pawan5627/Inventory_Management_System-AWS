const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const roleRoutes = require("./routes/roleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// ---------- CORS Setup ----------
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Handle CORS preflight for all routes
app.options("*", cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// ---------- Middleware ----------
app.use(express.json());
app.use(morgan("dev"));

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/profile", profileRoutes);

// ---------- Health Endpoints ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Optional: root path health for ALB
app.get("/", (req, res) => {
  res.status(200).send("Backend running");
});

// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = process.env.PORT || 4000;
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
