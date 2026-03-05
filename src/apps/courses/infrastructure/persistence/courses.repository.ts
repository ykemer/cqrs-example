import {Op, Sequelize} from 'sequelize';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {
  CoursesRepositoryInterface,
  UpsertCoursePayload,
} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {BadRequestError} from '@/libs/dto/domain';
import {ClassModel, CourseModel} from '@/libs/tools/domain';

export class CoursesRepository implements CoursesRepositoryInterface {
  constructor() {}

  async getCourse(id: string): Promise<CourseDto | null> {
    const output = await CourseModel.findOne({
      where: {id},
      useMaster: false,
    });

    if (output === null) return null;
    return this.mapCourseToCourseDto(output);
  }

  async getCoursesWithCount(take: number, skip: number) {
    const {rows, count} = await CourseModel.findAndCountAll({
      limit: take,
      offset: skip,
      order: [['created_at', 'DESC']],
      useMaster: false,
    });

    return {
      data: rows.map(course => this.mapCourseToCourseDto(course)),
      total: count,
    };
  }

  async createCourse(payload: UpsertCoursePayload): Promise<CourseDto> {
    const created = await CourseModel.create(
      {
        name: payload.name,
        description: payload.description,
      },
      {useMaster: true}
    );

    return this.mapCourseToCourseDto(created);
  }

  async updateCourse(id: string, payload: UpsertCoursePayload): Promise<CourseDto | null> {
    const existing = await CourseModel.findOne({where: {id}, useMaster: true});
    if (!existing) return null;

    existing.set({
      name: payload.name,
      description: payload.description,
      updatedAt: new Date(),
    });

    await existing.save();

    return this.mapCourseToCourseDto(existing);
  }

  async deleteCourse(id: string): Promise<void> {
    const existingCourse = await CourseModel.findOne({
      where: {id},
      useMaster: true,
    });

    if (!existingCourse) return;

    if (existingCourse.enrolledUsers > 0) {
      throw new BadRequestError('Can not delete class when it has enrolled users');
    }

    await CourseModel.destroy({where: {id}});
  }

  async getCoursesForUser(userId: string, take: number, skip: number): Promise<{data: CourseDto[]; total: number}> {
    const now = new Date();

    const {rows, count} = await CourseModel.findAndCountAll({
      limit: take,
      offset: skip,
      order: [['created_at', 'DESC']],
      distinct: true,
      useMaster: false,
      include: [
        {
          model: ClassModel,
          as: 'classes',
          required: true,
          attributes: [],
          where: {
            [Op.or]: [
              {registrationDeadline: {[Op.gt]: now}},
              Sequelize.literal(
                `EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = \`classes\`.\`id\` AND enrollments.user_id = '${userId}')`
              ),
            ],
          },
        },
      ],
    });

    return {
      data: rows.map(course => this.mapCourseToCourseDto(course)),
      total: count,
    };
  }

  private mapCourseToCourseDto(course: CourseModel): CourseDto {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      enrolledUsers: course.enrolledUsers ?? 0,
    };
  }
}
