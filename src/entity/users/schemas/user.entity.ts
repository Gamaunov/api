import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CreateUserDTO } from '../dto/create-user.dto';

import { UserAccountSchema } from './user-account.schema';
import { UserEmailSchema } from './user-email.schema';
import { UserPasswordSchema } from './user-password.schema';

export type UserDocument = HydratedDocument<User>;

export type UserModelStaticType = {
  createUser: (
    createUserDTO: CreateUserDTO,
    UserModel: UserModelType,
    hash: string,
  ) => UserDocument;
};

export type UserModelType = Model<User> & UserModelStaticType;

@Schema()
export class User {
  @Prop({ required: true })
  accountData: UserAccountSchema;

  @Prop({ required: true })
  emailConfirmation: UserEmailSchema;

  @Prop({ required: true })
  passwordRecovery: UserPasswordSchema;

  static createUser(
    createUserDTO: CreateUserDTO,
    UserModel: UserModelType,
    hash: string,
  ): UserDocument {
    const user = {
      accountData: {
        login: createUserDTO.login,
        passwordHash: hash,
        email: createUserDTO.email,
        createdAt: new Date(),
        isMembership: false,
      },
      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      },
    };
    return new UserModel(user);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = userStaticMethods;
