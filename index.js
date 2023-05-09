const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expensesRoutes');
const purchaseRoutes = require('./routes/purchase');
// const premiumRoutes = require('./routes/premiumRoute');
const mongoose = require('mongoose');
// const User = require('./models/user');
// const Expenses = require('./models/expense');
// const Order = require('./models/order');
// const ForgotPasswordRequest = require('./models/reset-password');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, 'access.log'),
	{ flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(bodyParser.json({ extended: false }));

app.use(authRoutes);
app.use(expenseRoutes);
app.use(purchaseRoutes);
// app.use(premiumRoutes);

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.veoi4dk.mongodb.net/expense-tracker?retryWrites=true&w=majority`
	)
	.then(() => app.listen(process.env.PORT))
	.catch((err) => console.log(err));
