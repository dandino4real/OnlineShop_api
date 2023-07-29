const { Product } = require("../models/product");
const cloudinary = require("../utils/cloudinary");
const { auth, isUser, isAdmin } = require("../middleware/auth");


exports.getProducts = async (req, res) => {
  try {
    const q = JSON.stringify(req.query);
    const qString = q.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    const queryObj = JSON.parse(qString);

    let query = Product.find(queryObj);

    // SORT PRODUCTS
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //  LIMITING FIELDS
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const noOfDocuments = await Product.countDocuments(queryObj);
      if (skip >= noOfDocuments) {
        throw Error(" page does not exist");
      }
    }

    const products = await query;

    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.getProduct = async(req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
}

exports.editProduct = async(req, res) => {
  if (req.body.productImg) {
    try {
      const destroyResponse = await cloudinary.uploader.destroy(
        req.body.product.image.public_id
      );

      if (destroyResponse) {
        const uploadResponse = await cloudinary.uploader.upload(
          req.body.productImg,
          {
            upload_preset: "onlineShop",
          }
        );

        if (uploadResponse) {
          const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                ...req.body.product,
                image: uploadResponse,
              },
            },
            { new: true }
          );
          res.status(200).send(updatedProduct);
        }
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body.product,
        },
        { new: true }
      );
      res.status(200).send(updatedProduct);
    } catch (error) {
      res.status(500).send(error);
    }
  }

}


exports.createProduct = async() => {
  const { name, brand, desc, price, image } = req.body;

  try {
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image, {
        upload_preset: "onlineShop",
      });

      if (uploadedResponse) {
        const product = new Product({
          name,
          brand,
          desc,
          price,
          image: uploadedResponse,
        });

        const savedProduct = await product.save();
        res.status(200).send(savedProduct);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
}

exports.deleteProduct = async() => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found ...");
    if (product.image.public_id) {
      const destroyResponse = await cloudinary.uploader.destroy(
        product.image.public_id
      );

      if (destroyResponse) {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).send(deleteProduct);
      }
    } else {
      console.log("Action terminated. Failed to destroy product image ...");
    }

    res.status(200).send("Product has been deleted...");
  } catch (error) {
    res.status(500).send(error);
  }

}