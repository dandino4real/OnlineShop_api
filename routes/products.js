const { isAdmin } = require("../middleware/auth");
const productControllers = require("../controllers/productController");

const router = require("express").Router();

router
  .route("/")
  .get(productControllers.getProducts)
  .post(isAdmin, productControllers.createProduct);

router
  .route("/:id")
  .get(productControllers.getProduct)
  .put(isAdmin, productControllers.editProduct)
  .delete(isAdmin, productControllers.deleteProduct);

module.exports = router;
