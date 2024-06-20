import jwt from 'jsonwebtoken';

export function validateJWT(token: string): any {
  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    // Handle various token errors
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token validation failed');
    }
  }
}
