// routes/customerRoutes.js

import { Router } from 'express';
import { getSingleCustomer } from '../controllers/customerController.js';

const router = Router();

router.get('/api/customer/singleCustomer/:id', getSingleCustomer);

export default router;
