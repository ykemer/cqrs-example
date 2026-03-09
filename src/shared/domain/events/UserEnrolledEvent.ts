import {NotificationData} from 'mediatr-ts';

export class UserEnrolledEvent extends NotificationData {
  constructor(
    public userId: string,
    public classId: string
  ) {
    super();
  }
}
