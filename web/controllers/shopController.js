import shopify from '../shopify.js';

export const shopContoller = async (_req, res) => {
	try {
		const result = await shopify.api.rest.Shop.all({
			session: res.locals.shopify.session,
		});
		res.status(200).send(result);
	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
}