const express = require("express");
const {engine} = require("express-handlebars");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const productController = require("./controllers/productController");
const errorHandler = require("./middlewares/errorHandler");

app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(fileUpload());

app.engine(
  "handlebars",
  engine({
    helpers: {
      condicionalIgualdade: function (v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case "!=":
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case "<":
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case ">":
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/", productController);

// Error handler middleware
app.use(errorHandler);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 8080}.`);
});
