import {container} from 'tsyringe';

import {ClassesRepository} from '@/apps/classes/infrastructure/persistence/classes.repository';

import {CLASS_TOKENS} from './tokens';

container.register(CLASS_TOKENS.ClassesRepository, {useValue: new ClassesRepository()});

export {container};
