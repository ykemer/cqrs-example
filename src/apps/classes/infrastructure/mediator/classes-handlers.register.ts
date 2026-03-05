// Register dependencies in the tsyringe container first
import '@/apps/classes/infrastructure/di/container';
// Importing handlers so their @requestHandler decorators run and register them with mediatr-ts
import '@/apps/classes/application/commands/create-class/create-class.command.handler';
import '@/apps/classes/application/commands/delete-class/delete-class.command.handler';
import '@/apps/classes/application/commands/update-class/update-class.command.handler';
import '@/apps/classes/application/queries/get-class/get-class.query.handler';
import '@/apps/classes/application/queries/list-classes/list-courses.query.handler';
