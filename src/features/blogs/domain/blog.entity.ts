import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlogInputModel } from '../models/blog-input.model';

interface IUpdateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    BlogModel: BlogModelType,
    blogInputDto: BlogInputModel,
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

  updateBlog(updateBlogDTO: IUpdateBlogDTO): void {
    this.name = updateBlogDTO.name;
    this.description = updateBlogDTO.description;
    this.websiteUrl = updateBlogDTO.websiteUrl;
  }

  static createBlog(
    BlogModel: BlogModelType,
    blogInputDTO: BlogInputModel,
  ): BlogDocument {
    const blog = {
      name: blogInputDTO.name,
      description: blogInputDTO.description,
      websiteUrl: blogInputDTO.websiteUrl,
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
