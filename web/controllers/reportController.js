import shopify from '../shopify.js';
import { ReportModel } from '../model/ReportModel.js';
import { CustomerModel } from '../model/CustomersInfo.js';


export const badCustomerReportUpdate = async (_req, res) => {
	try {
		const updateReport = await ReportModel.findByIdAndUpdate(
			{ _id: _req.params.id },
			{ ..._req.body }
		);
		res.status(200).send(updateReport);
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
};

export const badCustomerReportDelete = async (_req, res) => {
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
		6;
	}
}

export const badCustomerReportSave = async (_req, res) => {
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
			try {
				const orders = new shopify.api.rest.Order({
					session: res.locals.shopify.session,
				});
				orders.id = item?.id;
				orders.tags = 'bad customer';

				return await orders.save({
					update: true,
				});
			} catch (err) {
				return err.message;
			}
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
			shopName: _req.body.shop,
			content: _req.body.content,
		};

		const findUserMongoDB = await CustomerModel.findOne({
			email: customerInfo?.email,
		});
		const findReportDB = await ReportModel.findOne({
			email: customerInfo?.email,
		});

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

			const newreports = new ReportModel(newReport);
			await newreports.save();

			console.log('New customer created:', newCustomer);
		} else {
			const newreports = new ReportModel(newReport);
			await newreports.save();
		}

		res.status(200).send({ ...customer });
	} catch (err) {
		res.status(err.code).send(err.message);
	}
}

export const getBadCustomerFromDB = async (_req, res) => {
	try {
		const users = await CustomerModel.find();
		const reports = await ReportModel.find();

		const merged = await Promise.all(
			users.map(async (user) => {
				try {
					const report = reports.find((r) => r.email === user.email);
					return report ? { ...user?._doc, report: report?._doc } : user._doc;
				} catch (error) {
					console.error(
						`Error merging user with id ${user.id}: ${error.message}`
					);
					return user; // Return the user object unchanged if no report is found or an error occurs
				}
			})
		);

		res.json(merged?.reverse());
	} catch (error) {
		console.error(`Error fetching data: ${error.message}`);
		res.status(500).send('Internal Server Error');
	}
}

export const customerReportCheck = async (_req, res) => {
	try {
		// Ensure session is available
		const session = res.locals.shopify.session;
		if (!session) {
			return res.status(401).send('Unauthorized: Session is missing');
		}

		// Fetch customers from Shopify
		const customers = await shopify.api.rest.Customer.all({ session });

		// Check if customer data is available
		if (!customers?.data) {
			return res.status(500).send('Failed to retrieve customers');
		}

		// Fetch reports for each customer
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

		// Send the final data
		setTimeout(() => {
			res.status(200).json(customersData);
		}, 200);
	} catch (err) {
		console.error('Error in /api/customers:', err);
		res.status(500).send('unhandled error');
	}
}



export const badCustomerTarget = async (_req, res) => {
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
		setTimeout(() => {
			res.status(200).json(customers);
		}, 200);
	} catch (err) {
		res.status(500).send(err.message);
	}
}