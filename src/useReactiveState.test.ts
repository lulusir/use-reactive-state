/* eslint-disable max-classes-per-file */
import { act, renderHook } from '@testing-library/react-hooks';
import { createReactiveState, useReactiveState } from './useReactiveState';

class Todo {
  content = '';

  id = '';

  status: 'done' | 'default' | 'delete' = 'default';

  constructor(content: string) {
    this.content = content;
    this.id = Math.random().toString();
  }

  finish() {
    if (this.status === 'default') {
      this.status = 'done';
    } else if (this.status === 'done') {
      this.status = 'delete';
    }
  }

  setContent(s: string) {
    this.content = s;
  }
}

class TodoList {
  list: Todo[] = [];

  addTodo(content: string) {
    const todo = new Todo(content);
    this.list.push(todo);
  }

  finish(id: string) {
    this.list.forEach(v => {
      if (v.id === id) {
        v.finish();
      }
    });
  }

  finishByContent(content: string) {
    this.list.forEach(v => {
      if (v.content === content) {
        v.finish();
      }
    });
  }

  defaultList() {
    return this.list.filter(v => v.status === 'default');
  }

  doneList() {
    return this.list.filter(v => v.status === 'done');
  }

  deleteList() {
    return this.list.filter(v => v.status === 'delete');
  }
}

function renderTestHookSync<T = any>(obj: T, selector?: (t: T) => any) {
  let _renderCount = 0;
  return renderHook(() => {
    useReactiveState<T>(obj, { selector, sync: true });
    _renderCount += 1;
    return _renderCount;
  });
}
function renderTestHookASync<T = any>(obj: T, selector?: (t: T) => any) {
  let _renderCount = 0;
  return renderHook(() => {
    useReactiveState<T>(obj, { selector });
    _renderCount += 1;
    return _renderCount;
  });
}

function renderTestHookWithConfig<T = any>(
  obj: T,
  c?: {
    selector?: (t: T) => any;
    sync?: boolean;
  },
) {
  let _renderCount = 0;
  return renderHook(() => {
    useReactiveState<T>(obj, c);
    _renderCount += 1;
    return _renderCount;
  });
}

// describe('bug', () => {
//   it('Multiple reactive', () => {
//     const obj = createReactiveState({
//       name: 'lujs',
//       age: 18,
//       timeToFire() {
//         this.age = 35;
//       },
//     });
//     const h1 = renderTestHookSync(obj);
//     const h2 = renderTestHookSync(obj);
//     const count1 = h1.result.current;
//     const count2 = h2.result.current;
//     act(() => {
//       obj.timeToFire();
//     });
//     expect(h1.result.current).toBe(count1 + 1);
//     expect(h2.result.current).toBe(count2 + 1);
//   });
// });

