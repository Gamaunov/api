import { Injectable, NestMiddleware } from '@nestjs/common';

import { UsersRepository } from '../../features/users/infrastructure/users.repository';

@Injectable()
export class CheckLoginAndEmail implements NestMiddleware {
  constructor(private readonly usersRepository: UsersRepository) {}
  async use(req, res, next): Promise<void> {
    const login = await this.usersRepository.findUserByLoginOrEmail(
      req.body.login,
    );
    const email = await this.usersRepository.findUserByLoginOrEmail(
      req.body.email,
    );
    if (login) {
      const message = {
        errorsMessages: [
          {
            message: 'login already exist',
            field: 'login',
          },
        ],
      };

      return res.status(400).send(message);
    }

    if (email) {
      const message = {
        errorsMessages: [
          {
            message: 'email already exist',
            field: 'email',
          },
        ],
      };

      return res.status(400).send(message);
    }

    return next();
  }
}
