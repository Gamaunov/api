import { Controller, Delete, HttpCode } from '@nestjs/common';

import { CommentsService } from '../comments/comments.service';
import { BlogsService } from '../blogs/blogs.service';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogsService.deleteAllBlogs();
    await this.postsService.deleteAllPosts();
    await this.commentsService.deleteAllComments();
    await this.usersService.deleteAllUsers();
  }
}
