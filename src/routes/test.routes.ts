import express from 'express';
import { reset } from '../controllers/test.controller.js';

const router = express.Router();

router.post('/reset', reset);

export default router;
