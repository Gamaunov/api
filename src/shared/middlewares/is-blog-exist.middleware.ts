import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult, ValidationError } from 'express-validator';

import { BlogsQueryRepository } from '../../features/blogs/infrastructure/blogs.query.repository';

@Injectable()
export class IsBlogExistMiddleware implements NestMiddleware {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    await body('title')
      .notEmpty()
      .isString()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Invalid title')
      .run(req);

    await body('shortDescription')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid shortDescription')
      .run(req);

    await body('content')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Invalid content')
      .run(req);

    await body('blogId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid blogId')
      .custom(async (blogId: string) => {
        const blog = await this.blogsQueryRepository.findBlogById(blogId);

        if (!blog) {
          throw new Error('Blog not found');
        }
      })
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsMessages = errors
        .array({ onlyFirstError: true })
        .map((e) => this.errorsFormatter(e));

      const responseData = {
        errorsMessages: errorsMessages,
      };

      return res.status(400).json(responseData);
    }

    next();
  }

  private errorsFormatter(e: ValidationError) {
    switch (e.type) {
      case 'field':
        return {
          message: e.msg,
          field: e.path,
        };
      default:
        return {
          message: e.msg,
          field: 'None',
        };
    }
  }
}
