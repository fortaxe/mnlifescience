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
const allowedOrigins = [
  'https://mnlife.vercel.app',
  'https://mr.mnlifescience.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) { // Allow requests with no origin (like Postman)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
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
