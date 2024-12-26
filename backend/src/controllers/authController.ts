import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', username);
     res.status(400).json({ error: 'Invalid password' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    console.log('Login successful for user:', username);
    res.json({ token });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ error: 'Error logging in', details: (error as Error).message });
  }
};
