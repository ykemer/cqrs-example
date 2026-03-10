import {CourseModel} from '@/shared';

export class CourseBuilder {
  private name = 'Test Course';
  private description = 'Test Description';

  static create() {
    return new CourseBuilder();
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withDescription(description: string) {
    this.description = description;
    return this;
  }

  buildPayload() {
    return {name: this.name, description: this.description};
  }

  async persist() {
    return CourseModel.create(this.buildPayload());
  }
}
