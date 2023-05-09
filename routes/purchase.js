const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.get(
	'/purchase/premiummembership',
	authMiddleware.authenticateUser,
	purchaseController.getPremiumMemberShip
);

router.post(
	'/updatetransactionstatus',
	authMiddleware.authenticateUser,
	purchaseController.postUpdatetransactionStatus
);

module.exports = router;
