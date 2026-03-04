import {Op} from 'sequelize';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {
  ClassesRepositoryInterface,
  UpsertClassPayload,
} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {BadRequestError} from '@/libs/dto/domain';
import {ClassModel, CourseModel, EnrollmentsModel} from '@/libs/tools/domain';

export class ClassesRepository implements ClassesRepositoryInterface {
  constructor() {}

  async getClass(courseId: string, id: string): Promise<ClassDto | null> {
    const output = await ClassModel.findOne({
      where: {id, courseId},
      include: [{model: CourseModel, as: 'course', attributes: ['name']}],
      useMaster: false,
    });

    if (output === null) return null;
    return this.mapClassToClassDto(output);
  }

  async getClassesWithCount(courseId: string, take: number, skip: number) {
    const {rows, count} = await ClassModel.findAndCountAll({
      limit: take,
      offset: skip,
      order: [['created_at', 'DESC']],
      include: [{model: CourseModel, as: 'course', attributes: ['name']}],
      useMaster: false,
      where: {courseId},
    });

    return {
      data: rows.map(item => this.mapClassToClassDto(item)),
      total: count,
    };
  }

  async createClass(courseId: string, payload: UpsertClassPayload): Promise<ClassDto> {
    const created = await ClassModel.create(
      {
        courseId: courseId,
        maxUsers: payload.maxUsers,
        registrationDeadline: payload.registrationDeadline,
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
      {useMaster: true}
    );

    // Refresh to get course name
    return (await this.getClass(courseId, created.id))!;
  }

  async updateClass(courseId: string, id: string, payload: UpsertClassPayload): Promise<ClassDto | null> {
    const existing = await ClassModel.findOne({where: {id, courseId}, useMaster: true});
    if (!existing) return null;

    existing.set({
      maxUsers: payload.maxUsers,
      registrationDeadline: payload.registrationDeadline,
      startDate: payload.startDate,
      endDate: payload.endDate,
      updatedAt: new Date(),
    });

    await existing.save();

    return this.getClass(courseId, id);
  }

  async deleteClass(id: string): Promise<void> {
    const existingClass = await ClassModel.findOne({
      where: {id},
      useMaster: true,
    });

    if (!existingClass) return;

    if (existingClass.enrolledUsers > 0) {
      throw new BadRequestError('Can not delete class when it has enrolled users');
    }

    await ClassModel.destroy({where: {id}});
  }

  async getClassesForUser(
    courseId: string,
    userId: string,
    take: number,
    skip: number
  ): Promise<{data: ClassDto[]; total: number}> {
    const now = new Date();

    const {rows, count} = await ClassModel.findAndCountAll({
      where: {
        courseId,
        [Op.or]: [{registrationDeadline: {[Op.gt]: now}}, {'$enrollments.user_id$': userId}],
      },
      include: [
        {
          model: EnrollmentsModel,
          as: 'enrollments',
          attributes: [],
          required: false,
          where: {userId},
        },
        {
          model: CourseModel,
          as: 'course',
          attributes: ['name'],
        },
      ],
      limit: take,
      offset: skip,
      order: [['created_at', 'DESC']],
      useMaster: false,
      distinct: true,
    });

    return {
      data: rows.map(item => this.mapClassToClassDto(item)),
      total: count,
    };
  }

  private mapClassToClassDto(item: ClassModel & {course?: {name: string}}): ClassDto {
    return {
      id: item.id,
      courseId: item.courseId,
      name: item.course?.name ?? '',
      maxUsers: item.maxUsers,
      enrolledUsers: item.enrolledUsers ?? 0,
      registrationDeadline: item.registrationDeadline,
      startDate: item.startDate,
      endDate: item.endDate,
    };
  }
}
