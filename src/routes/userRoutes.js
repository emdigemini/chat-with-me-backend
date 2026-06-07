import express from 'express';
import { createAccount, verifyEmail, confirmEmailVerification, loginAccount } from '../controller/userController.ts';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/confirm-verification', confirmEmailVerification);
router.post('/create-account', createAccount);
router.post('/login-account', loginAccount);
router.get('/check-auth', )

export default router