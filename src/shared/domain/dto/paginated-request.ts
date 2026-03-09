export class PaginatedRequest {
  page: number;
  pageSize: number;
  take: number;
  skip: number;

  constructor(page: number = 1, pageSize: number = 10) {
    this.page = page;
    this.pageSize = pageSize;

    this.take = pageSize;
    this.skip = (page - 1) * pageSize;
  }
}
