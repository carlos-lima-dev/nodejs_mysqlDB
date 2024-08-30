module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("home", {situacao: "error"}); // Render a generic error page or message
};
