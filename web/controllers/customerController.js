import shopify from '../shopify.js';
import { CustomerModel } from '../model/CustomersInfo.js';
import { ReportModel } from '../model/ReportModel.js';

export const getSingleCustomer = async (req, res) => {
	try {
		const customer = await shopify.api.rest.Customer.find({
			session: res.locals.shopify.session,
			id: parseInt(req.params.id),
		});
		const reportFromDb = await ReportModel.findOne({
			id: parseInt(req.params.id),
		});
		res.status(200).send({ ...customer, report: reportFromDb });
	} catch (err) {
		res.status(err.code).send(err.message);
	}
};

export const getCustomers = async (req, res) => {
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
};
