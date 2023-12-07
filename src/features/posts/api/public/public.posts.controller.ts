import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query.repository';
import { QueryDTO } from '../../../../shared/dto/query.dto';
import {
  postIDField,
  postNotFound,
} from '../../../../shared/constants/constants';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { CommentInputDTO } from '../../../comments/dto/comment-input.dto';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { CommentCreateCommand } from '../../../comments/api/public/application/use-cases/comment-create.use-case';
import { LikeStatusInputDTO } from '../../../likes/dto/like-status-input.dto';
import { LikeUpdateForPostCommand } from '../../../likes/api/public/application/use-cases/like-update-for-post-use.case';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post as ClassPost, PostModelType } from '../../post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { PostUpdateCommand } from '../blogger/application/use-cases/post-update.use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { PostInputDTO } from '../../dto/post-input.dto';
import { PostCreateCommand } from '../blogger/application/use-cases/post-create.use-case';

@Controller('posts')
export class PublicPostsController {
  constructor(
    @InjectModel(ClassPost.name)
    private PostModel: PostModelType,
    private readonly blogsRepository: BlogsRepository,
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(
    @Query() query: QueryDTO,
    @UserIdFromHeaders() userId: string,
  ) {
    return this.postsQueryRepository.findPosts(query, userId);
  }

  @Get(':id')
  async findPost(
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.postsQueryRepository.findPostById(postId, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Get(':id/comments')
  async findComments(
    @Query() query: QueryDTO,
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.commentsQueryRepository.findComments(
      query,
      postId,
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(@Body() postInputDto: PostInputDTO) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputDto, postInputDto.blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPostById(result.response);
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/comments')
  @HttpCode(201)
  async createComment(
    @Body() commentInputDTO: CommentInputDTO,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const commentId = await this.commandBus.execute(
      new CommentCreateCommand(commentInputDTO, postId, userId),
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findCommentById(commentId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Body() postInputDTO: PostInputDTO,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const command = new PostUpdateCommand(
      postInputDTO,
      postInputDTO.blogId,
      postId,
      userId,
    );
    const result = await this.commandBus.execute(command);

    if (!result.data) {
      return exceptionHandler(result.code, result.message, result.field);
    }
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputDTO: LikeStatusInputDTO,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForPostCommand(likeStatusInputDTO, postId, userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') postId: string) {
    const post = await this.postsQueryRepository.findPostById(postId);

    if (!post) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    await this.postsRepository.deletePostById(postId);
  }
}
