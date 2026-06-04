import express from 'express';
import { confirmVerificationCode, createAccount, loginAccount } from '../controller/userController.ts';

const router = express.Router();

router.post('/create-account', createAccount);
router.post('/verify-account', confirmVerificationCode);
router.post('/login-account', loginAccount);

export default router