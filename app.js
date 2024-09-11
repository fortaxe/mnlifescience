import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import hospitalRoutes from "./routes/hospital.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://mr.mnlifescience.com', // Allow only your frontend's origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allow specific HTTP methods
    credentials: true // Enable credentials (if needed, such as for cookies)
  }));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", hospitalRoutes);

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
