import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { generateToken } from '../config/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user exists
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = UserModel.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: role || 'traveler',
    });

    // Get created user
    const user = UserModel.findById(result.lastInsertRowid);

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    // Remove password from response
    delete user.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✅ User found:', user.email);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✅ Password valid');

    // Check account status
    if (user.account_status !== 'active') {
      console.log('❌ Account not active:', email);
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    // Remove password from response
    delete user.password;

    console.log('✅ Login successful:', email);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    console.error('🔴 Login error:', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = UserModel.findById(req.user.id);
    delete user.password;

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};
