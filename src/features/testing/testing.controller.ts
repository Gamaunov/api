import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Blog, BlogModelType } from '../blogs/domain/blog.entity';
import { Post, PostModelType } from '../posts/domain/post.entity';
import { Comment, CommentModelType } from '../comments/domain/comment.entity';
import { User, UserModelType } from '../users/domain/user.entity';
import { Device, DeviceModelType } from '../devices/domain/device.entity';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}

  @Delete('all-data')
  @ApiOperation({
    summary: 'Clear database: delete all data from all tables/collections',
  })
  @HttpCode(204)
  async deleteAll() {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.UserModel.deleteMany();
    await this.DeviceModel.deleteMany();
  }
}
