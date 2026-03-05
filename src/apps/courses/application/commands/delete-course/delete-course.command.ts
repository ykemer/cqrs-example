import {RequestData} from 'mediatr-ts';

export class DeleteCourseCommand extends RequestData<void> {
  constructor(public readonly id: string) {
    super();
  }
}
