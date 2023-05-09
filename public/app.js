// Initialize Variables with HTML Element
let expenseAmount = document.querySelector('#expense-amount');
let expenseInfo = document.querySelector('#expense-info');
let expenseCategory = document.querySelector('#expense-category');
let btn = document.querySelector('.add-update');
let expenseList = document.querySelector('.expense-list');
let buyBtn = document.querySelector('.buy-btn');
let leaderboardBtn = document.querySelector('#leaderboard-btn');
let pagination = document.querySelector('.pagination');
let itemsPerPage = document.querySelector('#items-per-page');
let logout = document.querySelector('.logout');

// Event Handlers
document.addEventListener('DOMContentLoaded', getExpenses);
btn.addEventListener('click', addExpense);
expenseList.addEventListener('click', editExpense);
expenseList.addEventListener('click', deleteExpense);
buyBtn.addEventListener('click', addBuyPremium);
leaderboardBtn.addEventListener('click', updateLeaderboard);
pagination.addEventListener('click', updatePagination);
itemsPerPage.addEventListener('change', updateItemsPerPage);
logout.addEventListener('click', () => {
	localStorage.clear();
	window.location.href = 'http://localhost:3000/login.html';
});

function updateItemsPerPage(e) {
	localStorage.setItem('items', itemsPerPage.value);
	getExpenses(e, itemsPerPage.value);
}

// CRUD Functions

// Get All Expenses From Database
async function getExpenses(e, items = 10) {
	const token = localStorage.getItem('token');
	if (localStorage.getItem('items')) {
		items = localStorage.getItem('items');
		itemsPerPage.value = items;
	}
	let pageNumber = 1;
	if (token) {
		try {
			const response = await axios.get(
				`http://localhost:3000/expenses?items=${items}&page=${pageNumber}`,
				{ headers: { 'Authorization': token } }
			);
			console.log(response);
			const data = response.data.response;
			document.querySelector('.logged-user').textContent = data.username;
			logout.classList.remove('d-none');
			setPremium(data.isPremium);
			expenseList.innerHTML = '';
			data.expenseResponse.forEach((expense) => {
				generateHTML(
					expense._id,
					expense.amount,
					expense.description,
					expense.category
				);
			});
			pagination.innerHTML = '';
			if (pageNumber) {
				pagination.innerHTML = `<li class="page-item mx-2"><button class="page-link btn">${pageNumber}</button></li>`;
			}
			if (data.count > pageNumber * items) {
				pagination.innerHTML += `<li class="page-item mx-2"><button class="page-link btn">${
					pageNumber + 1
				}</button></li>`;
			}
			if (pageNumber > 1) {
				pagination.innerHTML =
					`<li class="page-item mx-2"><button class="page-link btn">${
						pageNumber - 1
					}</button></li>` + pagination.innerHTML;
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		alert('Please Login');
		window.location.href = 'http://localhost:3000/login.html';
	}
}

// Add Expense In Database
async function addExpense(e) {
	e.preventDefault();
	const token = localStorage.getItem('token');
	if (token) {
		const id = document.getElementById('expense-id').value;
		let obj = {
			'amount': parseInt(expenseAmount.value),
			'description': expenseInfo.value,
			'category': expenseCategory.value,
		};
		if (id) {
			try {
				const response = await axios.put(
					`http://localhost:3000/expenses/${id}`,
					obj,
					{ headers: { 'Authorization': token } }
				);
				window.location.reload();
			} catch (error) {
				console.log(error);
			}
		} else {
			if (
				!id &&
				expenseAmount.value &&
				expenseInfo.value &&
				expenseCategory.value
			) {
				try {
					const response = await axios.post(
						'http://localhost:3000/expenses',
						obj,
						{ headers: { 'Authorization': token } }
					);
					generateHTML(
						response.data.response.id,
						response.data.response.amount,
						response.data.response.description,
						response.data.response.category
					);
					setInputValues();
					expenseAmount.focus();
				} catch (err) {
					console.log(err);
				}
			} else {
				alert('Please fill all fields');
			}
		}
	} else {
		alert('Please login to add expense');
		window.location.href = 'http://localhost:3000/login.html';
	}
}

// Delete Expense From Database
async function deleteExpense(e) {
	if (e.target.classList.contains('delete')) {
		const id = e.target.getAttribute('id');
		e.target.parentElement.parentElement.remove();
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const response = await axios.delete(
					`http://localhost:3000/expenses/${id}`,
					{ headers: { 'Authorization': token } }
				);
				setInputValues();
			} catch (e) {
				console.log(e);
			}
		}
	}
}

