const path = require("path");
const fs = require("fs");
const productService = require("../services/productService");

const getProducts = async (req, res, next) => {
  const {category, search, situacao} = req.query;

  try {
    const products = await productService.getProducts(category, search);
    res.render("home", {products, situacao});
  } catch (error) {
    console.error("Database query error:", error);
    next(error);
  }
};

const registerProduct = async (req, res, next) => {
  try {
    const {nome, valor, categoria} = req.body;
    const imagem = req.files?.imagem;

    if (!nome || !valor || isNaN(valor) || !imagem) {
      return res.redirect("/?situacao=falhaCadastro");
    }

    const imagePath = path.join(__dirname, "../images", imagem.name);
    await imagem.mv(imagePath);

    await productService.registerProduct(nome, valor, imagem.name, categoria);

    res.redirect("/?situacao=okCadastro");
  } catch (error) {
    next(error);
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const {codigo, imagem} = req.params;

    await productService.removeProduct(codigo);

    const imagePath = path.join(__dirname, "../images", imagem);
    fs.unlink(imagePath, (err) => {
      if (err) console.log("Erro ao eliminar a imagem antiga.");
    });

    res.redirect("/?situacao=okRemover");
  } catch (error) {
    next(error);
  }
};

const getUpdateForm = async (req, res, next) => {
  try {
    const {codigo} = req.params;
    const product = await productService.getProductByCode(codigo);

    res.render("editform", {product});
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const {codigo, nome, valor, categoria, productimage} = req.body;

    if (!nome || !valor || isNaN(valor)) {
      return res.redirect("/?situacao=falhaEdicao");
    }

    if (req.files && req.files.imagem) {
      const imagem = req.files.imagem;
      const imagePath = path.join(__dirname, "../images", imagem.name);

      await imagem.mv(imagePath);
      fs.unlink(path.join(__dirname, "../images", productimage), (err) => {
        if (err) console.log("Erro ao eliminar a imagem antiga.");
      });

      await productService.updateProduct(
        codigo,
        nome,
        valor,
        categoria,
        imagem.name
      );
    } else {
      await productService.updateProduct(codigo, nome, valor, categoria);
    }

    res.redirect("/?situacao=okEdicao");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  registerProduct,
  removeProduct,
  getUpdateForm,
  updateProduct,
};
