import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {PaginatedResponse} from '@/libs/dto/domain';

export class ListClassesResponse extends PaginatedResponse<ClassDto> {}
