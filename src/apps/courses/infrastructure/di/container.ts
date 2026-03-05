import {container} from 'tsyringe';

import {CoursesRepository} from '@/apps/courses/infrastructure/persistence/courses.repository';

import {COURSE_TOKENS} from './tokens';

container.register(COURSE_TOKENS.CoursesRepository, {useValue: new CoursesRepository()});

export {container};
