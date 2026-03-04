import {DeleteUserCommand} from '@/apps/users/application/commands/delete-user/delete-user.command';
import {DeleteUserCommandHandler} from '@/apps/users/application/commands/delete-user/delete-user.command.handler';
// Commands
import {LoginCommand} from '@/apps/users/application/commands/login/login.command';
import {LoginCommandHandler} from '@/apps/users/application/commands/login/login.command.handler';
import {UpdateRefreshTokenCommand} from '@/apps/users/application/commands/refresh/update-refresh-token.command';
import {UpdateRefreshTokenCommandHandler} from '@/apps/users/application/commands/refresh/update-refresh-token.command.handler';
import {RegisterCommand} from '@/apps/users/application/commands/register/register.command';
import {RegisterCommandHandler} from '@/apps/users/application/commands/register/register.command.handler';
import {UpdateUserCommand} from '@/apps/users/application/commands/update-user/update-user.command';
import {UpdateUserCommandHandler} from '@/apps/users/application/commands/update-user/update-user.command.handler';
// Queries
import {GetUserProfileQuery} from '@/apps/users/application/queries/get-user-profile/get-user-profile.query';
import {GetUserProfileQueryHandler} from '@/apps/users/application/queries/get-user-profile/get-user-profile.query.handler';
import {ListUsersCommandHandler} from '@/apps/users/application/queries/list-users/list-users.command.handler';
import {ListUsersQuery} from '@/apps/users/application/queries/list-users/list-users.query';
import {refreshTokenRepositoryCreator} from '@/apps/users/infrastructure/persistence/refresh-token-repository';
import {userRepositoryCreator} from '@/apps/users/infrastructure/persistence/user-repository';
import {refreshTokenServiceCreator} from '@/apps/users/infrastructure/service/refresh-token-service';
import {Mediator} from '@/libs/tools/infrastructure';
import {jwtServiceCreator, passwordServiceCreator} from '@/libs/tools/infrastructure';

const buildUsersMediator = (): Mediator => {
  const mediator = new Mediator();

  const userRepository = userRepositoryCreator();
  const passwordService = passwordServiceCreator();
  const jwtService = jwtServiceCreator();
  const refreshTokenService = refreshTokenServiceCreator();
  const refreshTokenRepository = refreshTokenRepositoryCreator();

  // Commands — write to master (create/update/delete use master inside the repo)
  mediator.register(
    LoginCommand,
    new LoginCommandHandler(userRepository, passwordService, jwtService, refreshTokenService, refreshTokenRepository)
  );
  mediator.register(RegisterCommand, new RegisterCommandHandler(userRepository, passwordService));
  mediator.register(DeleteUserCommand, new DeleteUserCommandHandler(userRepository));
  mediator.register(UpdateUserCommand, new UpdateUserCommandHandler(userRepository, passwordService));
  mediator.register(
    UpdateRefreshTokenCommand,
    new UpdateRefreshTokenCommandHandler(jwtService, refreshTokenService, userRepository, refreshTokenRepository)
  );

  // Queries — read from slave (reads use useMaster: false inside the repo)
  mediator.register(GetUserProfileQuery, new GetUserProfileQueryHandler(userRepository));
  mediator.register(ListUsersQuery, new ListUsersCommandHandler(userRepository));

  return mediator;
};

// Singleton instance
const usersMediator = buildUsersMediator();

export {usersMediator};
