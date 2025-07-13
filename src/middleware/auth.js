const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const prisma = require('../config/database').getClient();

exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return sendError(res, 'Unauthorized: No token provided', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        return sendError(res, 'Forbidden: Invalid or expired token', 403);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        console.warn(`Unauthorized: User ID ${decoded.userId} from token not found.`);
        return sendError(res, 'Unauthorized: User not found for token', 401);
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken middleware:', error);
    sendError(res, 'Internal Server Error during authentication', 500);
  }
};

