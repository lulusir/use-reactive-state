# use-reactive-states

[demo](https://codesandbox.io/s/staging-sunset-y4cfe?file=/src/App.tsx)

## share state

```typescript
import React from 'react';
import {
  createReactiveState,
  useReactiveState,
} from '@lujs/use-reactive-state';

class Vm {
  name = 'use-react-state';

  setName(name: string) {
    this.name = name;
  }
}

const vm = createReactiveState(new Vm());

const ComA = () => {
  const state = useReactiveState(vm);
  return (
    <div>
      <p>name1:{state.name}</p>
    </div>
  );
};

const ComB = () => {
  const state = useReactiveState(vm);
  return (
    <div>
      <p>name2:{state.name}</p>
    </div>
  );
};

const Index = () => {
  const state = useReactiveState(vm);

  return (
    <div>
      <ComA />
      <ComB />
      <p>name:{state.name}</p>
      <button
        type="button"
        onClick={() => {
          const n = Math.random().toString();
          vm.setName(n);
        }}
      >
        set name
      </button>
    </div>
  );
};

export default Index;
```

## Deep object

```typescript
// eslint-disable-next-line max-classes-per-file
import {
  createReactiveState,
  useReactiveState,
} from '@lujs/use-reactive-state';
import React, { useRef, useEffect } from 'react';

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

  init() {
    this.addTodo('todo 1');
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

const todoList = createReactiveState(new TodoList());

const Index = () => {
  const refInput = useRef<HTMLInputElement>(null);
  const state = useReactiveState<TodoList>(todoList);

  const defaultList = state.defaultList();
  const doneList = state.doneList();
  const deleteList = state.deleteList();

  useEffect(() => {
    state.init();
  }, []);

  return (
    <div>
      <div style={{ paddingLeft: '40px', marginBottom: '20px' }}>
        <input type="text" ref={refInput} />
        <button
          style={{ marginLeft: '20px' }}
          type="button"
          onClick={() => {
            if (refInput.current) {
              const content = refInput.current.value;
              if (content) {
                state.addTodo(content);
              }
            }
          }}
        >
          add todo
        </button>
      </div>

      <ul>
        default List:
        {defaultList.map(v => {
          return (
            <li key={v.id}>
              {v.content} status: {v.status}
              <button
                style={{ marginLeft: '20px' }}
                type="button"
                onClick={() => {
                  state.finish(v.id);
                }}
              >
                finish
              </button>
            </li>
          );
        })}
      </ul>

      <ul>
        done List:
        {doneList.map(v => {
          return (
            <li key={v.id}>
              {v.content} status: {v.status}
              <button
                style={{ marginLeft: '20px' }}
                type="button"
                onClick={() => {
                  state.finish(v.id);
                }}
              >
                finish
              </button>
            </li>
          );
        })}
      </ul>

      <ul>
        delete List:
        {deleteList.map(v => {
          return (
            <li key={v.id}>
              <del>
                {v.content} status: {v.status}
              </del>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Index;
```
