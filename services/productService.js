const mysql = require("mysql2/promise");
const dbConfig = require("../config/db");

const getDbConnection = async () => {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error("Error creating database connection:", error);
    throw error;
  }
};

const getProducts = async (category, search) => {
  let sql = "SELECT * FROM products";
  let conditions = [];

  if (category) conditions.push("category = ?");
  if (search) conditions.push("nome LIKE ?");

  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");

  const db = await getDbConnection();
  const [results] = await db.query(sql, [
    category || null,
    search ? `%${search}%` : null,
  ]);
  return results;
};

const registerProduct = async (nome, valor, imagemName, categoria) => {
  const db = await getDbConnection();
  await db.query(
    "INSERT INTO products (nome, valor, imagem, category) VALUES (?, ?, ?, ?)",
    [nome, valor, imagemName, categoria]
  );
};

const removeProduct = async (codigo) => {
  const db = await getDbConnection();
  await db.query("DELETE FROM products WHERE codigo = ?", [codigo]);
};

const getProductByCode = async (codigo) => {
  const db = await getDbConnection();
  const [results] = await db.query("SELECT * FROM products WHERE codigo = ?", [
    codigo,
  ]);
  return results[0];
};

const updateProduct = async (codigo, nome, valor, categoria, imagemName) => {
  const db = await getDbConnection();
  if (imagemName) {
    await db.query(
      "UPDATE products SET nome = ?, valor = ?, imagem = ?, category = ? WHERE codigo = ?",
      [nome, valor, imagemName, categoria, codigo]
    );
  } else {
    await db.query(
      "UPDATE products SET nome = ?, valor = ?, category = ? WHERE codigo = ?",
      [nome, valor, categoria, codigo]
    );
  }
};

module.exports = {
  getProducts,
  registerProduct,
  removeProduct,
  getProductByCode,
  updateProduct,
};
