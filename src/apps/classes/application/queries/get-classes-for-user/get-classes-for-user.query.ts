export class GetClassesForUserQuery {
  constructor(
    public readonly classId: string,
    public readonly userId: string,
    public readonly take: number,
    public readonly skip: number
  ) {}
}
