# use-reactive-states

[demo](https://codesandbox.io/s/staging-sunset-y4cfe?file=/src/App.tsx)

## install

```
npm i @lujs/use-reactive-state
```

or

```
yarn add @lujs/use-reactive-state
```

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
  useReactiveState(vm);
  return (
    <div>
      <p>name1:{vm.name}</p>
    </div>
  );
};

const ComB = () => {
  useReactiveState(vm);
  return (
    <div>
      <p>name2:{vm.name}</p>
    </div>
  );
};

const Index = () => {
  useReactiveState(vm);

  return (
    <div>
      <ComA />
      <ComB />
      <p>name:{vm.name}</p>
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

const viewModel = createReactiveState(new TodoList());

const Index = () => {
  const refInput = useRef<HTMLInputElement>(null);
  useReactiveState(viewModel);

  const defaultList = viewModel.defaultList();
  const doneList = viewModel.doneList();
  const deleteList = viewModel.deleteList();

  useEffect(() => {
    viewModel.init();
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
                viewModel.addTodo(content);
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
                  viewModel.finish(v.id);
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
                  viewModel.finish(v.id);
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
