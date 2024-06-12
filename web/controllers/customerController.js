import shopify from '../shopify.js';
import { ReportModel } from '../model/ReportModel.js';
import { CustomerModel } from '../model/CustomersInfo.js';

export const getSingleCustomer = async (_req, res) => {
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
};

export const badCustomersUpdate = async (_req, res) => {
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
};










