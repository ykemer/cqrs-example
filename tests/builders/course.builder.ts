import {CourseModel} from '@/shared';
import {CreateCourseCommand} from '@/slices/courses/create-course/create-course';
import {UpdateCourseCommand} from '@/slices/courses/update-course/update-course';
import {DeleteCourseCommand} from '@/slices/courses/delete-course/delete-course';

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

export class CreateCourseCommandBuilder {
  private name = 'Test Course';
  private description = 'Test Description';

  withName(name: string) {
    this.name = name;
    return this;
  }

  withDescription(description: string) {
    this.description = description;
    return this;
  }

  build() {
    return new CreateCourseCommand(this.name, this.description);
  }
}

export class UpdateCourseCommandBuilder {
  private courseId: string;
  private name = 'Updated Course';
  private description = 'Updated Description';

  constructor(courseId: string) {
    this.courseId = courseId;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withDescription(description: string) {
    this.description = description;
    return this;
  }

  build() {
    return new UpdateCourseCommand(this.courseId, this.name, this.description);
  }
}

export class DeleteCourseCommandBuilder {
  constructor(private courseId: string) {}

  build() {
    return new DeleteCourseCommand(this.courseId);
  }
}
