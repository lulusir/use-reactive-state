/* eslint-disable @typescript-eslint/no-use-before-define */
import { useState, useEffect, useDebugValue, useRef } from 'react';
import { Subject, Subscription } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';

type IObservable<T> = T & {
  _subject: Subject<T>;
  subscribe: (next?: (value: T) => void) => Subscription;
};

const isFunction = (val: any): val is Function => typeof val === 'function';

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
  const loopFlag = useRef(false);
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

    const updateOnLoop = () => {
      if (changed.current) {
        updateState();
        changed.current = false;
      }
    };

    const s = obj._subject.subscribe(x => {
      if (!sync) {
        changed.current = true;
        if (!loopFlag.current) {
          loopFlag.current = true;
          Promise.resolve().then(() => {
            updateOnLoop();
            loopFlag.current = false;
          });
        }
      } else {
        updateState();
      }
    });
    return () => {
      s.unsubscribe();
    };
  }, []);
}
