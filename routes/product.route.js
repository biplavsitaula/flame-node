import express from "express";
import Product from "../models/product.models.js";

const routes = express.Router();

routes.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: "Success", data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default routes;
