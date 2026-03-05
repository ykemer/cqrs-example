import {CourseModel} from '@/libs/tools/domain';

export class CourseBuilder {
  private name = 'Test Course';
  private description = 'Test Description';

  withName(name: string) {
    this.name = name;
    return this;
  }

  async build() {
    return await CourseModel.create({
      name: this.name,
      description: this.description,
    });
  }
}
