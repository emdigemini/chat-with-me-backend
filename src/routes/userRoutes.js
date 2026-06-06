import express from 'express';
import { createAccount, verifyEmail, loginAccount } from '../controller/userController.ts';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/create-account', createAccount);
router.post('/login-account', loginAccount);

export default router