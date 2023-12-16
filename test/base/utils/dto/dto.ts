import { userEmail01, userLogin01 } from '../constants/users.constants';
import {
  blogDescription,
  blogName01,
  blogName02,
  updatedBlogDescription,
  updatedBlogName,
} from '../constants/blogs.constant';
import { someSiteURl, updatedSomeSiteURl } from '../constants/auth.constants';
import {
  postContent,
  postShortDescription,
  postTitle,
  updatedContent,
  updatedDescription,
  updatedTitle,
} from '../constants/posts.constants';

export const userProfileResponse = {
  email: userEmail01,
  login: userLogin01,
  userId: expect.any(String),
};

export const deviceResponse = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.any(String),
  deviceId: expect.any(String),
};

export const blogDto1 = {
  id: expect.any(String),
  name: blogName01,
  description: blogDescription,
  websiteUrl: someSiteURl,
  createdAt: expect.any(String),
  isMembership: false,
};

export const blogDto2 = {
  id: expect.any(String),
  name: blogName02,
  description: blogDescription,
  websiteUrl: someSiteURl,
  createdAt: expect.any(String),
  isMembership: false,
};

export const saBlogDto = {
  id: expect.any(String),
  name: blogName01,
  description: blogDescription,
  websiteUrl: someSiteURl,
  createdAt: expect.any(String),
  isMembership: false,
  blogOwnerInfo: {
    userId: expect.any(String),
    userLogin: expect.any(String),
  },
};

export const updatedBlogDto = {
  id: expect.any(String),
  name: updatedBlogName,
  description: updatedBlogDescription,
  websiteUrl: updatedSomeSiteURl,
  createdAt: expect.any(String),
  isMembership: false,
};

export const postDto = {
  id: expect.any(String),
  title: postTitle,
  shortDescription: postShortDescription,
  content: postContent,
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
    newestLikes: [],
  },
};

export const updatedPostDto = {
  id: expect.any(String),
  title: updatedTitle,
  shortDescription: updatedDescription,
  content: updatedContent,
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
    newestLikes: [],
  },
};

export const exceptionObject = (field: string) => {
  return {
    errorsMessages: [
      {
        message: expect.any(String),
        field: field,
      },
    ],
  };
};
