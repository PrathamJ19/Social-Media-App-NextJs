// src/posts/posts.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 3)) // Assuming you handle images upload with a FilesInterceptor
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('userId') userId: string,
  ) {
    return this.postsService.create(createPostDto, userId, files);
  }

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':postId')
  async findOne(@Param('postId') postId: string) {
    return this.postsService.findOne(postId);
  }

  @Put(':postId')
  @UseInterceptors(FilesInterceptor('images', 3))
  async update(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('removedImages') removedImages: string[],
    @Query('userId') userId: string,
  ) {
    return this.postsService.update(
      postId,
      updatePostDto,
      userId,
      files,
      removedImages,
    );
  }

  @Delete(':postId')
  async delete(
    @Param('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.postsService.delete(postId, userId);
  }

  @Post('like/:postId')
  async like(@Param('postId') postId: string, @Query('userId') userId: string) {
    return this.postsService.like(postId, userId);
  }

  @Post('unlike/:postId')
  async unlike(
    @Param('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.postsService.unlike(postId, userId);
  }

  @Post(':postId/comments')
  async addComment(
    @Param('postId') postId: string,
    @Body('content') content: string,
    @Query('userId') userId: string,
  ) {
    return this.postsService.addComment(postId, userId, content);
  }
}
