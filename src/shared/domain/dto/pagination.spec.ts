import {PaginatedRequest, PaginatedResponse} from './index';

class TestPaginatedResponse<T> extends PaginatedResponse<T> {}

describe('Pagination DTOs', () => {
  it('PaginatedRequest should have default values', () => {
    const request = new PaginatedRequest();
    expect(request.page).toBe(1);
    expect(request.pageSize).toBe(10);
    expect(request.skip).toBe(0);
  });

  it('PaginatedRequest should calculate skip correctly', () => {
    const request = new PaginatedRequest(3, 20);
    expect(request.skip).toBe(40);
  });

  it('PaginatedResponse should wrap data correctly', () => {
    const data = [{id: 1}, {id: 2}];
    const response = new TestPaginatedResponse({data, total: 10, page: 1, pageSize: 2});
    expect(response.data).toEqual(data);
    expect(response.total).toBe(10);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(2);
    expect(response.pages).toBe(5);
  });
});
