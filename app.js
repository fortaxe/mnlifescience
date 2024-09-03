import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
// import clinicRoutes from "./routes/clinic.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
// app.use("/api", clinicRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hello World from backend"})
})

// Database connection
mongoose
    .connect(process.env.MONGO_URL, {
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch((error) => console.log(` ${error} did not connect`));

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
