import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlogInputModel } from '../models/blog-input.model';

interface IUpdateBlogModel {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    BlogModel: BlogModelType,
    blogInputModel: BlogInputModel,
  ) => BlogDocument;
};

export type BlogModelType = Model<Blog> & BlogModelStaticType;
export type BlogLeanType = Blog & { _id: Types.ObjectId };

@Schema()
export class Blog {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  isMembership: boolean;

  updateBlog(updateBlogModel: IUpdateBlogModel): void {
    this.name = updateBlogModel.name;
    this.description = updateBlogModel.description;
    this.websiteUrl = updateBlogModel.websiteUrl;
  }

  static createBlog(
    BlogModel: BlogModelType,
    blogInputModel: BlogInputModel,
  ): BlogDocument {
    const blog = {
      name: blogInputModel.name,
      description: blogInputModel.description,
      websiteUrl: blogInputModel.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    return new BlogModel(blog);
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
