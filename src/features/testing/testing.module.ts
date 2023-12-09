import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from '../blogs/domain/blog.entity';
import { Post, PostSchema } from '../posts/domain/post.entity';
import { Comment, CommentSchema } from '../comments/domain/comment.entity';
import { User, UserSchema } from '../users/domain/user.entity';
import { Device, DeviceSchema } from '../devices/domain/device.entity';

import { TestingController } from './testing.controller';

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
  controllers: [TestingController],
})
export class TestingModule {}
