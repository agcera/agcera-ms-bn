import jwt, { SignOptions } from 'jsonwebtoken';

export const defaultTokenExpirySeconds = 24 * 60 * 60;

export const generateToken = (payload: Record<string, unknown>, expiresIn?: SignOptions['expiresIn']) => {
  const tokenExpiry: SignOptions['expiresIn'] = expiresIn ?? defaultTokenExpirySeconds;
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: tokenExpiry });
};

export const verifyToken = (token: string): Record<string, unknown> =>
  jwt.verify(token, process.env.JWT_SECRET!) as Record<string, unknown>;
