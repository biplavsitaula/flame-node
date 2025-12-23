import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

export const fetchAllProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({ message: "Success", data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Success", data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNewProduct = async (req, res) => {
  try {
    const newProduct = await createProduct(req.body);
    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExistingProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await updateProduct(id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product updated", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await deleteProduct(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
