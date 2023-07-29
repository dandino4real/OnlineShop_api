const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.createUser = async (req, res) => {};

exports.EditUser = async (req, res) => {

  try {
    const user = await User.findById(req.params.id)
    if(!(user.email === req.body.email)){
      const emailInUse = await User.findOne({email: req.body.email})

      if(emailInUse) return res.status(400).send("That email is already taken")
    }

    if(req.body.password && user){
      const salt = await bcrypt.genSalt(10)
      const hashPassword =  await bcrypt.hash(req.body.password, salt)
      user.password = hashPassword
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name, 
      email: req.body.email,
      isAdmin: req.body.isAdmin,
      password: user.password
    }, {new: true})

    res.status(200).send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    })

  } catch (error) {
    res.status(500).send(error)
  }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id)
        res.status(200).send(deleteUser)
      } catch (error) {
        res.status(500).send(error)
        
      }
};


exports.getUserStats = async(req, res) => {
    const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const users = await User.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
}