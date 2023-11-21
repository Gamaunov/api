import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BlogsRepository } from '../blogs/blogs.repository';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { CreateCommentDTO } from '../comments/dto/create-comment.dto';
import { CommentView } from '../comments/schemas/comment.view';

import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostView } from './schemas/post.view';
import { UpdatePostDTO } from './dto/update-post.dto';

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
  ) {}

  async createPost(
    createPostDto: CreatePostDTO,
    blogId?: string,
  ): Promise<PostView> {
    let blog;

    if (blogId) {
      blog = await this.blogsRepository.findBlog(blogId);

      if (!blog) {
        throw new InternalServerErrorException('blog not found');
      }
    } else {
      blog = await this.postsRepository.findBlog(createPostDto.blogId);
      if (!blog) {
        throw new InternalServerErrorException('blog not found');
      }
    }

    const post = this.PostModel.createPost(createPostDto, this.PostModel, blog);
    return this.postsRepository.createPost(post);
  }

  async updatePost(id: string, updatePostDto: UpdatePostDTO): Promise<Post> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException('post not found');
    }

    await post.updatePost(updatePostDto);
    return this.postsRepository.save(post);
  }

  async createComment(
    id: string,
    createCommentDto: CreateCommentDTO,
  ): Promise<CommentView> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException('post not found');
    }

    const comment = this.CommentModel.createComment(
      createCommentDto,
      this.CommentModel,
      post,
    );
    return this.commentsRepository.createComment(comment);
  }

  async deletePost(id: string): Promise<boolean> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException('post not found');
    }

    return this.postsRepository.deletePost(id);
  }

  async deletePosts(): Promise<boolean> {
    return this.postsRepository.deletePosts();
  }
}
