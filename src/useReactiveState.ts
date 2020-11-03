import { useState, useEffect } from 'react';
import { Subject } from 'rxjs';
/**
 * 1. 接受一个对象，对象是改变，自动去setState
 * 2. 多个hook引用同一个对象，对象修改就可以改变state
 * @param obj
 */

type IObservable<T> = T & {
  _subject: Subject<T>;
};

export function createReactiveState<T extends object>(obj: T) {
  const subject = new Subject<T>();

  const proxy = new Proxy(obj, {
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      subject.next(target);
      return result;
    },
  });

  Object.assign(proxy, {
    _subject: subject,
  });
  return proxy as IObservable<T>;
}

export function useReactiveState<T extends object>(obj: IObservable<T>) {
  const [state, setState] = useState<T>({ ...obj });
  useEffect(() => {
    const s = obj._subject.subscribe(x => {
      setState({ ...obj });
    });
    return () => {
      s.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
