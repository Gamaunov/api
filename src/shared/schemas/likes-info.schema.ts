import { Prop, Schema } from '@nestjs/mongoose';

import { UsersLikesSchema } from './users-likes.schema';

@Schema()
export class LikesInfoSchema {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  @Prop({ default: [] })
  users: [UsersLikesSchema];
}