// Edit Expense From Database
async function editExpense(e) {
	if (e.target.classList.contains('edit')) {
		const id = e.target.getAttribute('id');
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const response = await axios.get(
					`http://localhost:3000/expenses/${id}`,
					{ headers: { 'Authorization': token } }
				);
				document.getElementById('expense-id').value =
					response.data.response._id;
				setInputValues(
					response.data.response.amount,
					response.data.response.description,
					response.data.response.category
				);
			} catch (e) {
				console.log(e);
			}
		}
	}
}

// Pagination
async function updatePagination(e, items = 10) {
	const token = localStorage.getItem('token');
	if (localStorage.getItem('items')) {
		items = localStorage.getItem('items');
	}
	let pageNumber = parseInt(e.target.textContent);
	console.log(pageNumber);
	if (token) {
		try {
			const response = await axios.get(
				`http://localhost:3000/expenses?page=${pageNumber}&items=${items}`,
				{ headers: { 'Authorization': token } }
			);
			const data = response.data.response.expenseResponse;
			document.querySelector('.logged-user').textContent =
				response.data.response.username;
			setPremium(response.data.response.ispremium);
			expenseList.innerHTML = '';
			data.rows.forEach((expense, index) => {
				generateHTML(
					expense.id,
					expense.amount,
					expense.description,
					expense.category
				);
			});
			pagination.innerHTML = '';
			if (pageNumber) {
				pagination.innerHTML = `<li class="page-item mx-2"><button class="page-link btn">${pageNumber}</button></li>`;
			}
			if (data.count > pageNumber * itemsPerPage) {
				pagination.innerHTML += `<li class="page-item mx-2"><button class="page-link btn">${
					pageNumber + 1
				}</button></li>`;
			}
			if (pageNumber > 1) {
				pagination.innerHTML =
					`<li class="page-item mx-2"><button class="page-link btn">${
						pageNumber - 1
					}</button></li>` + pagination.innerHTML;
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		alert('Please Login');
		window.location.href = 'http://localhost:3000/login.html';
	}
}

// Leaderboard information
async function updateLeaderboard(e) {
	try {
		const response = await axios.get(
			'http://localhost:3000/premium/showleaderboard'
		);
		const leaderBoardList = document.querySelector('.leaderboard-list');
		leaderBoardList.innerHTML = '';
		response.data.forEach((userDetail) => {
			let output = `<tr>
                            <td class="fw-bold">${userDetail.name}</td>
                            <td>${userDetail.totalAmount} Rs</td>
                        </tr>`;
			leaderBoardList.innerHTML += output;
		});
	} catch (e) {
		console.log(e);
	}
}

// Razorpay Payment Method Integration
async function addBuyPremium(e) {
	const token = localStorage.getItem('token');
	if (token) {
		try {
			const response = await axios.get(
				'http://localhost:3000/purchase/premiummembership',
				{ headers: { 'Authorization': token } }
			);
			console.log(response);
			var options = {
				'key': response.data.key_id, // Enter the Key ID generated from the Dashboard
				'name': 'Acme Corp', //your business name
				'description': 'Test Transaction',
				'order_id': response.data.order.orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
				'handler': async function (response) {
					setPremium();
					await axios.post(
						'http://localhost:3000/updatetransactionstatus',
						{
							orderId: options.order_id,
							paymentId: response.razorpay_payment_id,
							status: 'success',
						},
						{ headers: { 'Authorization': token } }
					);
				},
			};
			const razorpay = new Razorpay(options);
			razorpay.open();
			e.preventDefault();
			razorpay.on('payment.failed', (response) => {
				axios.post(
					'http://localhost:3000/updatetransactionstatus',
					{
						orderId: options.order_id,
						paymentId: response.error.metadata.payment_id,
						status: 'failed',
					},
					{ headers: { 'Authorization': token } }
				);
				alert(response.error.description);
			});
		} catch (e) {
			console.log(e);
		}
	}
}

// Helper functions
function generateHTML(id, am, ds, ca) {
	let output = `<tr>
                    <td>${ds}</td>
                    <td>${ca}</td>
                    <td>${am} rs</td>
                    <td>
                        <button type="button" id="${id}" class="btn small edit py-0">Edit</button>
                        <button type="button" id="${id}" class="btn small delete py-0">Delete</button>
                    </td>
                </tr>`;
	expenseList.innerHTML += output;
}

function setInputValues(a = '', d = '', c = '') {
	expenseAmount.value = a;
	expenseInfo.value = d;
	expenseCategory.value = c;
}

function setPremium(ispremium = true) {
	if (ispremium) {
		document.querySelector('.premium-text').classList.remove('d-none');
		buyBtn.classList.add('d-none');
		document.querySelector('.leaderboard').classList.remove('d-none');
	}
}
