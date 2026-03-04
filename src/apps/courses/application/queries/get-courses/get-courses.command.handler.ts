import {GetCoursesQuery} from '@/apps/courses/application/queries/get-courses/get-courses.query';
import {GetCourseResponse} from '@/apps/courses/application/queries/get-courses/get-courses.response';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {IHandler} from '@/libs/tools/domain';

export class GetCoursesCommandHandler implements IHandler<GetCoursesQuery, GetCourseResponse> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: GetCoursesQuery): Promise<GetCourseResponse> {
    const {total, data} = await this.repository.getCoursesWithCount(input.take, input.skip);

    return new GetCourseResponse({
      data,
      total,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
