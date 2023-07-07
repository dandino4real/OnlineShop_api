const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const register = require("./routes/register");
const login = require("./routes/login");
const orders = require("./routes/orders");
const stripe = require("./routes/stripe");
const productsRoute = require("./routes/products");
const userRoute = require("./routes/users");
// const rawBody = require("raw-body");

const app = express();


// Add the raw-body middleware before your route handling middleware
// app.use(express.raw({ verify: rawBodySignatureVerifier, type: "*/*" }));

// function rawBodySignatureVerifier(req, res, buf) {
//   if (buf && buf.length) {
//     req.rawBody = buf.toString("utf8");
//   }
// }

const products = require("./products");


require("dotenv").config();

app.use(express.json());
app.use(cors());

app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/orders", orders);
app.use("/api/stripe", stripe);
app.use("/api/products", productsRoute);
app.use("/api/users", userRoute );

app.get("/", (req, res) => {
  
  res.send("Welcome our to online shop API...");
});

app.get("/products", (req, res) => {
  res.send(products);
});

const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   
  })
  .then(() => console.log("MongoDB connection established..."))
  .catch((error) => console.error("MongoDB connection failed:", error.message));
