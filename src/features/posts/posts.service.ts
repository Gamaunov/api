import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BlogsRepository } from '../blogs/blogs.repository';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentInputDTO } from '../comments/dto/comment-input.dto';
import { UsersRepository } from '../users/users.repository';
import { ResultCode } from '../../shared/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../shared/constants/constants';

import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { PostInputDTO } from './dto/post-input.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createPost(
    createPostDTO: PostInputDTO,
    blogIdParam?: string,
  ): Promise<string | null> {
    const blogId = createPostDTO.blogId || blogIdParam;

    const blog = await this.blogsRepository.findBlogById(blogId);

    if (!blog) {
      return null;
    }

    const post = this.PostModel.createPost(createPostDTO, this.PostModel, blog);

    await this.postsRepository.save(post);

    return post.id;
  }

  async updatePost(id: string, postInputDTO: PostInputDTO) {
    const post = await this.postsRepository.findPostById(id);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const blog = await this.blogsRepository.findBlogById(postInputDTO.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    await post.updatePost(postInputDTO);
    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  async createComment(
    currentUserId: string,
    postId: string,
    commentInputDTO: CommentInputDTO,
  ): Promise<string | null> {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      return null;
    }

    const user = await this.usersRepository.findUserById(currentUserId);

    const comment = this.CommentModel.createComment(
      commentInputDTO,
      this.CommentModel,
      post,
      user,
    );
    await this.commentsRepository.save(comment);
    return comment.id;
  }

  async deletePostById(id: string): Promise<boolean> {
    const post = await this.postsRepository.findPostById(id);

    if (!post) {
      throw new InternalServerErrorException(postNotFound);
    }

    return this.postsRepository.deletePostById(id);
  }

  async deleteAllPosts(): Promise<boolean> {
    return this.postsRepository.deleteAllPosts();
  }
}
