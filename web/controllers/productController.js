import shopify from '../shopify.js';

export const countProducts = async (req, res) => {
    try {
        const countData = await shopify.api.rest.Product.count({
            session: res.locals.shopify.session,
        });
        res.status(200).send(countData);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const getProducts = async (req, res) => {
    const client = new shopify.api.clients.Rest({
        session: res.locals.shopify.session,
    });

    try {
        const product = await client.get({
            path: 'products',
        });
        res.status(200).send(product);
    } catch (err) {
        res.status(err.statusCode).send(err.message);
    }
};

export const createProducts = async (req, res) => {
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
};