describe('use reactive', () => {
  it('render one time', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookSync(obj);
    const count = result.current;
    expect(count).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    expect(result.current).toBe(2);
  });

  it('render one time', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderTestHookSync(obj);
    const count = result.current;
    expect(count).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    act(() => {
      obj.timeToFire();
    });
    expect(result.current).toBe(3);
  });

  it('render one time 1', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookSync(obj);
    const h2 = renderTestHookSync(obj);
    expect(h1.result.current).toBe(1);
    expect(h2.result.current).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    expect(h1.result.current).toBe(2);
    expect(h2.result.current).toBe(2);
  });

  it('render one time 2', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookSync(obj, s => s.name);
    const count = h1.result.current;
    // expect(h1.result.current).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    expect(h1.result.current).toBe(count + 1);
    act(() => {
      obj.age = 1;
    });
    expect(h1.result.current).toBe(count + 1);
  });

  it('reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderTestHookSync(obj);
    // useReactiveState will trigger an render
    const count = result.current;
    act(() => {
      obj.name = 'yahaha';
    });
    expect(result.current).toBe(count + 1);
  });

  it('array', () => {
    const obj = createReactiveState(['lujs', 18]);
    const { result } = renderTestHookSync(obj);
    const count = result.current;
    act(() => {
      obj[0] = 'yahaha';
    });
    expect(result.current).toBe(count + 1);
  });

  it('array 2', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderTestHookSync(obj);
    const count = result.current;
    act(() => {
      obj[1] = { age: 35 };
    });
    expect(result.current).toBe(count + 1);
  });
  it('array 3', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderTestHookSync(obj);
    const count = result.current;
    act(() => {
      obj.push({ house: 'none' });
    });
    expect(result.current).toBe(count + 1);
  });
  it('async', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookSync(obj);
    const count = result.current;
    setTimeout(() => {
      obj.timeToFire();
    });
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('Multiple reactive', () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookSync(obj);
    const h2 = renderTestHookSync(obj);
    const count1 = h1.result.current;
    const count2 = h2.result.current;
    act(() => {
      obj.timeToFire();
    });
    expect(h1.result.current).toBe(count1 + 1);
    expect(h2.result.current).toBe(count2 + 1);
  });

  it('deep object', () => {
    const todoList = createReactiveState(new TodoList());
    const { result } = renderTestHookSync(todoList);
    const count = result.current;
    // add todo
    act(() => {
      todoList.addTodo('test');
    });
    expect(result.current).toBe(count + 1);

    act(() => {
      todoList.list[0].finish();
    });
    expect(result.current).toBe(count + 2);
  });

  it('no render when value same', () => {
    const state = createReactiveState({
      name: 'lujs',
    });
    const { result } = renderTestHookSync(state);
    const count = result.current;
    // add todo
    act(() => {
      state.name = 'lujs';
    });
    expect(result.current).toBe(count);
    act(() => {
      state.name = 'lujs';
    });
    expect(result.current).toBe(count);
  });

  it('selector', () => {
    const state = createReactiveState({
      name: 'lujs',
      obj: {
        age: 18,
      },
    });
    // const selector = 'obj.age';
    const { result } = renderTestHookSync(state, s => s.obj.age);
    const count = result.current;
    // add todo
    act(() => {
      state.name = 'lujs';
    });
    expect(result.current).toBe(count);

    act(() => {
      state.obj.age = 19;
    });

    expect(result.current).toBe(count + 1);
  });

  it('selector1', () => {
    const state = createReactiveState({
      name: 'lujs',
      obj: {
        age: 18,
      },
    });
    const { result } = renderTestHookSync(state, s => s.name);
    const count = result.current;
    // add todo
    act(() => {
      state.name = 'lujs1';
    });
    expect(result.current).toBe(count + 1);
    act(() => {
      state.obj.age = 19;
    });
    expect(result.current).toBe(count + 1);
  });

  it('selector2', () => {
    const state = createReactiveState(new TodoList());
    const c1 = 'c1';
    const c2 = 'c2';
    state.addTodo(c1);
    state.addTodo(c2);
    const { result } = renderTestHookSync(state, s => s.list[0]);
    const count = result.current;
    // add todo
    act(() => {
      state.finishByContent(c1);
    });
    expect(result.current).toBe(count + 1);
    act(() => {
      state.finishByContent(c2);
    });
    expect(result.current).toBe(count + 1);
  });

  it('selector3', () => {
    const state = createReactiveState({
      a: {
        b: {
          c: {
            d: 1,
          },
        },
        e: 233,
      },
    });
    const { result } = renderTestHookSync(state, s => s.a.b);
    const count = result.current;
    // add todo
    act(() => {
      state.a.e = 234;
    });
    expect(result.current).toBe(count);
    act(() => {
      state.a.b = 122;
    });
    expect(result.current).toBe(count + 1);
  });
});

