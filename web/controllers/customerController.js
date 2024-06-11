import shopify from '../shopify.js';
import ReportModel from '../model/ReportModel.js';

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
