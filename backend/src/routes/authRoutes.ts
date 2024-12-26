import express, { Router } from 'express';
import { register, login } from '../controllers/authController';

const router: Router = express.Router();

// Use the routes as middleware functions
router.post('/register', register);
router.post('/login', login);

export default router;