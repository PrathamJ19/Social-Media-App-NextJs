import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service'; // If you have custom auth middleware

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, AuthMiddleware], // Add AuthMiddleware if required globally
  exports: [UsersService], // Export UsersService for usage in other modules
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // Apply the AuthMiddleware
      .forRoutes(
        { path: 'users/profile/:username', method: RequestMethod.GET },
        { path: 'users/follow/:username', method: RequestMethod.POST },
        { path: 'users/unfollow/:username', method: RequestMethod.POST },
        // You can add more routes where authentication is required
      );
  }
}
