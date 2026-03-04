export class GetClassesWithCountQuery {
  constructor(
    public readonly classId: string,
    public readonly take: number,
    public readonly skip: number
  ) {}
}
