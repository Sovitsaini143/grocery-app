import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";

import userRoutes from './routes/user.route.js'
import sellerRoutes from './routes/seller.route.js'
import productRoutes from './routes/product.route.js'
import cartRoutes from './routes/cart.route.js'
import orderRoutes from './routes/order.route.js'
import addressRoutes from './routes/address.route.js'
import { connectCloudinary } from "./config/cloudinary.js";


dotenv.config();
connectDB()
connectCloudinary()
const PORT = process.env.PORT || 7000

const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}
))


app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/address", addressRoutes);



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})