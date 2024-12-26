import express, { Router } from 'express';
import { shortenUrl, redirectToUrl, getUrlAnalytics } from '../controllers/urlController';

const router: Router = express.Router();

// Use the routes as middleware functions
router.post('/shorten', shortenUrl);
router.get('/redirect/:shortCode', redirectToUrl);
router.get('/analytics/:shortCode', getUrlAnalytics);

export default router;
