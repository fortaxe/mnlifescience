import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import hospitalRoutes from "./routes/hospital.js";
import scheduleCall from "./routes/scheduleCall.js";
import { uploadDocuments } from "./middleware/uploadDocuments.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://mnlife.vercel.app',
  'https://mr.mnlifescience.com',
  'https://mnlife-ten.vercel.app',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Block or allow Chrome extension requests
    if (origin.startsWith("chrome-extension://")) {
      return callback(null, false); // Block Chrome extension requests explicitly
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// app.use(cors({
//   origin: (origin, callback) => {
//     console.log("Request origin:", origin);
//     if (allowedOrigins.includes(origin) || !origin) { // Allow requests with no origin (like Postman)
//       callback(null, true);
//     } else {
//       console.log("Blocked by CORS:", origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   credentials: true
// }));

// Middleware to parse JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", hospitalRoutes);
app.use("/api", scheduleCall);

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
