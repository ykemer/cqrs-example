import {Mediator} from 'mediatr-ts';
import {container} from 'tsyringe';

class TsyringeResolver {
  add(type: any) {
    // tsyringe resolves by constructor reference directly, no pre-registration needed
    if (!container.isRegistered(type)) {
      container.register(type, {useClass: type});
    }
  }

  resolve<T>(type: new (...args: any[]) => T): T {
    return container.resolve(type);
  }
}

const mediatR = new Mediator({resolver: new TsyringeResolver()});
export {mediatR};
