const Razorpay = require('razorpay');
const Order = require('../models/order');

exports.getPremiumMemberShip = async (req, res, next) => {
	console.log('wokring');
	const razorpay = new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	});

	razorpay.orders.create(
		{
			amount: 2500,
			currency: 'INR',
		},
		(err, order) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					error: err,
					message: 'Order id not created in razorpay',
				});
			} else {
				return Order.create({
					orderId: order.id,
					userId: req.user._id,
					status: 'pending',
				})
					.then((order) => {
						console.log(order);
						return res.status(201).json({
							order,
							key_id: razorpay.key_id,
						});
					})
					.catch((e) => console.log(e));
			}
		}
	);
};

exports.postUpdatetransactionStatus = (req, res, next) => {
	const updateOrder = Order.findOne({ orderId: req.body.orderId });
	console.log(updateOrder);
	updateOrder.paymentId = req.body.paymentId;
	updateOrder.status = req.body.status;
	updateOrder.save();
	req.user.isPremium = true;
	req.user.save();
};
