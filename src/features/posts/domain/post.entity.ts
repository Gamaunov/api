import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlogDocument } from '../../blogs/domain/blog.entity';
import { LikesInfoSchema } from '../../likes/schemas/likes-info.schema';
import { PostInputModel } from '../models/post-input.model';

interface IUpdatePostModel {
  title: string;
  shortDescription: string;
  content: string;
}

export type PostDocument = HydratedDocument<Post>;
export type PostLeanType = Post & { _id: Types.ObjectId };

export type PostModelStaticType = {
  createPost: (
    PostModel: PostModelType,
    postInputModel: PostInputModel,
    blog: BlogDocument,
  ) => PostDocument;
};

export type PostModelType = Model<Post> & PostModelStaticType;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updatePost(updatePostModel: IUpdatePostModel): void {
    this.title = updatePostModel.title;
    this.shortDescription = updatePostModel.shortDescription;
    this.content = updatePostModel.content;
  }

  static createPost(
    PostModel: PostModelType,
    postInputModel: PostInputModel,
    blog: BlogDocument,
  ): PostDocument {
    const post = {
      title: postInputModel.title,
      shortDescription: postInputModel.shortDescription,
      content: postInputModel.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new PostModel(post);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};

const postStaticMethods: PostModelStaticType = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;
