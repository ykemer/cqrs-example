import {NotificationData} from 'mediatr-ts';

export class UserUnenrolledEvent extends NotificationData {
  constructor(
    public userId: string,
    public classId: string
  ) {
    super();
  }
}
