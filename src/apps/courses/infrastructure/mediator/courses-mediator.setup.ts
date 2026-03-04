// Commands
import {CreateCourseCommand} from '@/apps/courses/application/commands/create-course/create-course.command';
import {CreateCourseCommandHandler} from '@/apps/courses/application/commands/create-course/create-course.command.handler';
import {DeleteCourseCommand} from '@/apps/courses/application/commands/delete-course/delete-course.command';
import {DeleteCourseCommandHandler} from '@/apps/courses/application/commands/delete-course/delete-course.command.handler';
import {UpdateCourseCommand} from '@/apps/courses/application/commands/update-course/update-course.command';
import {UpdateCourseCommandHandler} from '@/apps/courses/application/commands/update-course/update-course.command.handler';
import {GetCourseQuery} from '@/apps/courses/application/queries/get-course/get-course.query';
import {GetCourseQueryHandler} from '@/apps/courses/application/queries/get-course/get-course.query.handler';
import {GetCoursesCommandHandler} from '@/apps/courses/application/queries/get-courses/get-courses.command.handler';
// Queries
import {GetCoursesQuery} from '@/apps/courses/application/queries/get-courses/get-courses.query';
import {ListCoursesQuery} from '@/apps/courses/application/queries/list-courses/list-courses.query';
import {ListCoursesQueryHandler} from '@/apps/courses/application/queries/list-courses/list-courses.query.handler';
import {CoursesRepository} from '@/apps/courses/infrastructure/persistence/courses.repository';
import {Mediator} from '@/libs/tools/infrastructure';

const buildCoursesMediator = (): Mediator => {
  const mediator = new Mediator();
  const repository = new CoursesRepository();

  // Commands (admin only — enforced in routers)
  mediator.register(CreateCourseCommand, new CreateCourseCommandHandler(repository));
  mediator.register(UpdateCourseCommand, new UpdateCourseCommandHandler(repository));
  mediator.register(DeleteCourseCommand, new DeleteCourseCommandHandler(repository));

  // Queries
  mediator.register(GetCoursesQuery, new GetCoursesCommandHandler(repository));
  mediator.register(GetCourseQuery, new GetCourseQueryHandler(repository));
  mediator.register(ListCoursesQuery, new ListCoursesQueryHandler(repository));

  return mediator;
};

// Singleton instance
const coursesMediator = buildCoursesMediator();

export {coursesMediator};
