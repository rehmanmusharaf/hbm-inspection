const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const carRoutes = require("./routes/car.routes");
const inspectionRoutes = require("./routes/inspection.routes");
const bookingRoutes = require("./routes/booking.routes");
const uploadRoutes = require("./routes/upload.routes");
const brandRoutes = require("./routes/brand.routes");
const carModelRoutes = require("./routes/carModel.routes");
const carPartRoutes = require("./routes/carPart.routes");
const carPartTemplateRoutes = require("./routes/carPartTemplate.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const inspectorRoutes = require("./routes/inspector.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*" || process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", limiter);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/models", carModelRoutes);
app.use("/api/car-parts", carPartRoutes);
app.use("/api/car-part-templates", carPartTemplateRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inspectors", inspectorRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
