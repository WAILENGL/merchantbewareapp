// @ts-check
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import moongoose from 'mongoose';
import shopify from './shopify.js';
import productCreator from './product-creator.js';
import PrivacyWebhookHandlers from './privacy.js';
import { CustomerModel } from './model/CustomersInfo.js';

const PORT = parseInt(
	process.env.BACKEND_PORT || process.env.PORT || '3000',
	10
);

const STATIC_PATH =
	process.env.NODE_ENV === 'production'
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();

moongoose
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

app.get('/api/customers/badCustomers_order_activity', async (_req, res) => {});

app.get('/api/customers', async (_req, res) => {
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
