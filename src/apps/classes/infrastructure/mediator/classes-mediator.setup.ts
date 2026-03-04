import {CreateClassCommand} from '@/apps/classes/application/commands/create-class/create-class.command';
import {CreateClassCommandHandler} from '@/apps/classes/application/commands/create-class/create-class.command.handler';
import {DeleteClassCommand} from '@/apps/classes/application/commands/delete-class/delete-class.command';
import {DeleteClassCommandHandler} from '@/apps/classes/application/commands/delete-class/delete-class.command.handler';
import {UpdateClassCommand} from '@/apps/classes/application/commands/update-class/update-class.command';
import {UpdateClassCommandHandler} from '@/apps/classes/application/commands/update-class/update-class.command.handler';
import {GetClassQuery} from '@/apps/classes/application/queries/get-class/get-class.query';
import {GetClassQueryHandler} from '@/apps/classes/application/queries/get-class/get-class.query.handler';
import {GetClassesForUserQuery} from '@/apps/classes/application/queries/get-classes-for-user/get-classes-for-user.query';
import {GetClassesForUserQueryHandler} from '@/apps/classes/application/queries/get-classes-for-user/get-classes-for-user.query.handler';
import {GetClassesWithCountQuery} from '@/apps/classes/application/queries/get-classes-with-count/get-classes-with-count.query';
import {GetClassesWithCountQueryHandler} from '@/apps/classes/application/queries/get-classes-with-count/get-classes-with-count.query.handler';
import {ClassesRepository} from '@/apps/classes/infrastructure/persistence/classes.repository';
import {Mediator} from '@/libs/tools/infrastructure';

const buildClassesMediator = (): Mediator => {
  const mediator = new Mediator();
  const repository = new ClassesRepository();

  // Commands
  mediator.register(CreateClassCommand, new CreateClassCommandHandler(repository));
  mediator.register(UpdateClassCommand, new UpdateClassCommandHandler(repository));
  mediator.register(DeleteClassCommand, new DeleteClassCommandHandler(repository));

  // Queries
  mediator.register(GetClassQuery, new GetClassQueryHandler(repository));
  mediator.register(GetClassesWithCountQuery, new GetClassesWithCountQueryHandler(repository));
  mediator.register(GetClassesForUserQuery, new GetClassesForUserQueryHandler(repository));

  return mediator;
};

const classesMediator = buildClassesMediator();

export {classesMediator};
