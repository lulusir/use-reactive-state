/* eslint-disable @typescript-eslint/no-use-before-define */
import { useState, useEffect, useDebugValue, useRef } from 'react';
import { Subject, Subscriber, Subscription } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import './requestIdleCallback';

type IObservable<T> = T & {
  _subject: Subject<T>;
  subscribe: (next?: (value: T) => void) => Subscription;
};

const isObject = (val: any): val is Record<any, any> =>
  val !== null && typeof val === 'object';

const isFunction = (val: any): val is Function => typeof val === 'function';

const proxyMap = new WeakMap();
const rawMap = new WeakMap();

export function createReactiveState<T extends object>(obj: T) {
  const oldProxyObj = proxyMap.get(obj);
  if (oldProxyObj) {
    return oldProxyObj;
  }

  if (rawMap.has(obj)) {
    return obj;
  }

  const subject = new Subject<T>();

  const convert = (target: any): any =>
    isObject(target) ? reactive(target, whenValueSet) : target;

  Object.assign(obj, {
    _subject: subject,
    subscribe: (next?: (value: T) => void) => {
      const unsubscribe = subject.subscribe(next);
      return unsubscribe;
    },
  });

  const whenValueSet = (
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

  const reactive = (
    o: T,
    callback: (
      target: T,
      key: string | symbol,
      value: any,
      receiver: any,
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
    });
    return proxy;
  };

  const proxy = reactive(obj, whenValueSet);
  return proxy as IObservable<T>;
}

export function useReactiveState<T extends object>(
  obj: IObservable<T>,
  config: {
    sync?: boolean; // 是否异步更新 默认异步
    selector?: (t: T) => any;
  } = {},
) {
  const { selector = null, sync = false } = config;
  const [, setState] = useState({});
  const lastState = useRef<T | undefined>(undefined);
  const changed = useRef(false);

  useDebugValue(obj, o => o);

  useEffect(() => {
    const setLastState = () => {
      const selectorState = isFunction(selector) ? selector(obj) : undefined;
      lastState.current = cloneDeep(selectorState);
    };

    setLastState();

    const updateState = () => {
      const update = () => setState({});
      if (isFunction(selector)) {
        const selectorState = selector(obj);

        if (lastState.current !== undefined) {
          if (!isEqual(selectorState, lastState.current)) {
            update();
          }
        }
        setLastState();
      } else {
        update();
      }
    };

    let timer: NodeJS.Timeout | null = null;
    if (!sync) {
      timer = setInterval(() => {
        if (changed.current) {
          updateState();
          changed.current = false;
        }
      });
    }

    const s = obj._subject.subscribe(x => {
      if (!sync) {
        changed.current = true;
      } else {
        updateState();
      }
    });
    return () => {
      s.unsubscribe();
      if (timer) {
        clearInterval(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
