const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const expenseSchema = Schema({
	amount: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Expense', expenseSchema);

// 	category: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = Expenses;
