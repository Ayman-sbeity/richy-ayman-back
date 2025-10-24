import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; 

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const cacheKey = `user_${decoded.id}`;
      const cached = userCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        req.user = cached.user;
        return next();
      }

  const user = await User.findById(decoded.id).select('-password -password_hash').lean();
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      userCache.set(cacheKey, {
        user,
        timestamp: Date.now()
      });

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Not authorized as admin' 
    });
  }
};

export { protect, admin };
