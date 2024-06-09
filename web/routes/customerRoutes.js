import express from 'express';
import { getSingleCustomer, getCustomers } from '../controllers/customerController.js';

const router = express.Router();

router.get('/singleCustomer/:id', getSingleCustomer);
router.get('/', getCustomers);

// Define other customer-related routes here

export default router;
