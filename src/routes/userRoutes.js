import express from 'express';
import { confirmVerificationCode, createAccount } from '../controller/userController.ts';

const router = express.Router();

router.post('/create-account', createAccount);
router.post('/verify-account', confirmVerificationCode);

export default router