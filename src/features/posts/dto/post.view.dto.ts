class likes {
  addedAt: string;
  userId: string;
  login: string;
}

export class PostViewDTO {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: likes[];
  };
}
