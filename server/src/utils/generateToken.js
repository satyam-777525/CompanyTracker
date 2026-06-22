import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};
