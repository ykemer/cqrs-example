export class DeleteClassCommand {
  constructor(
    public readonly courseId: string,
    public readonly id: string
  ) {}
}
