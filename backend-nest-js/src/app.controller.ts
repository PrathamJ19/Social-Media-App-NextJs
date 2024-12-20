import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('port')
  getPort(): string {
    return this.appService.getPort(); // Use the AppService to get the port
  }

  @Get('mongo-uri')
  getMongoUri(): string {
    return this.appService.getMongoUri();
  }
}
