import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userSubscriptionRoutes from "./routes/userSubscriptionRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB(); 

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(compression());

app.use(cors({
  origin: ['http://localhost:5173','https://luabeirut.shop', 'https://luabeirut.shop/api/products', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.use((req, res, next) => {
  // Cache control disabled - no caching implemented
  if (req.path.includes('/cart') || req.path.includes('/orders')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/user-subscriptions", userSubscriptionRoutes);
app.use("/api/listings", listingRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// app.use(express.static(path.join(__dirname, 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
const PORT = process.env.PORT || 5002;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  setTimeout(async () => {
    try {
      const { optimizeDatabase, warmUpCache } = await import('./utils/dbOptimization.js');
      await optimizeDatabase();
      await warmUpCache();
    } catch (error) {
    }
  }, 2000);
});