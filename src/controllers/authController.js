const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database').getClient();
const { sendSuccess, sendError } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    sendSuccess(res, { 
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token,
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Error during user registration:', error);
    sendError(res, 'Internal Server Error during registration', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid credentials', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 400);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    }, 'Login successful', 200);

  } catch (error) {
    console.error('Error during user login:', error);
    sendError(res, 'Internal Server Error during login', 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized: User information not available', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, user, 'User profile retrieved successfully', 200);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    sendError(res, 'Internal Server Error retrieving profile', 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized: User information not available', 401);
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      if (email !== req.user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== req.user.id) {
          return sendError(res, 'Email already taken by another user', 409);
        }
      }
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, updatedUser, 'User profile updated successfully', 200);
  } catch (error) {
    console.error('Error updating user profile:', error);
    sendError(res, 'Internal Server Error updating profile', 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized: User information not available', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid current password', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || 10));

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    sendSuccess(res, null, 'Password changed successfully', 200); 
  } catch (error) {
    console.error('Error changing password:', error);
    sendError(res, 'Internal Server Error changing password', 500);
  }
};