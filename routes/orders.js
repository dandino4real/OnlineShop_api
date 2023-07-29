
const { auth, isAdmin } = require("../middleware/auth");
const orderControllers = require("../controllers/orderController");

const router = require("express").Router();



// createOrder is fired by stripe webhook

router
  .route("/")
  .get(isAdmin, orderControllers.getOrders)
  .post(auth, orderControllers.createOrder);

router
  .route("/:id")
  .get(auth, orderControllers.getOrder)
  .put(isAdmin, orderControllers.EditOrder)
  .delete(isAdmin, orderControllers.deleteOrder);


// GET INCOME STATS

router.get("/income/stats", isAdmin, orderControllers.getIncomeStats);

// GET ORDERS STATs

router.get("/stats", isAdmin, orderControllers.getOrderStats);

//GET 1 WEEK SALES

router.get("/week-sales", isAdmin, orderControllers.getWeeklyStats);

  
module.exports = router;
