import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import process from 'process';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';

import { AppModule } from '../../src/app.module';
import { customExceptionFactory } from '../../src/infrastructure/exception-filters/exception.factory';
import { HttpExceptionFilter } from '../../src/infrastructure/exception-filters/exception.filter';
import { testing_allData_uri } from '../base/utils/constants/testing.constants';
import {
  userEmail01,
  userEmail02,
  userEmail03,
  userEmail04,
  userLogin01,
  userLogin02,
  userLogin03,
  userLogin04,
  userPassword,
  users_uri,
} from '../base/utils/constants/users.constants';
import {
  auth_login_uri,
  basicAuthLogin,
  basicAuthPassword,
  someSiteURl,
} from '../base/utils/constants/auth.constants';
import {
  blogDescription,
  blogName01,
  blogs_uri,
} from '../base/utils/constants/blogs.constant';
import {
  postContent,
  posts_uri,
  postShortDescription,
  postTitle,
} from '../base/utils/constants/posts.constants';
import {
  commentContent,
  comments_uri,
} from '../base/utils/constants/comments.constant';
import { likeStatus_uri } from '../base/utils/constants/likes.constant';
import { exceptionObject } from '../base/utils/dto/dto';
import { LikeStatus } from '../../src/base/enums/like-status.enum';

describe('comments-likes', () => {
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

  let blogId;
  let postId;

  let commentId_1;
  let commentId_2;
  let commentId_3;
  let commentId_4;
  let commentId_5;
  let commentId_6;

  let accessTokenUser1;
  let accessTokenUser2;
  let accessTokenUser3;
  let accessTokenUser4;

  describe('Users creation and authentication', () => {
    it(`should create four users`, async () => {
      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(201);

      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin02,
          password: userPassword,
          email: userEmail02,
        })
        .expect(201);

      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin03,
          password: userPassword,
          email: userEmail03,
        })
        .expect(201);

      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin04,
          password: userPassword,
          email: userEmail04,
        })
        .expect(201);
    });

    it(`should login user1`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: userPassword,
        })
        .expect(200);

      accessTokenUser1 = response.body.accessToken;
    });

    it(`should login user2`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin02,
          password: userPassword,
        })
        .expect(200);

      accessTokenUser2 = response.body.accessToken;
    });

    it(`should login user3`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin03,
          password: userPassword,
        })
        .expect(200);

      accessTokenUser3 = response.body.accessToken;
    });

    it(`should login user4`, async () => {
      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin04,
          password: userPassword,
        })
        .expect(200);

      accessTokenUser4 = response.body.accessToken;
    });
  });

  describe('Create blog & posts & comments', () => {
    it(`should create blog`, async () => {
      const blog = await agent
        .post(blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(201);

      blogId = blog.body.id;
    });

    it(`should create post`, async () => {
      await agent
        .post(blogs_uri + blogId + posts_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      const posts = await agent.get(posts_uri).expect(200);

      postId = posts.body.items[0].id;
    });

    it(`should create 6 comments`, async () => {
      let i = 0;
      while (i < 6) {
        await agent
          .post(posts_uri + postId + comments_uri)
          .auth(accessTokenUser1, { type: 'bearer' })
          .send({
            content: commentContent,
          })
          .expect(201);
        i++;
      }

      const comments = await agent
        .get(posts_uri + postId + comments_uri)
        .expect(200);

      commentId_1 = comments.body.items[0].id;
      commentId_2 = comments.body.items[1].id;
      commentId_3 = comments.body.items[2].id;
      commentId_4 = comments.body.items[3].id;
      commentId_5 = comments.body.items[4].id;
      commentId_6 = comments.body.items[5].id;
    });
  });

  describe('Likes operations', () => {
    it(`should return 400 with incorrect like status`, async () => {
      const response = await agent
        .put(comments_uri + commentId_1 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('likeStatus'));
    });

    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .put(comments_uri + commentId_1 + likeStatus_uri)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(401);
    });

    it('should like comment 1 by user1', async () => {
      return agent
        .put(comments_uri + commentId_1 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 1 by user2', async () => {
      return agent
        .put(comments_uri + commentId_1 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 2 by user 2', async () => {
      return agent
        .put(comments_uri + commentId_2 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 2 by user3', async () => {
      return agent
        .put(comments_uri + commentId_2 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike comment 3 by user1', async () => {
      return agent
        .put(comments_uri + commentId_3 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should like comment 4 by user1', async () => {
      return agent
        .put(comments_uri + commentId_4 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 4 by user4', async () => {
      return agent
        .put(comments_uri + commentId_4 + likeStatus_uri)
        .auth(accessTokenUser4, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 4 by user2', async () => {
      return agent
        .put(comments_uri + commentId_4 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 4 by user3', async () => {
      return agent
        .put(comments_uri + commentId_4 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 5 by user2', async () => {
      return agent
        .put(comments_uri + commentId_5 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike comment 5 by user3', async () => {
      return agent
        .put(comments_uri + commentId_5 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should like comment 6 by user1', async () => {
      return agent
        .put(comments_uri + commentId_6 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike comment 6 by user2', async () => {
      return agent
        .put(comments_uri + commentId_6 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should return likesCount', async () => {
      const comments = await agent
        .get(posts_uri + postId + comments_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .expect(200);

      // Comment 01
      expect(comments.body.items[0].likesInfo.likesCount).toBe(2);
      expect(comments.body.items[0].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[0].likesInfo.myStatus).toBe(LikeStatus.LIKE);

      // Comment 02
      expect(comments.body.items[1].likesInfo.likesCount).toBe(2);
      expect(comments.body.items[1].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[1].likesInfo.myStatus).toBe(LikeStatus.NONE);

      // Comment 03
      expect(comments.body.items[2].likesInfo.likesCount).toBe(0);
      expect(comments.body.items[2].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[2].likesInfo.myStatus).toBe(
        LikeStatus.DISLIKE,
      );

      // Comment 04
      expect(comments.body.items[3].likesInfo.likesCount).toBe(4);
      expect(comments.body.items[3].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[2].likesInfo.myStatus).toBe(
        LikeStatus.DISLIKE,
      );

      // Comment 05
      expect(comments.body.items[4].likesInfo.likesCount).toBe(1);
      expect(comments.body.items[4].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[4].likesInfo.myStatus).toBe(LikeStatus.NONE);

      // Comment 06
      expect(comments.body.items[5].likesInfo.likesCount).toBe(1);
      expect(comments.body.items[5].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[5].likesInfo.myStatus).toBe(LikeStatus.LIKE);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
