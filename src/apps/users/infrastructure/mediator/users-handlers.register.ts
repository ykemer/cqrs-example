// Register dependencies in the tsyringe container first
import '@/apps/users/infrastructure/di/container';
// Importing handlers so their @requestHandler decorators run and register them with mediatr-ts
import '@/apps/users/application/commands/delete-user/delete-user.command.handler';
import '@/apps/users/application/commands/login/login.command.handler';
import '@/apps/users/application/commands/refresh/update-refresh-token.command.handler';
import '@/apps/users/application/commands/register/register.command.handler';
import '@/apps/users/application/commands/update-user/update-user.command.handler';
import '@/apps/users/application/queries/get-user-profile/get-user-profile.query.handler';
import '@/apps/users/application/queries/list-users/list-users.command.handler';
