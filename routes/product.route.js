import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
} from "../controller/product.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const routes = express.Router();

routes.get("/products", fetchAllProducts);
routes.get("/products/:id", fetchProductById);

routes.post("/products", checkAdmin, createNewProduct);
routes.put("/products/:id", checkAdmin, updateExistingProduct);
routes.delete("/products/:id", checkAdmin, deleteProductById);

export default routes;
