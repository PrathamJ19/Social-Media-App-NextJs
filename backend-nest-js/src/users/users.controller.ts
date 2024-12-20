import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/signup')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async signup(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: any,
  ) {
    return this.usersService.create(createUserDto, file);
  }

  @Post('auth/login')
  async login(@Body() authDto: AuthDto) {
    return this.usersService.login(authDto);
  }

  @Get('profile/:username')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Param('username') username: string) {
    return this.usersService.getProfile(username);
  }

  @Get('is-following/:username')
  @UseGuards(AuthGuard('jwt'))
  async isFollowing(@Param('username') username: string, @Req() req: any) {
    return this.usersService.isFollowing(username, req.user.id);
  }

  @Post('follow/:username')
  @UseGuards(AuthGuard('jwt'))
  async follow(@Param('username') username: string, @Req() req: any) {
    return this.usersService.follow(username, req.user.id);
  }

  @Post('unfollow/:username')
  @UseGuards(AuthGuard('jwt'))
  async unfollow(@Param('username') username: string, @Req() req: any) {
    return this.usersService.unfollow(username, req.user.id);
  }

  @Get('following/:username')
  @UseGuards(AuthGuard('jwt'))
  async getFollowing(@Param('username') username: string) {
    return this.usersService.getFollowing(username);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() req: any) {
    return this.usersService.getUserById(req.user.id);
  }
}
