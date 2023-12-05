import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlogInputDto } from './dto/blog-input.dto';

interface IUpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    BlogModel: BlogModelType,
    blogInputDto: BlogInputDto,
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

  updateBlog(iUpdateBlogDto: IUpdateBlogDto): void {
    this.name = iUpdateBlogDto.name;
    this.description = iUpdateBlogDto.description;
    this.websiteUrl = iUpdateBlogDto.websiteUrl;
  }

  static createBlog(
    BlogModel: BlogModelType,
    blogInputDto: BlogInputDto,
  ): BlogDocument {
    const blog = {
      name: blogInputDto.name,
      description: blogInputDto.description,
      websiteUrl: blogInputDto.websiteUrl,
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