describe('use reactive async', () => {
  it('Default ASync mode, Modify twice，render one time', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookWithConfig(obj);
    const count = result.current;
    expect(count).toBe(1);
    act(() => {
      obj.name = 'yahaha';
      obj.name = 19;
    });

    await waitForNextUpdate();
    expect(result.current).toBe(2);
  });

  it('Sync mode, Modify twice， render twice', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderTestHookWithConfig(obj, {
      sync: true,
    });
    const count = result.current;
    expect(count).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    act(() => {
      obj.timeToFire();
    });
    expect(result.current).toBe(3);
  });

  it('ASync mode, Modify twice，render one time', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookWithConfig(obj, {
      sync: false,
    });
    const count = result.current;
    expect(count).toBe(1);
    obj.name = 'yahaha';
    obj.name = 19;
    await waitForNextUpdate();
    expect(result.current).toBe(2);
  });

  it('Sync mode, Share state, Modify twice，render twice time,', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookWithConfig(obj, { sync: true });
    const h2 = renderTestHookWithConfig(obj, { sync: true });
    expect(h1.result.current).toBe(1);
    expect(h2.result.current).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });
    act(() => {
      obj.timeToFire();
    });
    expect(h1.result.current).toBe(3);
    expect(h2.result.current).toBe(3);
  });

  it('ASync mode, Share state, Modify twice，render one time,', async done => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookWithConfig(obj, { sync: false });
    const h2 = renderTestHookWithConfig(obj, { sync: false });
    expect(h1.result.current).toBe(1);
    expect(h2.result.current).toBe(1);
    obj.name = 'yahaha';
    obj.timeToFire();

    setTimeout(() => {
      expect(h1.result.current).toBe(2);
      expect(h2.result.current).toBe(2);
      done();
    }, 16);
  });

  it('ASync mode, selector', async done => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookASync(obj, s => s.name);
    const count = h1.result.current;
    // expect(h1.result.current).toBe(1);
    obj.name = 'yahaha';
    await h1.waitForNextUpdate();
    expect(h1.result.current).toBe(count + 1);

    // Don't render
    obj.age = 1;
    setTimeout(() => {
      expect(h1.result.current).toBe(count + 1);
      done();
    }, 16);
  });

  it('ASync mode,  reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookASync(obj);
    // useReactiveState will trigger an render
    const count = result.current;
    obj.name = 'yahaha';
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('array', async () => {
    const obj = createReactiveState(['lujs', 18]);
    const { result, waitForNextUpdate } = renderTestHookASync(obj);
    const count = result.current;
    obj[0] = 'yahaha';
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('array 2', async () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result, waitForNextUpdate } = renderTestHookASync(obj);
    const count = result.current;
    obj[1] = { age: 35 };
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('array 3', async () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result, waitForNextUpdate } = renderTestHookASync(obj);
    const count = result.current;
    obj.push({ house: 'none' });
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('async', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderTestHookASync(obj);
    const count = result.current;
    setTimeout(() => {
      obj.timeToFire();
    });
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('Multiple reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookASync(obj);
    const h2 = renderTestHookASync(obj);
    const count1 = h1.result.current;
    const count2 = h2.result.current;
    obj.timeToFire();
    await h1.waitForNextUpdate();
    expect(h1.result.current).toBe(count1 + 1);
    expect(h2.result.current).toBe(count2 + 1);
  });

  it('Multiple async reactive', async done => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHookASync(obj);
    const h2 = renderTestHookASync(obj);
    const count1 = h1.result.current;
    const count2 = h2.result.current;
    obj.timeToFire();
    setTimeout(() => {
      expect(h1.result.current).toBe(count1 + 1);
      expect(h2.result.current).toBe(count2 + 1);
      done();
    }, 100);
  });

  it('deep object', async () => {
    const todoList = createReactiveState(new TodoList());
    const { result, waitForNextUpdate } = renderTestHookASync(todoList);
    const count = result.current;
    // add todo

    todoList.addTodo('test');
    todoList.list[0].finish();
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);
  });

  it('Do not render when value same', async done => {
    const state = createReactiveState({
      name: 'lujs',
    });
    const { result } = renderTestHookASync(state);

    const count = result.current;
    state.name = 'lujs';
    setTimeout(() => {
      expect(result.current).toBe(count);
      done();
    }, 100);
  });

  it('selector', async done => {
    const state = createReactiveState({
      name: 'lujs',
      obj: {
        age: 18,
      },
    });
    const { result, waitForNextUpdate } = renderTestHookASync(
      state,
      s => s.obj.age,
    );
    const count = result.current;
    // will not render
    state.name = 'yahahh';
    setTimeout(async () => {
      expect(result.current).toBe(count);

      state.obj.age = 19;
      await waitForNextUpdate();
      expect(result.current).toBe(count + 1);
      done();
    }, 100);
  });

  it('selector1', async done => {
    const state = createReactiveState({
      name: 'lujs',
      obj: {
        age: 18,
      },
    });
    const { result, waitForNextUpdate } = renderTestHookASync(
      state,
      s => s.name,
    );
    const count = result.current;
    // add todo
    state.name = 'lujs1';
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);

    // Will not trigger rendering, so the following uses timing to assert
    state.obj.age = 19;
    setTimeout(() => {
      expect(result.current).toBe(count + 1);
      done();
    }, 100);
  });

  it('selector2', async done => {
    const state = createReactiveState(new TodoList());
    const c1 = 'c1';
    const c2 = 'c2';
    state.addTodo(c1);
    state.addTodo(c2);
    const { result, waitForNextUpdate } = renderTestHookASync(
      state,
      s => s.list[0],
    );
    const count = result.current;

    state.finishByContent(c1);
    await waitForNextUpdate();
    expect(result.current).toBe(count + 1);

    state.finishByContent(c2);
    setTimeout(() => {
      expect(result.current).toBe(count + 1);
      done();
    }, 100);
  });

  it('selector3', done => {
    const state = createReactiveState({
      a: {
        b: {
          c: {
            d: 1,
          },
        },
        e: 233,
      },
    });
    const { result, waitForNextUpdate } = renderTestHookASync(
      state,
      s => s.a.b,
    );
    const count = result.current;
    // add todo
    state.a.e = 234;
    setTimeout(async () => {
      expect(result.current).toBe(count);
      state.a.b = 122;
      await waitForNextUpdate();
      expect(result.current).toBe(count + 1);
      done();
    }, 16);
  });
});

