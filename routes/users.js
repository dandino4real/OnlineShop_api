const express = require("express");
const router = express.Router();

const { isUser, isAdmin, auth } = require("../middleware/auth");
const adminControllers = require("../controllers/adminController");
const userControllers = require("../controllers/userController");

//USER

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);

// ADMIN

router.get("/", isAdmin, adminControllers.getUsers);
router
  .route("/:id")
  .get(isUser, adminControllers.getUser)
  .put(isAdmin, adminControllers.EditUser)
  .delete(isAdmin, adminControllers.deleteUser);

//GET USER STATS
router.get("/stats", isAdmin, adminControllers.getUserStats);


module.exports = router;
