const Expense = require('../models/expense');
const jwt = require('jsonwebtoken');
const { catchBlock, sendResBlock } = require('../util/helpers');

exports.getAllExpenses = async (req, res, next) => {
	const page = Number(req.query.page) - 1;
	const items = Number(req.query.items);
	console.log(page, items);
	try {
		const expenseResponse = await Expense.find({
			userId: req.user._id,
		})
			.skip(page * items)
			.limit(items);
		console.log(expenseResponse, expenseResponse.length);
		sendResBlock(res, {
			expenseResponse,
			username: req.user.name,
			isPremium: req.user.isPremium,
		});
	} catch (err) {
		console.log(err);
		catchBlock(res, err, 'Expense could not be retrieved');
	}
};

exports.getOneExpense = async (req, res, next) => {
	try {
		const response = await Expense.findOne({
			_id: req.params.id,
			userId: req.user._id,
		});
		sendResBlock(res, response);
	} catch (err) {
		catchBlock(res, err, 'Expense could not be retrieved');
	}
};

exports.postAddExpense = async (req, res, next) => {
	try {
		const expenseCreateResponse = await Expense({
			amount: parseInt(req.body.amount),
			description: req.body.description,
			category: req.body.category,
			userId: req.user._id,
		});
		req.user.totalAmount += parseInt(req.body.amount);
		if (expenseCreateResponse._id) {
			expenseCreateResponse.save();
			req.user.save();
		}
		sendResBlock(res, expenseCreateResponse, 'Expense added successfully!');
	} catch (err) {
		catchBlock(res, err, 'Expense could not be added');
	}
};

exports.putUpdateExpense = async (req, res, next) => {
	const amount = parseInt(req.body.amount);
	let t;
	try {
		t = await sequelize.transaction();
		const expenseResponse = await Expense.findOne({
			id: req.params.id,
			userId: req.user.id,
		});
		if (expenseResponse.amount != amount) {
			if (expenseResponse.amount < amount) {
				req.user.totalAmount += amount - expenseResponse.amount;
			} else {
				req.user.totalAmount -= expenseResponse.amount - amount;
			}
		}
		expenseResponse.amount = amount;
		expenseResponse.description = req.body.description;
		expenseResponse.category = req.body.category;
		expenseResponse.save();
		req.user.save();
		sendResBlock(res, expenseResponse, 'Expense updated successfully!');
	} catch (err) {
		catchBlock(res, err, 'Expense could not be updated');
	}
};

exports.deleteExpense = async (req, res, next) => {
	try {
		const expenseResponse = await Expense.findByIdAndRemove(req.params.id);
		console.log(expenseResponse);
		req.user.totalAmount -= expenseResponse.amount;
		console.log(req.user);
		sendResBlock(res, expenseResponse, 'Expense deleted successfully!');
	} catch (err) {
		catchBlock(res, err, 'Expense could not be deleted');
	}
};
