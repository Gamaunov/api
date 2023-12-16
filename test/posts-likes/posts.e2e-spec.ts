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
import { likeStatus_uri } from '../base/utils/constants/likes.constant';
import { exceptionObject } from '../base/utils/dto/dto';
import { LikeStatus } from '../../src/base/enums/like-status.enum';

describe('posts-likes', () => {
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

  let userId;

  let postId_1;
  let postId_2;
  let postId_3;
  let postId_4;
  let postId_5;
  let postId_6;

  let accessTokenUser1;
  let accessTokenUser2;
  let accessTokenUser3;
  let accessTokenUser4;

  describe('Users creation and authentication', () => {
    it(`should create four users`, async () => {
      const user = await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(201);

      userId = user.body.id;

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

  describe('Create blog & 6 posts', () => {
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

    it(`should create 6 posts`, async () => {
      let i = 0;
      while (i < 6) {
        await agent
          .post(blogs_uri + blogId + posts_uri)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            title: postTitle,
            shortDescription: postShortDescription,
            content: postContent,
          })
          .expect(201);
        i++;
      }

      const posts = await agent.get(posts_uri).expect(200);

      postId_1 = posts.body.items[0].id;
      postId_2 = posts.body.items[1].id;
      postId_3 = posts.body.items[2].id;
      postId_4 = posts.body.items[3].id;
      postId_5 = posts.body.items[4].id;
      postId_6 = posts.body.items[5].id;
    });
  });

  describe('Likes operations', () => {
    it(`should return 400 with incorrect like status`, async () => {
      const response = await agent
        .put(posts_uri + postId_1 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject('likeStatus'));
    });

    it(`should return 401 with incorrect accessToken`, async () => {
      return agent
        .put(posts_uri + postId_1 + likeStatus_uri)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(401);
    });

    it('should like post 1 by user1', async () => {
      return agent
        .put(posts_uri + postId_1 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 1 by user2', async () => {
      return agent
        .put(posts_uri + postId_1 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 2 by user 2', async () => {
      return agent
        .put(posts_uri + postId_2 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 2 by user3', async () => {
      return agent
        .put(posts_uri + postId_2 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike post 3 by user1', async () => {
      return agent
        .put(posts_uri + postId_3 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user1', async () => {
      return agent
        .put(posts_uri + postId_4 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user4', async () => {
      return agent
        .put(posts_uri + postId_4 + likeStatus_uri)
        .auth(accessTokenUser4, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user2', async () => {
      return agent
        .put(posts_uri + postId_4 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user3', async () => {
      return agent
        .put(posts_uri + postId_4 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 5 by user2', async () => {
      return agent
        .put(posts_uri + postId_5 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike post 5 by user3', async () => {
      return agent
        .put(posts_uri + postId_5 + likeStatus_uri)
        .auth(accessTokenUser3, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should like post 6 by user1', async () => {
      return agent
        .put(posts_uri + postId_6 + likeStatus_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike post 6 by user2', async () => {
      return agent
        .put(posts_uri + postId_6 + likeStatus_uri)
        .auth(accessTokenUser2, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should return likesCount', async () => {
      const posts = await agent
        .get(posts_uri)
        .auth(accessTokenUser1, { type: 'bearer' })
        .expect(200);

      // post 1
      expect(posts.body.items[0].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[0].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[0].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      expect(posts.body.items[0].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin02,
      );
      expect(posts.body.items[0].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin01,
      );

      // post 2
      expect(posts.body.items[1].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[1].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[1].extendedLikesInfo.myStatus).toBe(
        LikeStatus.NONE,
      );

      expect(posts.body.items[1].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin03,
      );
      expect(posts.body.items[1].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin02,
      );

      // post 3
      expect(posts.body.items[2].extendedLikesInfo.likesCount).toBe(0);
      expect(posts.body.items[2].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.DISLIKE,
      );

      expect(posts.body.items[2].extendedLikesInfo.newestLikes).toHaveLength(0);

      // post 4
      expect(posts.body.items[3].extendedLikesInfo.likesCount).toBe(4);
      expect(posts.body.items[3].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.DISLIKE,
      );

      expect(posts.body.items[3].extendedLikesInfo.newestLikes).toHaveLength(3);
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin03,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin02,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[2].login).toBe(
        userLogin04,
      );

      // post 5
      expect(posts.body.items[4].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[4].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[4].extendedLikesInfo.myStatus).toBe(
        LikeStatus.NONE,
      );

      expect(posts.body.items[4].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin02,
      );

      // post 6
      expect(posts.body.items[5].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[5].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[5].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      expect(posts.body.items[5].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin01,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
