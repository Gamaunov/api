import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlogInputDTO } from '../dto/blog-input.dto';

interface IUpdateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    createBlogDTO: BlogInputDTO,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

export type BlogModelType = Model<Blog> & BlogModelStaticType;

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
    createBlogDto: BlogInputDTO,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const blog = {
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
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
