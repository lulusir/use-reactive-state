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

function renderTestHook(obj: any) {
  let _renderCount = 0;
  return renderHook(() => {
    useReactiveState(obj);
    _renderCount += 1;
    return _renderCount;
  });
}

describe('use reactive', () => {
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
});
