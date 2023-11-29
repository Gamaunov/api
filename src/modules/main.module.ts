import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { Blog, BlogSchema } from '@/features/blogs/schemas/blog.entity';
import { Post, PostSchema } from '@/features/posts/schemas/post.entity';
import {
  Comment,
  CommentSchema,
} from '@/features/comments/schemas/comment.entity';
import { User, UserSchema } from '@/features/users/schemas/user.entity';
import { Device, DeviceSchema } from '@/features/devices/schemas/device.entity';
import { TokenParserMiddleware } from '@/shared/middlewares/token-parser.middleware';
import { BlogsController } from '@/features/blogs/blogs.controller';
import { PostsController } from '@/features/posts/posts.controller';
import { CommentsController } from '@/features/comments/comments.controller';
import { BlogsService } from '@/features/blogs/blogs.service';
import { BlogsRepository } from '@/features/blogs/blogs.repository';
import { BlogsQueryRepository } from '@/features/blogs/blogs.query.repository';
import { PostsService } from '@/features/posts/posts.service';
import { PostsRepository } from '@/features/posts/posts.repository';
import { PostsQueryRepository } from '@/features/posts/posts.query.repository';
import { CommentsService } from '@/features/comments/comments.service';
import { CommentsRepository } from '@/features/comments/comments.repository';
import { CommentsQueryRepository } from '@/features/comments/comments.query.repository';
import { UsersRepository } from '@/features/users/users.repository';
import { LikesService } from '@/features/likes/likes.service';
import { LikesRepository } from '@/features/likes/likes.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
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
    UsersRepository,
    LikesService,
    LikesRepository,
    JwtService,
  ],
  exports: [
    BlogsService,
    PostsService,
    BlogsQueryRepository,
    PostsQueryRepository,
  ],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenParserMiddleware)
      .forRoutes(
        { path: 'blogs/:id/posts', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.GET },
        { path: 'posts/:id/comments', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
      );
  }
}
