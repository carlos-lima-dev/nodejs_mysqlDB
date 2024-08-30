const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getProducts);
router.post("/register", productController.registerProduct);
router.get("/remove/:codigo&:imagem", productController.removeProduct);
router.get("/updateform/:codigo", productController.getUpdateForm);
router.post("/update", productController.updateProduct);

module.exports = router;
