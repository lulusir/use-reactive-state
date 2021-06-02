import { Subject, Subscriber, Subscription } from 'rxjs';

type IObservable<T> = T & {
  _subject: Subject<T>;
  subscribe: (next?: (value: T) => void) => Subscription;
};

const isObject = (val: any): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export function createReactiveState<T extends object>(obj: T) {
  const subject = new Subject<T>();

  const valueChange = (
    target: any,
    key: string | symbol,
    value: any,
    receiver: any,
  ) => {
    const skip =
      isObject(value) &&
      Number.isInteger(Number(key)) &&
      Reflect.getPrototypeOf(value) === Subscriber.prototype &&
      Array.isArray(receiver);
    if (!skip) {
      subject.next(target);
    }
  };

  const convert = (target: any): any =>
    isObject(target) ? reactive(target, valueChange) : target;

  Object.assign(obj, {
    _subject: subject,
    subscribe: (next?: (value: T) => void) => {
      const unsubscribe = subject.subscribe(next);
      return unsubscribe;
    },
  });

  const reactive = (
    o: T,
    callback: (
      target: T,
      key: string | symbol,
      value?: any,
      receiver?: any,
    ) => void,
  ) => {
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

          callback(target, key, value, receiver);
        }
        return result;
      },
      deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key);
        callback(target, key);
        return result;
      },
    });
    return proxy;
  };

  const proxy = reactive(obj, valueChange);
  return proxy as IObservable<T>;
}
