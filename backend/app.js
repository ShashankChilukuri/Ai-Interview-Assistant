import morgan  from 'morgan';
import express from 'express'
import connectDB from "./connectDB.js";
import cors from 'cors'
import dotenv from 'dotenv';
import router from './router.js';
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Be explicit
  credentials: true, // This is very often the fix for auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(morgan("dev")); // Add morgan here for request logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api",router);
connectDB();

// Serve frontend static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Catch-all for frontend
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));

