import {RequestData} from 'mediatr-ts';

import {UserDto} from '@/libs/dto/domain';

export class GetUserProfileQuery extends RequestData<UserDto> {
  constructor(public readonly id: string) {
    super();
  }
}
