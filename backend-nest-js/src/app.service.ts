import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getMongoUri(): string {
    return this.configService.get<string>('MONGO_URI');
  }

  getPort(): string {
    return this.configService.get<string>('PORT', '3000'); // Default to 3000 if PORT is not set
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  getAwsCredentials(): {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  } {
    return {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    };
  }
}
