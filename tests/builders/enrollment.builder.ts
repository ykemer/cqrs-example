import {EnrollmentsModel} from '@/shared';

export class EnrollmentBuilder {
  private classId: string;
  private userId: string;

  constructor(classId: string, userId: string) {
    this.classId = classId;
    this.userId = userId;
  }

  async persist() {
    return await EnrollmentsModel.create({
      classId: this.classId,
      userId: this.userId,
    });
  }
}
