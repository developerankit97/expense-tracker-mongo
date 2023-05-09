const Expenses = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');

exports.getLeaderboard = async (req, res, next) => {
	try {
		const users = await User.find()
			.select('name totalAmount')
			.sort({ field: 'desc' });
		console.log(users);
		res.status(200).json(users);
	} catch (e) {
		console.log(e);
		res.status(500).json({ err: e });
	}
};

// exports.getExpenses = async (req, res, next) => {
//     try {
//         const expenses = await Expenses.findAll({
//             order: [['createdAt', 'DESC']]
//         }, { where: { userId: req.user.id } });
//         res.status(200).json(expenses);
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ err: e });
//     }
// }
