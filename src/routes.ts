import { filterAccountByDate } from './controllers/account/index';
import { Router } from 'express';
import {
  accountDeposit,
  createAccount,
  getAccountStatement,
  accountWithdraw,
  getClientInfo,
  deleteAccount,
  changeUserName,
} from './controllers/account';
import {
  verifyAccountAmountIsEnough,
  verifyExistentAccount,
  verifyInexistentAccount,
} from './controllers/account/middleware';

export const router = Router();

router.post('/account', verifyInexistentAccount, createAccount);
router.get('/statement', verifyExistentAccount, getAccountStatement);
router.patch('/deposit', verifyExistentAccount, accountDeposit);
router.patch(
  '/withdraw',
  verifyExistentAccount,
  verifyAccountAmountIsEnough,
  accountWithdraw
);
router.get('/client', verifyExistentAccount, getClientInfo);
router.delete('/account', verifyExistentAccount, deleteAccount);
router.patch('/account', verifyExistentAccount, changeUserName);
router.post('/statement', verifyExistentAccount, filterAccountByDate);
