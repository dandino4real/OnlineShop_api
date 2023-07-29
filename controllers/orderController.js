const { Order } = require("../models/Order");
const moment = require("moment");


exports.getOrders = async (req, res) => {
  const query = req.query.new;
  try {
    const orders = query
      ? await Order.find().sort({ _id: -1 }).limit(4)
      : await Order.find().sort({ _id: -1 });
    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id);
    if (req.user._id !== orders.userId || !req.user.isAdmin)
      return res.status(401).send("Access denied. Not authorized");
    res.status(200).send(orders);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.createOrder = async (req, res) => {
    const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).send(savedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.EditOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).send(updatedOrder);
      } catch (err) {
        res.status(500).send(err);
      }
};

exports.deleteOrder = async () => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).send("Order has been deleted...");
      } catch (err) {
        res.status(500).send(err);
      }
};


exports.getIncomeStats = async(req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  
    try {
      const income = await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$total",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).send(income);
    } catch (err) {
      res.status(500).send(err);
    }
    
}

exports.getOrderStats = async(req, res) => {
    const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const orders = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
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
    res.status(200).send(orders);
  } catch (err) {
    res.status(500).send(err);
  }

}

exports.getWeeklyStats = async(req, res) => {

    const last7Days = moment()
    .day(moment().day() - 7)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(last7Days) } } },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).send(sales);
  } catch (err) {
    res.status(500).send(err);
  }

}