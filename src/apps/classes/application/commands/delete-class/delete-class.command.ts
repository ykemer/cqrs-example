import {RequestData} from 'mediatr-ts';

export class DeleteClassCommand extends RequestData<void> {
  constructor(
    public readonly courseId: string,
    public readonly id: string
  ) {
    super();
  }
}
