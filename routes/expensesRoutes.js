const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const authMiddleware = require('../middleware/auth-middleware');

router.get(
	'/expenses',
	authMiddleware.authenticateUser,
	expensesController.getAllExpenses
);

router.get(
	'/expenses/:id',
	authMiddleware.authenticateUser,
	expensesController.getOneExpense
);

router.post(
	'/expenses',
	authMiddleware.authenticateUser,
	expensesController.postAddExpense
);

router.put(
	'/expenses/:id',
	authMiddleware.authenticateUser,
	expensesController.putUpdateExpense
);

router.delete(
	'/expenses/:id',
	authMiddleware.authenticateUser,
	expensesController.deleteExpense
);

module.exports = router;
