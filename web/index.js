// @ts-check
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import shopifyEnv from 'dotenv';
import serveStatic from 'serve-static';
import mongoose from 'mongoose';
import shopify from './shopify.js';
import PrivacyWebhookHandlers from './privacy.js';
import {
	getSingleCustomer,
	badCustomersUpdate,
} from './controllers/customerController.js';

import {
	badCustomerReportUpdate,
	badCustomerReportDelete,
	badCustomerReportSave,
	getBadCustomerFromDB,
	customerReportCheck,
	badCustomerTarget,
} from './controllers/reportController.js';
import { getOrders } from './controllers/orderController.js';
import { shopController } from './controllers/shopController.js';

const PORT = parseInt(
	process.env.BACKEND_PORT || process.env.PORT || '3000',
	10
);

shopifyEnv.config({ path: 'shopify.env' });

const STATIC_PATH =
	process.env.NODE_ENV === 'production'
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();

mongoose
	.connect(`${process.env.DB}`)
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

app.get('/api/customer/singleCustomer/:id', getSingleCustomer);

app.get('/api/orders', getOrders);

app.put('/api/customers/badCustomers', badCustomersUpdate);

app.put('/api/customers/report/:id', badCustomerReportUpdate);

app.delete('/api/customers/report/:id', badCustomerReportDelete);

app.put('/api/customer/report/:id', badCustomerReportSave);

app.get('/api/customers/badcustomerDb', getBadCustomerFromDB);

app.get('/api/shop', shopController);

app.get('/api/customers', customerReportCheck);

app.get('/api/customers/badCustomerTarget', badCustomerTarget);
app.get('/api/adminInfo', async (_req, res) => {
	try {
		res.status(500).send(res.locals.shopify.session);
	} catch (err) {
		res.status(500).send(err.message);
	}
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
