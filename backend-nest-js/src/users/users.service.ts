import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto, file: any): Promise<any> {
    const { username, email, password, confirmPassword } = createUserDto;
    if (password !== confirmPassword) throw new Error('Passwords do not match');

    let profilePicture =
      'https://faizawsbucket.s3.amazonaws.com/default-profile-pic.jpg';
    if (file) {
      profilePicture = file.location;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      profilePicture,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '1d',
      },
    );

    return { username: newUser.username, token };
  }

  async login(authDto: AuthDto): Promise<any> {
    const { email, password } = authDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid password');

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '1d',
      },
    );

    return { message: 'Login successful', username: user.username, token };
  }

  async getProfile(username: string): Promise<any> {
    const user = await this.userModel
      .findOne({ username })
      .populate('followers following', 'username');
    if (!user) throw new Error('User not found');

    return {
      username: user.username,
      profilePicture: user.profilePicture,
      followers: user.followers.length,
      following: user.following.length,
    };
  }

  async follow(username: string, currentUserId: string): Promise<any> {
    const userToFollow = await this.userModel.findOne({ username });
    if (!userToFollow) throw new Error('User not found');

    if (userToFollow.followers.includes(currentUserId)) {
      throw new Error('You are already following this user');
    }

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    const currentUser = await this.userModel.findById(currentUserId);
    currentUser.following.push(userToFollow._id.toString());
    await currentUser.save();

    return { message: 'Now following user' };
  }

  async unfollow(username: string, currentUserId: string): Promise<any> {
    const userToUnfollow = await this.userModel.findOne({ username });
    if (!userToUnfollow) throw new Error('User not found');

    if (!userToUnfollow.followers.includes(currentUserId)) {
      throw new Error('You are not following this user');
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== currentUserId,
    );
    await userToUnfollow.save();

    const currentUser = await this.userModel.findById(currentUserId);
    currentUser.following = currentUser.following.filter(
      (following) => following.toString() !== userToUnfollow._id.toString(),
    );
    await currentUser.save();

    return { message: 'Unfollowed user' };
  }

  async getFollowing(username: string): Promise<any> {
    const currentUser = await this.userModel
      .findOne({ username })
      .populate('following');
    if (!currentUser) throw new Error('User not found');

    return currentUser.following.slice(0, 10);
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) throw new Error('User not found');
    return { username: user.username };
  }

  async isFollowing(username: string, currentUserId: string): Promise<any> {
    const userToCheck = await this.userModel.findOne({ username });
    if (!userToCheck) throw new Error('User not found');

    const isFollowing = userToCheck.followers.includes(currentUserId);
    return { isFollowing };
  }
}
