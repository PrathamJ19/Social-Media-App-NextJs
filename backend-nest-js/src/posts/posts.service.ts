// src/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    files: Express.Multer.File[],
  ) {
    const post = new this.postModel({
      ...createPostDto,
      author: userId,
      images: files.map((file) => file.path),
    });

    return post.save();
  }

  async findAll() {
    return this.postModel
      .find()
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(postId: string) {
    return this.postModel
      .findById(postId)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username')
      .exec();
  }

  async update(
    postId: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    files: Express.Multer.File[],
    removedImages: string[],
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Unauthorized');

    post.content = updatePostDto.content || post.content;
    post.images = [
      ...post.images.filter((image) => !removedImages.includes(image)),
      ...files.map((file) => file.path),
    ];

    return post.save();
  }

  async delete(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Unauthorized');

    await this.postModel.findByIdAndDelete(postId);
  }

  async like(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new Error('Post not found');
    if (post.likes.includes(userId)) throw new Error('Already liked');

    post.likes.push(userId);
    return post.save();
  }

  async unlike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new Error('Post not found');
    if (!post.likes.includes(userId)) throw new Error('Not liked yet');

    post.likes = post.likes.filter((like) => like !== userId);
    return post.save();
  }

  async addComment(postId: string, userId: string, content: string) {
    // Find the post by its ID
    const post = await this.postModel.findById(postId);

    // If the post doesn't exist, throw an error
    if (!post) throw new Error('Post not found');

    // Create the new comment
    const comment = {
      author: userId, // Use the user ID here as ObjectId reference to User
      content,
      createdAt: new Date(),
    };

    // Push the new comment into the post's comments array
    post.comments.push(comment);

    // Save the updated post with the new comment
    await post.save();

    // Return the most recently added comment
    return post.comments[post.comments.length - 1];
  }
}
