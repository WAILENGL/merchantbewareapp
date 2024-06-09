import express from 'express';
import { countProducts, getProducts, createProducts } from '../controllers/productController.js';

const router = express.Router();

router.get('/count', countProducts);
router.get('/', getProducts);
router.post('/', createProducts);

export default router;
