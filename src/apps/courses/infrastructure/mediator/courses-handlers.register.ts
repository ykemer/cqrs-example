// Register dependencies in the tsyringe container first
import '@/apps/courses/infrastructure/di/container';
// Importing handlers so their @requestHandler decorators run and register them with mediatr-ts
import '@/apps/courses/application/commands/create-course/create-course.command.handler';
import '@/apps/courses/application/commands/delete-course/delete-course.command.handler';
import '@/apps/courses/application/commands/update-course/update-course.command.handler';
import '@/apps/courses/application/queries/get-course/get-course.query.handler';
import '@/apps/courses/application/queries/list-courses/list-courses.query.handler';
