const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const ForgotPasswordRequest = require('../models/reset-password');
const sgMail = require('@sendgrid/mail');
const { sendResBlock } = require('../util/helpers');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.getUser = (req, res, next) => {
//     res.json(req.user);
// }

exports.postAddUser = async (req, res, next) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	try {
		const user = await User.findOne({ email: email });
		if (user) {
			return res.status(400).json({
				error: 'User already exists',
			});
		}
		const hashedPassword = await bcrypt.hash(password, 12);
		const newUser = await User({
			name: name,
			email: email,
			password: hashedPassword,
		});
		newUser.save();
		res.status(201).json({
			message: 'User saved successfully',
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: err,
		});
	}
};

exports.postLoginUser = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({
				error: 'User does not exist',
			});
		}
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({
				error: 'Invalid password',
			});
		}
		console.log(user);
		const token = jwt.sign(
			{
				id: user._id,
				name: user.name,
			},
			process.env.JWT_SECRET_KEY
		);
		res.status(200).json({
			message: 'Login successful',
			token: token,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: err,
		});
	}
};

exports.postForgotPassword = async (req, res, next) => {
	const email = req.body.email;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({
				error: 'User does not exist',
			});
		}
		console.log('working');
		const forgotPassowordResponse = await ForgotPasswordRequest.create({
			id: uuidv4(),
			isActive: true,
			userId: user.id,
		});
		console.log('wokring', forgotPassowordResponse);

		const msg = {
			to: 'ankitsharma76543@gmail.com',
			from: 'ankitsharma751997@gmail.com', // Use the email address or domain you verified above
			subject: 'Reset Password Link',
			html: `<h2>Click below link to reset your password</h2><a href="http://localhost:3000/password/resetpassword/${forgotPassowordResponse.id}">http://localhost:3000/password/resetpassword/${forgotPassowordResponse.id}</a></strong>`,
		};
		const emailResponse = await sgMail.send(msg);
		sendResBlock(res, emailResponse, 'Email sent successfully');
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: err,
		});
	}
};

exports.getResetPasswordForm = async (req, res, next) => {
	const id = req.params.resetId;
	try {
		const forgotPassowordResponse = await ForgotPasswordRequest.findOne({
			where: { id: id },
		});
		if (!forgotPassowordResponse) {
			return res.status(404).json({
				error: 'Invalid Request',
			});
		}
		if (forgotPassowordResponse.isActive) {
			// forgotPassowordResponse.update({ isActive: false });
			res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`);
			return res.end();
		}
		return res.send('<h1>Not Valid Request</h1>');
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: err,
		});
	}
};

exports.updatePassword = async (req, res, next) => {
	try {
		const { newpassword } = req.query;
		const updateId = req.params.updateId;
		const forgotPassowordResponse = await ForgotPasswordRequest.findOne({
			where: { id: updateId },
		});
		const user = await User.findOne({
			where: { id: forgotPassowordResponse.userId },
		});
		if (user) {
			const hashedPassword = await bcrypt.hash(newpassword, 12);
			user.password = hashedPassword;
			user.save();
			forgotPassowordResponse.update({ isActive: false });
			res.status(200).redirect('http://localhost:3000/login.html');
		} else {
			return res.status(404).json({
				error: 'User does not exist',
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: err,
		});
	}
};