describe('subscribe', () => {
  it('subscribe ', done => {
    const s = createReactiveState({ name: 'lujs' });
    s.subscribe(({ name }) => {
      expect(name).toBe('yahaha');
      done();
    });
    s.name = 'yahaha';
  });
  it('subscribe 1', () => {
    const callback = jest.fn();
    const s = createReactiveState({ name: 'lujs' });
    s.subscribe(callback);
    expect(callback).not.toBeCalled();
    s.name = 'yahaha';
    expect(callback).toBeCalled();
  });
  it('unsubscribe ', () => {
    const callback = jest.fn();
    const s = createReactiveState({ name: 'lujs' });
    const subject = s.subscribe(callback);
    subject.unsubscribe();
    s.name = 'yahaha';
    expect(callback).not.toBeCalled();
  });
  it('test', done => {
    const r = createReactiveState({
      a: {
        b: [
          {
            c: 'c',
            d: { e: 'e' },
          },
        ],
      },
    });
    r.subscribe(v => {
      expect(v.k).toBe('k');
      done();
    });
    r.k = 'k';
  });
  it('test1', done => {
    const r = createReactiveState({
      a: {
        b: [
          {
            c: 'c',
            d: { e: 'e' },
          },
        ],
      },
    });
    r.subscribe(v => {
      expect(r.a.k).toBe('k');
      done();
    });
    r.a.k = 'k';
  });
  it('test2', done => {
    const r = createReactiveState({
      a: {
        b: [
          {
            c: 'c',
            d: { e: 'e' },
          },
        ],
      },
    });
    r.subscribe(v => {
      expect(r.a.b[0].c).toBe('c1');
      done();
    });
    r.a.b[0].c = 'c1';
  });
  it('test3', done => {
    const r = createReactiveState({
      a: {
        b: [
          {
            c: 'c',
            d: { e: 'e' },
          },
        ],
      },
    });
    r.subscribe(v => {
      expect(r.a.b[1].c).toBe('c2');
      done();
    });
    r.a.b.push({ c: 'c2' });
  });

  it('nest array1', done => {
    const r = createReactiveState({ ary: [new Todo('')] });
    r.subscribe(v => {
      expect(r.ary[0].status).toBe('done');
      done();
    });

    r.ary[0].finish();
  });

  it('nest array push obj', done => {
    const r = createReactiveState({ ary: [new Todo('0')] });
    r.subscribe(v => {
      expect(r.ary.length).toBe(2);
      done();
    });

    r.ary.push(new Todo('1'));
  });

  it('nest array add obj', done => {
    const r = createReactiveState({ ary: [new Todo('0')] });
    let count = 0;
    r.subscribe(v => {
      // console.log('count', count);
      if (count === 0) {
        expect(r.ary.length).toBe(2);
      }
      if (count === 1) {
        expect(r.ary[1].status).toBe('done');
      }

      count += 1;
      setTimeout(() => {
        expect(count).toBe(2);
        done();
      }, 1000);
    });

    r.ary.push(new Todo('1'));

    r.ary[1].finish();
  });
});
