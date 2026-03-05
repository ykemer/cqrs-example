import {RequestData} from 'mediatr-ts';

export class RegisterCommand extends RequestData<void> {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {
    super();
  }
}
