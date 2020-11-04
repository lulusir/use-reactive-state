/* eslint-disable @typescript-eslint/no-use-before-define */
import { useState, useEffect } from 'react';
import { Subject } from 'rxjs';

type IObservable<T> = T & {
  _subject: Subject<T>;
};

const isObject = (val: any): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export function createReactiveState<T extends object>(obj: T) {
  const subject = new Subject<T>();

  const convert = (target: any): any =>
    isObject(target) ? reactive(target) : target;

  Object.assign(obj, {
    _subject: subject,
  });

  const reactive = (obj1: T) => {
    const proxy = new Proxy(obj1, {
      get(target, key, receiver) {
        const result = Reflect.get(target, key, receiver);
        return convert(result);
      },
      set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        let result = true;
        if (oldValue !== value) {
          result = Reflect.set(target, key, value, receiver);
          // console.log('next', key, value);
          subject.next(target);
        }
        return result;
      },
    });
    return proxy;
  };

  const proxy = reactive(obj);
  return proxy as IObservable<T>;
}

export function useReactiveState<T extends object>(obj: IObservable<T>) {
  const [, setState] = useState({});
  useEffect(() => {
    // Todo: will trigger an render
    const s = obj._subject.subscribe(x => {
      // notify react to update
      setState({});
      // console.log(obj, '==obj');
    });
    return () => {
      s.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
