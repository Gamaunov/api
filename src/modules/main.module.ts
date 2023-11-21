import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from '../features/blogs/schemas/blog.entity';
import { BlogsController } from '../features/blogs/blogs.controller';
import { BlogsService } from '../features/blogs/blogs.service';
import { Post, PostSchema } from '../features/posts/schemas/post.entity';
import {
  Comment,
  CommentSchema,
} from '../features/comments/schemas/comment.entity';
import { User, UserSchema } from '../features/users/schemas/user.entity';
import { PostsController } from '../features/posts/post.controller';
import { UsersController } from '../features/users/users.controller';
import { BlogsRepository } from '../features/blogs/blogs.repository';
import { BlogsQueryRepository } from '../features/blogs/blogs.query.repository';
import { PostsService } from '../features/posts/posts.service';
import { PostsRepository } from '../features/posts/posts.repository';
import { PostsQueryRepository } from '../features/posts/posts.query.repository';
import { CommentsService } from '../features/comments/comments.service';
import { CommentsRepository } from '../features/comments/comments.repository';
import { CommentsQueryRepository } from '../features/comments/comments.query.repository';
import { UsersService } from '../features/users/users.service';
import { UsersRepository } from '../features/users/users.repository';
import { UsersQueryRepository } from '../features/users/users.query.repository';
import { CommentsController } from '../features/comments/comments.controller';
import { TestingController } from '../features/testing/testing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    TestingController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
})
export class MainModule {}
