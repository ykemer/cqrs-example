import {RefreshTokenModel} from '../../src/shared';

export class RefreshTokenBuilder {
  private id = `test-id-${Math.random()}`;
  private userId: string;
  private token = `test-token-${Math.random()}`;
  private expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

  constructor(userId: string) {
    this.userId = userId;
  }

  withToken(token: string) {
    this.token = token;
    return this;
  }

  async build() {
    return await RefreshTokenModel.create({
      id: this.id,
      userId: this.userId,
      token: this.token,
      expiresAt: this.expiresAt,
    });
  }
}
