// @ts-check
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import mongoose from 'mongoose';
import shopify from './shopify.js';
import productCreator from './product-creator.js';
import PrivacyWebhookHandlers from './privacy.js';
import { CustomerModel } from './model/CustomersInfo.js';
import { ReportModel } from './model/ReportMode.js';
import dotenv from 'dotenv';

const PORT = parseInt(
	process.env.BACKEND_PORT || process.env.PORT || '3000',
	10
);

const STATIC_PATH =
	process.env.NODE_ENV === 'production'
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();

mongoose
	.connect(
		'mongodb+srv://waileng:NESBHCN6dcrEwu19@development.qq3anuj.mongodb.net/Data?retryWrites=true&w=majority&appName=Development'
	)
	.then((response) => console.log('mongoDB Connected', response))
	.catch((err) => console.log('mongoDB error', err.message));

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot()
);
app.post(
	shopify.config.webhooks.path,
	shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.get('/api/products/count', async (_req, res) => {
	const countData = await shopify.api.rest.Product.count({
		session: res.locals.shopify.session,
	});
	res.status(200).send(countData);
});

app.get('/api/customer/signleCustomer/:id', async (_req, res) => {
	try {
		const customer = await shopify.api.rest.Customer.find({
			session: res.locals.shopify.session,
			id: parseInt(_req.params.id),
		});
		const reportFromDb = await ReportModel.findOne({
			id: parseInt(_req.params.id),
		});
		res.status(200).send({ ...customer, report: reportFromDb });
	} catch (err) {
		res.status(err.code).send(err.message);
	}
});

app.get('/api/products', async (_req, res) => {
	const client = new shopify.api.clients.Rest({
		session: res.locals.shopify.session,
	});

	try {
		const product = await client.get({
			path: `products`,
		});
		res.status(200).send(product);
	} catch (err) {
		res.status(err.statusCode).send(err.message);
	}
});

app.get('/api/orders', async (_req, res) => {
	try {
		const orders = await shopify.api.rest.Order.all({
			session: res.locals.shopify.session,
			status: 'any',
		});
		res.status(200).send(orders);
	} catch (err) {
		res.status(err.statusCode).send(err.message);
	}
});

app.put('/api/customers/badCustomers', async (_req, res) => {
	try {
		// Getting orders
		let orders;
		try {
			orders = await shopify.api.rest.Order.all({
				session: res.locals.shopify.session,
				status: 'any',
			});
		} catch (err) {
			throw new Error(`Error fetching orders: ${err.message}`);
		}

		// Filtering orders that asked for refund
		const filteringRefund = orders?.data?.filter(
			(items) => items?.financial_status === 'refunded'
		);

		// Getting all the customers
		let customersData;
		try {
			customersData = await shopify.api.rest.Customer.all({
				session: res.locals.shopify.session,
			});
		} catch (err) {
			throw new Error(`Error fetching customers: ${err.message}`);
		}

		// Filtering the customers who asked for refund
		const refundedCustomersFilter = filteringRefund
			?.map((items) => {
				return customersData?.data?.find(
					(itemsFilter) => itemsFilter?.email === items?.contact_email
				);
			})
			.filter(Boolean);

		// Checking if customer asked for multiple refunds
		function findDuplicateUsers(users) {
			const emailCount = {};
			users.forEach((user) => {
				const email = user.email;
				emailCount[email] = (emailCount[email] || 0) + 1;
			});

			const uniqueDuplicateUsers = new Map();
			users.forEach((user) => {
				if (emailCount[user.email] > 1) {
					uniqueDuplicateUsers.set(user.email, user);
				}
			});

			return Array.from(uniqueDuplicateUsers.values());
		}

		const duplicates = findDuplicateUsers(refundedCustomersFilter);

		// Tagging duplicate customers as 'bad customer'
		try {
			for (let i = 0; i < duplicates.length; i++) {
				const customer = new shopify.api.rest.Customer({
					session: res.locals.shopify.session,
				});
				customer.id = duplicates[i]?.id;
				customer.tags = 'bad customer';
				await customer.save({
					update: true,
				});
			}
		} catch (err) {
			throw new Error(`Error updating customers: ${err.message}`);
		}

		let badCustomersOrder = [];
		for (let i = 0; i < duplicates.length; i++) {
			for (let j = 0; j < orders?.data.length; j++) {
				if (duplicates[i]?.email === orders?.data[j].contact_email) {
					badCustomersOrder.push(orders?.data[j]);
				}
			}
		}

		// Tagging orders of duplicate customers as 'bad customer'
		try {
			for (let i = 0; i < badCustomersOrder.length; i++) {
				let order = new shopify.api.rest.Order({
					session: res.locals.shopify.session,
				});
				order.id = badCustomersOrder[i].id;
				order.tags = 'bad customer';

				await order.save({
					update: true,
				});
			}
		} catch (err) {
			throw new Error(`Error updating orders: ${err.message}`);
		}

		res.status(200).send(badCustomersOrder);
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

app.put('/api/customers/report/:id', async (_req, res) => {
	try {
		const updateReport = await ReportModel.findByIdAndUpdate(
			{ _id: _req.params.id },
			{ ..._req.body }
		);
		res.status(200).send(updateReport);
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

app.delete('/api/customers/report/:id', async (_req, res) => {
	try {
		const customer = new shopify.api.rest.Customer({
			session: res.locals.shopify.session,
		});
		customer.id = parseInt(_req.params.id);
		customer.tags = '';
		await customer.save({
			update: true,
		});

		const findOrder = await shopify.api.rest.Customer.orders({
			session: res.locals.shopify.session,
			id: parseInt(_req.params.id),
		});
		const RemoveBadTags = findOrder?.orders?.map(async (item, index) => {
			const orders = new shopify.api.rest.Order({
				session: res.locals.shopify.session,
			});
			orders.id = item?.id;
			orders.tags = '';

			return await orders.save({
				update: true,
			});
		});

		await Promise.all(RemoveBadTags);
		await CustomerModel.deleteOne({ id: parseInt(_req.params.id) });
		await ReportModel.deleteOne({ id: parseInt(_req.params.id) });

		res.status(200).send('Deleted');
	} catch (err) {
		const status = err.status || 500;
		res.status(status).send({ message: err.message });
	}
});

app.put('/api/customer/report/:id', async (_req, res) => {
	try {
		const customerInfo = await shopify.api.rest.Customer.find({
			session: res.locals.shopify.session,
			id: parseInt(_req.params.id),
		});

		const findOrder = await shopify.api.rest.Customer.orders({
			session: res.locals.shopify.session,
			id: parseInt(_req.params.id),
		});

		const customer = new shopify.api.rest.Customer({
			session: res.locals.shopify.session,
		});
		customer.id = parseInt(_req.params.id);
		customer.tags = 'bad customer';

		await customer.save({
			update: true,
		});

		const badOrders = findOrder?.orders?.map(async (item, index) => {
			const orders = new shopify.api.rest.Order({
				session: res.locals.shopify.session,
			});
			orders.id = item?.id;
			orders.tags = 'bad customer';

			return await orders.save({
				update: true,
			});
		});

		await Promise.all(badOrders);

		// Adding a report to the customer's report array

		// const findUserMongoDB = await CustomerModel.findOne({
		// 	email: customerInfo?.email,
		// });
		const customerId = parseInt(_req.params.id);

		if (isNaN(customerId)) {
			return res.status(400).send('Invalid customer ID');
		}

		const newReport = {
			id: customerId, // Ensure this ID is unique or use a different method to generate unique IDs
			email: customerInfo?.email,
			reason: _req.body.reason,
			content: _req.body.content,
		};

		try {
			const findUserMongoDB = await CustomerModel.findOne({
				email: customerInfo?.email,
			});
			const findReportDB = await ReportModel.findOne({
				email: customerInfo?.email,
			});

			if (!findReportDB) {
				const newreports = new ReportModel(newReport);
				await newreports.save();
			}

			if (!findUserMongoDB) {
				console.log('New customer not found, creating...');

				const newCustomer = new CustomerModel({
					id: customerId,
					email: customerInfo?.email,
					first_name: customerInfo?.first_name,
					last_name: customerInfo?.last_name,
					addresses: customerInfo?.addresses,
					tags: 'bad customer',
				});

				await newCustomer.save();

				console.log('New customer created:', newCustomer);
			}

			res.status(200).send('Customer report updated successfully');
		} catch (err) {
			console.error('Error updating customer report:', err);
			res.status(500).send(`Error updating customer report: ${err.message}`);
		}

		res.status(200).send('Report successfully done');
	} catch (err) {
		res.status(err.code).send(err.message);
	}
});

app.get('/api/customers/badcustomerDb', async (_req, res) => {
	try {
		const users = await CustomerModel.find();
		const reports = await ReportModel.find();

		const merged = await Promise.all(
			users.map(async (user) => {
				try {
					const report = reports.find((r) => r.email === user.email);
					return report ? { ...user?._doc, report:report?._doc } : user._doc;
				} catch (error) {
					console.error(
						`Error merging user with id ${user.id}: ${error.message}`
					);
					return user; // Return the user object unchanged if no report is found or an error occurs
				}
			})
		);

		res.json(merged);
	} catch (error) {
		console.error(`Error fetching data: ${error.message}`);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/api/customers', async (_req, res) => {
	try {
		const customers = await shopify.api.rest.Customer.all({
			session: res.locals.shopify.session,
		});

		if (!customers?.data) {
			return res.status(500).send('Failed to retrieve customers');
		}

		const customersDataPromise = customers.data.map(async (customer) => {
			try {
				const reportOnDb = await ReportModel.findOne({ id: customer?.id });
				return { ...customer, report: reportOnDb };
			} catch (error) {
				console.error(
					`Error fetching report for customer ID ${customer?.id}:`,
					error
				);
				return { ...customer, report: null, error: error.message };
			}
		});

		const customersData = await Promise.all(customersDataPromise);

		setTimeout(() => {
			res.status(200).json(customersData);
		}, 100);
	} catch (err) {
		console.error('Error in /api/customers:', err);
		res.status(500).send(err.message);
	}
});

app.get('/api/customers/badCustomerTarget', async (_req, res) => {
	try {
		const customers = await shopify.api.rest.Customer.all({
			session: res.locals.shopify.session,
		});

		const badCustomers = customers?.data?.filter(
			(item) => item?.tags === 'bad customer'
		);

		const customerPromises = badCustomers.map(async (item) => {
			const newCustomer = new CustomerModel({
				id: item.id,
				email: item.email,
				first_name: item.first_name,
				last_name: item.last_name,
				addresses: item.addresses,
				tags: item.tags,
			});

			try {
				const existingCustomer = await CustomerModel.findOne({
					email: item.email,
				});
				if (!existingCustomer) {
					await newCustomer.save();
					return { message: 'user added', customer: item };
				} else {
					return { message: 'user already exists', customer: item };
				}
			} catch (error) {
				return { message: 'internal error', error: error.message };
			}
		});

		await Promise.all(customerPromises);

		res.status(200).json(customers);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

app.post('/api/products', async (_req, res) => {
	let status = 200;
	let error = null;

	try {
		await productCreator(res.locals.shopify.session);
	} catch (e) {
		console.log(`Failed to process products/create: ${e.message}`);
		status = 500;
		error = e.message;
	}
	res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
	return res
		.status(200)
		.set('Content-Type', 'text/html')
		.send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
