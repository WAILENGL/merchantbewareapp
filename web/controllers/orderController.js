import shopify from '../shopify.js';

export const getOrders = async (req, res) => {
    try {
        const orders = await shopify.api.rest.Order.all({
            session: res.locals.shopify.session,
            status: 'any',
        });
        res.status(200).send(orders);
    } catch (err) {
        res.status(err.statusCode).send(err.message);
    }
};
