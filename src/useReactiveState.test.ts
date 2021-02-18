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

function renderTestHook(obj: any, path?: string) {
  let _renderCount = 0;
  return renderHook(() => {
    useReactiveState(obj, path);
    _renderCount += 1;
    return _renderCount;
  });
}

describe('use reactive', () => {
  it('render one time', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderTestHook(obj);

    const count = result.current;
    expect(count).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });

    expect(result.current).toBe(2);
  });

  it('render one time 1', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const h1 = renderTestHook(obj);
    const h2 = renderTestHook(obj);

    expect(h1.result.current).toBe(1);
    expect(h2.result.current).toBe(1);
    act(() => {
      obj.name = 'yahaha';
    });

    expect(h1.result.current).toBe(2);
    expect(h2.result.current).toBe(2);
  });
  it('reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderTestHook(obj);

    // useReactiveState will trigger an render
    const count = result.current;
    act(() => {
      obj.name = 'yahaha';
    });

    expect(result.current).toBe(count + 1);
  });

  it('array', () => {
    const obj = createReactiveState(['lujs', 18]);
    const { result } = renderTestHook(obj);

    const count = result.current;
    act(() => {
      obj[0] = 'yahaha';
    });
    expect(result.current).toBe(count + 1);
  });

  it('array 2', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderTestHook(obj);

    const count = result.current;
    act(() => {
      obj[1] = { age: 35 };
    });
    expect(result.current).toBe(count + 1);
  });

  it('array 3', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderTestHook(obj);

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

    const { result, waitForNextUpdate } = renderTestHook(obj);

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

    const h1 = renderTestHook(obj);
    const h2 = renderTestHook(obj);

    const count1 = h1.result.current;
    const count2 = h2.result.current;
    act(() => {
      obj.timeToFire();
    });

    expect(h1.result.current).toBe(count1 + 1);
    expect(h2.result.current).toBe(count2 + 1);
  });

  it('Multiple async reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });

    const h1 = renderTestHook(obj);
    const h2 = renderTestHook(obj);

    const count1 = h1.result.current;
    const count2 = h2.result.current;

    setTimeout(() => {
      obj.timeToFire();
    });

    await h1.waitForNextUpdate();
    expect(h1.result.current).toBe(count1 + 1);
    expect(h2.result.current).toBe(count2 + 1);
  });

  it('deep object', () => {
    const todoList = createReactiveState(new TodoList());

    const { result } = renderTestHook(todoList);

    const count = result.current;
    // add todo
    act(() => {
      todoList.addTodo('test');
    });

    expect(result.current).toBe(count + 1);

    // finish todo

    act(() => {
      const todo = todoList.list[0];
      todo.finish();
    });

    expect(result.current).toBe(count + 2);
  });

  it('no render when value same', () => {
    const state = createReactiveState({
      name: 'lujs',
    });

    const { result } = renderTestHook(state);

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

    const selector = 'obj.age';
    const { result } = renderTestHook(state, selector);

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

    const selector = 'name';
    const { result } = renderTestHook(state, selector);

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

    const selector = 'list[0]';
    const { result } = renderTestHook(state, selector);

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
});
