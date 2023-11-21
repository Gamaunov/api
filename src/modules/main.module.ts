import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from '../entity/blogs/schemas/blog.entity';
import { BlogsController } from '../entity/blogs/blogs.controller';
import { BlogsService } from '../entity/blogs/blogs.service';
import { Post, PostSchema } from '../entity/posts/schemas/post.entity';
import {
  Comment,
  CommentSchema,
} from '../entity/comments/schemas/comment.entity';
import { User, UserSchema } from '../entity/users/schemas/user.entity';
import { PostsController } from '../entity/posts/post.controller';
import { UsersController } from '../entity/users/users.controller';
import { BlogsRepository } from '../entity/blogs/blogs.repository';
import { BlogsQueryRepository } from '../entity/blogs/blogs.query.repository';
import { PostsService } from '../entity/posts/posts.service';
import { PostsRepository } from '../entity/posts/posts.repository';
import { PostsQueryRepository } from '../entity/posts/posts.query.repository';
import { CommentsService } from '../entity/comments/comments.service';
import { CommentsRepository } from '../entity/comments/comments.repository';
import { CommentsQueryRepository } from '../entity/comments/comments.query.repository';
import { UsersService } from '../entity/users/users.service';
import { UsersRepository } from '../entity/users/users.repository';
import { UsersQueryRepository } from '../entity/users/users.query.repository';
import { CommentsController } from '../entity/comments/comments.controller';

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
