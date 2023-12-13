import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import process from 'process';
import cookieParser from 'cookie-parser';

import { AppModule } from '../../src/app.module';
import { customExceptionFactory } from '../../src/infrastructure/exception-filters/exception.factory';
import { HttpExceptionFilter } from '../../src/infrastructure/exception-filters/exception.filter';
import { testing_allData_uri } from '../utils/constants/testing.constants';
import {
  userEmail01,
  userEmail02,
  userLogin01,
  userLogin02,
  userPassword,
  users_uri,
} from '../utils/constants/users.constants';
import {
  auth_login_uri,
  basicAuthLogin,
  basicAuthPassword,
  someSiteURl,
  updatedSomeSiteURl,
} from '../utils/constants/auth.constants';
import {
  blogDescription,
  blogName01,
  blogs_uri,
  updatedBlogDescription,
  updatedBlogName,
} from '../utils/constants/blogs.constant';
import {
  postContent,
  posts_uri,
  postShortDescription,
  postTitle,
  updatedContent,
  updatedDescription,
  updatedTitle,
} from '../utils/constants/posts.constants';
import { exceptionObject, postDto, updatedPostDto } from '../utils/dto/dto';
import {
  lorem1000,
  lorem1001,
  lorem15,
  lorem20,
  lorem50,
} from '../utils/constants/constants';

