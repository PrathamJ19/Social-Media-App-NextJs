// auth.middleware.ts

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service'; // Import UsersService to access user data (optional)

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Get the token from Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new HttpException('No token provided', HttpStatus.FORBIDDEN);
    }

    const token = authHeader.split(' ')[1]; // Assuming 'Bearer <token>'

    if (!token) {
      throw new HttpException('No token provided', HttpStatus.FORBIDDEN);
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key',
      ) as { id: string };

      // Fetch the user by decoded id (optional)
      const user = await this.usersService.getUserById(decoded.id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Attach user object to request for further use
      req.user = user;

      // Pass to the next middleware/route handler
      next();
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
