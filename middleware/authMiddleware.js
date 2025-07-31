import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]; //get token

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

      req.user = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized, admin not found' }); // Perbarui pesan
      }
      next();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