describe('Blogger blogs and posts testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_TEST_URI || ''),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: customExceptionFactory,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    agent = supertest.agent(app.getHttpServer());

    await agent.delete(testing_allData_uri);
  });

  let blogId01;
  let blogId02;

  let postId;

  let accessTokenUser01;
  let accessTokenUser02;

  describe('Creating users & authentication', () => {
    it(`should create 2 users`, async () => {
      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(201);

      return agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin02,
          password: userPassword,
          email: userEmail02,
        })
        .expect(201);
    });

    it(`should login user 1`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: userPassword,
        })
        .expect(200);
      accessTokenUser01 = response.body.accessToken;
    });

    it(`should login user 2`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin02,
          password: userPassword,
        })
        .expect(200);
      accessTokenUser02 = response.body.accessToken;
    });
  });

  describe('Create blog', () => {
    it(`should return 400 without name`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('name'));
    });

    it(`should return 400 with incorrect name`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: 123, //should be string
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('name'));
    });

    it(`should return 400 with incorrect name`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem20, //maxLength: 15
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('name'));
    });

    it(`should return 400 without description`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('description'));
    });

    it(`should return 400 with incorrect description`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: NaN, //should be string
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('description'));
    });

    it(`should return 400 with incorrect description`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: lorem1000, //maxLength: 500
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('description'));
    });

    it(`should return 400 without websiteUrl`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('websiteUrl'));
    });

    it(`should return 400 with incorrect websiteUrl `, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: '.com', // should be correct url
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('websiteUrl'));
    });

    it(`should return 400 with incorrect websiteUrl`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: lorem15, // should be correct url
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('websiteUrl'));
    });

    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .post(blogs_uri)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(401);
    });

    it(`should create new blog`, async () => {
      const response = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(201);

      blogId01 = response.body.id;
    });

    // it(`should create new blog by user 1`, async () => {
    //   return agent
    //     .post(blogs_uri)
    //     .auth(accessTokenUser01, { type: 'bearer' })
    //     .send({
    //       name: blogName01,
    //       description: blogDescription,
    //       websiteUrl: someSiteURl,
    //     })
    //     .expect(201);
    // });

    // it(`should create new blog by user 2`, async () => {
    //   return agent
    //     .post(blogs_uri)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .send({
    //       name: blogName02,
    //       description: blogDescription,
    //       websiteUrl: someSiteURl,
    //     })
    //     .expect(201);
    // });
  });

  describe('Find, Get blogs', () => {
    // it(`should return 401 with incorrect accessToken`, async () => {
    //   return agent
    //     .get(blogs_uri)
    //     .auth(randomUUID(), { type: 'bearer' })
    //     .expect(401);
    // });
    // it(`should return requested blog`, async () => {
    //   const blogs = await agent
    //     .get(blogs_uri)
    //     .auth(accessTokenUser01, { type: 'bearer' })
    //     .expect(200);
    //
    //   blogId01 = blogs.body.items[0].id;
    //
    //   expect(blogs.body).toEqual({
    //     pagesCount: 1,
    //     page: 1,
    //     pageSize: 10,
    //     totalCount: 1,
    //     items: [blogDto1],
    //   });
    // });
    // it(`should return requested blog`, async () => {
    //   const blogs = await agent
    //     .get(blogs_uri)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .expect(200);
    //
    //   blogId02 = blogs.body.items[0].id;
    //
    //   expect(blogs.body).toEqual({
    //     pagesCount: 1,
    //     page: 1,
    //     pageSize: 10,
    //     totalCount: 1,
    //     items: [blogDto2],
    //   });
    // });
  });

  describe('Update blog', () => {
    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .put(blogs_uri + blogId01)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          name: updatedBlogName,
          description: updatedBlogDescription,
          websiteUrl: updatedSomeSiteURl,
        })
        .expect(401);
    });

    // it(`should return 403 when trying to update another user's blog`, async () => {
    //   await agent
    //     .put(blogs_uri + blogId01)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .send({
    //       name: updatedBlogName,
    //       description: updatedBlogDescription,
    //       websiteUrl: updatedSomeSiteURl,
    //     })
    //     .expect(403);
    // });

    it(`should return 404 when trying to update a non-existent blog`, async () => {
      await agent
        .put(blogs_uri + 'some-path')
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: updatedBlogName,
          description: updatedBlogDescription,
          websiteUrl: updatedSomeSiteURl,
        })
        .expect(404);
    });

    it(`should update blog by id`, async () => {
      await agent
        .put(blogs_uri + blogId01)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: updatedBlogName,
          description: updatedBlogDescription,
          websiteUrl: updatedSomeSiteURl,
        })
        .expect(204);

      // const check = await agent.get(blogs_uri + blogId01).expect(200);
      // expect(check.body).toEqual(updatedBlogDto);
    });
  });

  describe('Create post', () => {
    it(`should return 400 without title`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('title'));
    });

    it(`should return 400 with incorrect title`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: true, //should be string
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('title'));
    });

    it(`should return 400 with incorrect title`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem50, //maxLength: 30
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('title'));
    });

    it(`should return 400 without shortDescription`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('shortDescription'));
    });

    it(`should return 400 with incorrect shortDescription`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: true, //should be string
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('shortDescription'));
    });

    it(`should return 400 with incorrect shortDescription`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: lorem1000, //maxLength: 100
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('shortDescription'));
    });

    it(`should return 400 without content`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('content'));
    });

    it(`should return 400 incorrect content`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: NaN, //should be string
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('content'));
    });

    it(`should return 400 with incorrect content`, async () => {
      const response = await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: lorem1001, //maxLength: 1000
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('content'));
    });

    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(401);
    });

    // it(`should return 403 when trying to create a blog post on another user's blog`, async () => {
    //   await agent
    //     .post(blogs_uri + blogId01 + posts_uri)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .send({
    //       title: postTitle,
    //       shortDescription: postShortDescription,
    //       content: postContent,
    //     })
    //     .expect(403);
    // });

    it(`should return 404 when trying to create post of non-existent blog`, async () => {
      await agent
        .post(blogs_uri + 'some-path' + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(404);
    });

    it(`should create new post`, async () => {
      await agent
        .post(blogs_uri + blogId01 + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      const posts = await agent.get(posts_uri).expect(200);
      postId = posts.body.items[0].id;

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postDto],
      });
    });
  });

  describe('Update post', () => {
    // it(`should return 401 with incorrect accessToken`, async () => {
    //   return agent
    //     .put(blogs_uri + blogId01 + posts_uri + postId)
    //     .auth(randomUUID(), { type: 'bearer' })
    //     .send({
    //       title: updatedTitle,
    //       shortDescription: updatedDescription,
    //       content: updatedContent,
    //     })
    //     .expect(401);
    // });

    // it(`should return 403 when trying to update another user's blog post`, async () => {
    //   return agent
    //     .put(blogs_uri + blogId01 + posts_uri + postId)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .send({
    //       title: updatedTitle,
    //       shortDescription: updatedDescription,
    //       content: updatedContent,
    //     })
    //     .expect(403);
    // });

    it(`should return 404 when trying to update post of non-existent blog`, async () => {
      return agent
        .put(blogs_uri + 'some-path' + posts_uri + postId)
        .auth(accessTokenUser01, { type: 'bearer' })
        .send({
          title: updatedTitle,
          shortDescription: updatedDescription,
          content: updatedContent,
        })
        .expect(404);
    });

    it(`should return 404 when trying to update non-existent post`, async () => {
      return agent
        .put(blogs_uri + blogId01 + posts_uri + 'some-path')
        .auth(accessTokenUser01, { type: 'bearer' })
        .send({
          title: updatedTitle,
          shortDescription: updatedDescription,
          content: updatedContent,
        })
        .expect(404);
    });

    it(`should update post by id`, async () => {
      await agent
        .put(posts_uri + postId)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: updatedTitle,
          shortDescription: updatedDescription,
          content: updatedContent,
          blogId: blogId01,
        })
        .expect(204);

      const check = await agent.get(posts_uri + postId).expect(200);
      expect(check.body).toEqual(updatedPostDto);
    });
  });

  describe('Delete blog', () => {
    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .delete(blogs_uri + blogId01)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // it(`should return 403 when trying to delete another user's blog`, async () => {
    //   await agent
    //     .delete(blogs_uri + blogId01)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .expect(403);
    // });

    it(`should return 404 when trying to delete non-existent blog`, async () => {
      await agent
        .delete(blogs_uri + 'some-path')
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);
    });

    it(`should delete blog by id`, async () => {
      await agent
        .delete(blogs_uri + blogId01)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      await agent.get(blogs_uri + blogId01).expect(404);
    });
  });

  describe('Delete post', () => {
    // it(`should return 401 with incorrect accessToken`, async () => {
    //   return agent
    //     .delete(blogs_uri + blogId01 + posts_uri + postId)
    //     .auth(randomUUID(), { type: 'bearer' })
    //     .expect(401);
    // });

    // it(`should return 403 when trying to delete a post from another user's blog`, async () => {
    //   return agent
    //     .delete(blogs_uri + blogId01 + posts_uri + postId)
    //     .auth(accessTokenUser02, { type: 'bearer' })
    //     .expect(403);
    // });

    it(`should return 404 when trying to delete post of non-existent blog`, async () => {
      return agent
        .delete(blogs_uri + 'some-path' + posts_uri + postId)
        .auth(accessTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    it(`should return 404 when trying to delete non-existent post`, async () => {
      return agent
        .delete(blogs_uri + blogId01 + posts_uri + 'some-path')
        .auth(accessTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    it(`should delete post by id`, async () => {
      await agent
        .delete(posts_uri + postId)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      await agent.get(posts_uri + postId).expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
