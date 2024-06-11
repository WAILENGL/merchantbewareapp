import shopify from '../shopify.js';
import { ReportModel } from '../model/ReportModel.js';

export const getOrders = async (_req, res) => {
	try {
		const orders = await shopify.api.rest.Order.all({
			session: res.locals.shopify.session,
			status: 'any',
		});

		const reportsOnOrder = await Promise.all(
			orders?.data?.map(async (data) => {
				try {
					const reportCheck = await ReportModel.findOne({
						email: data?.customer?.email,
					});
					if (reportCheck) {
						return { ...data, report: reportCheck };
					} else {
						return { ...data, report: null };
					}
				} catch (err) {}
			})
		);

		res.status(200).send(reportsOnOrder);
	} catch (err) {
		res.status(err.statusCode).send(err.message);
	}
};
