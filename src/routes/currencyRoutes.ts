import { Router } from 'express';
import { getCurrenciesList } from '../controllers/currencyController';
import { getExchangeRatesController } from '../controllers/exchangeController';

const router = Router();

router.get('/', getCurrenciesList);
router.get('/rates', getExchangeRatesController);

export default router;

