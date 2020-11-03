/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { useReactiveState, createReactiveState } from './useReactiveState';

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

describe('use reactive', () => {
  it('reactive', () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result } = renderHook(() => useReactiveState(obj));
    expect(result.current.name).toBe('lujs');

    act(() => {
      obj.name = 'yahaha';
    });
    expect(result.current.name).toBe('yahaha');
  });

  it('array', () => {
    const obj = createReactiveState(['lujs', 18]);
    const { result } = renderHook(() => useReactiveState(obj));
    expect(result.current[0]).toBe('lujs');

    act(() => {
      obj[0] = 'yahaha';
    });
    expect(result.current[0]).toBe('yahaha');
  });

  it('array 2', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderHook(() => useReactiveState(obj));
    expect(result.current[1].age).toBe(18);

    act(() => {
      obj[1] = { age: 35 };
    });
    expect(result.current[1].age).toBe(35);
  });

  it('array 3', () => {
    const obj = createReactiveState(['lujs', { age: 18 }]);
    const { result } = renderHook(() => useReactiveState(obj));

    act(() => {
      obj.push({ house: 'none' });
    });
    expect(result.current[2].house).toBe('none');
  });

  it('async', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      useReactiveState(obj),
    );

    expect(result.current.age).toBe(18);
    setTimeout(() => {
      obj.timeToFire();
    });

    await waitForNextUpdate();

    expect(result.current.age).toBe(35);
  });

  it('Multiple reactive', () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });

    const h1 = renderHook(() => useReactiveState(obj));
    const h2 = renderHook(() => useReactiveState(obj));

    expect(h1.result.current.age).toBe(18);
    expect(h2.result.current.age).toBe(18);

    act(() => {
      obj.timeToFire();
    });

    expect(h1.result.current.age).toBe(35);
    expect(h2.result.current.age).toBe(35);
  });

  it('Multiple async reactive', async () => {
    const obj = createReactiveState({
      name: 'lujs',
      age: 18,
      timeToFire() {
        this.age = 35;
      },
    });

    const h1 = renderHook(() => useReactiveState(obj));
    const h2 = renderHook(() => useReactiveState(obj));

    expect(h1.result.current.age).toBe(18);
    expect(h2.result.current.age).toBe(18);

    setTimeout(() => {
      obj.timeToFire();
    });

    await h1.waitForNextUpdate();
    expect(h1.result.current.age).toBe(35);
    expect(h2.result.current.age).toBe(35);
  });

  it('deep object', () => {
    const todoList = createReactiveState(new TodoList());

    const { result } = renderHook(() => useReactiveState(todoList));

    expect(result.current.list.length).toBe(0);

    // add todo
    act(() => {
      todoList.addTodo('test');
    });

    expect(result.current.list.length).toBe(1);
    const t = result.current.list[0];
    expect(t.content).toBe('test');
    expect(t.status).toBe('default');
    expect(t.id).not.toBe('');

    // finish todo

    act(() => {
      const todo = todoList.list[0];
      todo.finish();
    });

    const t1 = result.current.list[0];
    expect(t1.content).toBe('test');
    expect(t1.status).toBe('done');
    expect(t1.id).not.toBe('');
  });
});
