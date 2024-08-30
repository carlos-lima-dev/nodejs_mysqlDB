const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const dbConfig = require("../config/db");

const getDbConnection = async () => {
  return mysql.createConnection(dbConfig);
};

router.get("/", async (req, res, next) => {
  const {category, search, situacao} = req.query;
  let sql = "SELECT * FROM products";
  let conditions = [];

  if (category) conditions.push(`category = ?`);
  if (search) conditions.push(`nome LIKE ?`);

  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");

  try {
    const db = await getDbConnection();
    const [results] = await db.query(sql, [
      category || null,
      search ? `%${search}%` : null,
    ]);
    res.render("home", {products: results, situacao});
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const {nome, valor, categoria} = req.body;
    const imagem = req.files?.imagem;

    if (!nome || !valor || isNaN(valor) || !imagem) {
      return res.redirect("/?situacao=falhaCadastro");
    }

    const imagePath = path.join(__dirname, "../images", imagem.name);
    await imagem.mv(imagePath);

    const db = await getDbConnection();
    await db.query(
      "INSERT INTO products (nome, valor, imagem, category) VALUES (?, ?, ?, ?)",
      [nome, valor, imagem.name, categoria]
    );

    res.redirect("/?situacao=okCadastro");
  } catch (error) {
    next(error);
  }
});

router.get("/remove/:codigo&:imagem", async (req, res, next) => {
  try {
    const {codigo, imagem} = req.params;

    const db = await getDbConnection();
    await db.query("DELETE FROM products WHERE codigo = ?", [codigo]);

    const imagePath = path.join(__dirname, "../images", imagem);
    fs.unlink(imagePath, (err) => {
      if (err) console.log("Erro ao eliminar a imagem antiga.");
    });

    res.redirect("/?situacao=okRemover");
  } catch (error) {
    next(error);
  }
});

router.get("/updateform/:codigo", async (req, res, next) => {
  try {
    const {codigo} = req.params;

    const db = await getDbConnection();
    const [results] = await db.query(
      "SELECT * FROM products WHERE codigo = ?",
      [codigo]
    );

    res.render("editform", {product: results[0]});
  } catch (error) {
    next(error);
  }
});

router.post("/update", async (req, res, next) => {
  try {
    const {codigo, nome, valor, categoria, productimage} = req.body;

    if (!nome || !valor || isNaN(valor)) {
      return res.redirect("/?situacao=falhaEdicao");
    }

    const db = await getDbConnection();

    if (req.files && req.files.imagem) {
      const imagem = req.files.imagem;
      const imagePath = path.join(__dirname, "../images", imagem.name);

      await imagem.mv(imagePath);
      fs.unlink(path.join(__dirname, "../images", productimage), (err) => {
        if (err) console.log("Erro ao eliminar a imagem antiga.");
      });

      await db.query(
        "UPDATE products SET nome = ?, valor = ?, imagem = ?, category = ? WHERE codigo = ?",
        [nome, valor, imagem.name, categoria, codigo]
      );
    } else {
      await db.query(
        "UPDATE products SET nome = ?, valor = ?, category = ? WHERE codigo = ?",
        [nome, valor, categoria, codigo]
      );
    }

    res.redirect("/?situacao=okEdicao");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
