/* eslint-disable @typescript-eslint/no-use-before-define */
import EventEmitter from 'eventemitter3';
import { uniqueID } from './utils';

const emitter = new EventEmitter();

const setStateAction = (id: string) => `setStateAction:${id}`;

type IObservable<T> = T & ISubject<T>;

type ISubject<T> = {
  _id: string;
  _subscribe: (update: (value: T) => void) => { unsubscribe: () => void };
};

const isObject = (val: any): val is object =>
  val !== null && typeof val === 'object';

// const debug_creatTime = 0;
// const debug_getTime = 0;

export function createReactiveState<T extends object>(obj: T) {
  const weakMap = new WeakMap();
  const subject: ISubject<T> = {
    _id: uniqueID(),
    _subscribe(update: (value: T) => void) {
      emitter.on(setStateAction(this._id), update);
      return {
        unsubscribe: () => {
          emitter.off(setStateAction(this._id), update);
        },
      };
    },
  };

  Object.assign(obj, subject);

  const valueChange = () => {
    emitter.emit(setStateAction(subject._id), obj);
  };

  const convert = (target: any): any =>
    isObject(target) ? createProxy(target as T, valueChange) : target;

  const createProxy = (o: T, update: () => void) => {
    if (weakMap.has(o)) {
      return weakMap.get(o);
    }

    const proxy = new Proxy(o, {
      get(target, key, receiver) {
        const result = Reflect.get(target, key, receiver);

        return convert(result);
      },
      set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        let result = true;
        if (oldValue !== value) {
          result = Reflect.set(target, key, value, receiver);

          update();
        }
        return result;
      },
      deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key);
        update();
        return result;
      },
    });
    weakMap.set(o, proxy);
    return proxy;
  };

  const proxy = createProxy(obj, valueChange);
  return proxy as IObservable<T>;
}
