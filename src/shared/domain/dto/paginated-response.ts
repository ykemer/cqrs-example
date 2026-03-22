type PaginatedResponseConstructor<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  page: number;
  pageSize: number;

  constructor({data, total, page, pageSize}: PaginatedResponseConstructor<T>) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.pages = Math.ceil(total / pageSize);
  }
}
