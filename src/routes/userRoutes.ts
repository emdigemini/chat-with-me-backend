import express from 'express';
import { createAccount, verifyEmail, confirmEmailVerification, loginAccount, getCurrentUser, logoutAccount, changeGender, changeName } from '../controller/userController.ts';
import authentication from '../middleware/authentication.ts';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/confirm-verification', confirmEmailVerification);
router.post('/create-account', createAccount);
router.post('/login-account', loginAccount);
router.post('/logout-account', logoutAccount);
router.get('/check-auth', authentication, getCurrentUser);
router.put('/change-name/:id', changeName);
router.put('/change-gender/:id', changeGender);

export default router