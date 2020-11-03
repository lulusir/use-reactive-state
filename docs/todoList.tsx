// eslint-disable-next-line max-classes-per-file
import {
  createReactiveState,
  useReactiveState,
} from '@lujs/use-reactive-state';
import React, { useRef } from 'react';

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
todoList.init();

const Index = () => {
  const refInput = useRef<HTMLInputElement>(null);
  const state = useReactiveState<TodoList>(todoList);

  const defaultList = state.defaultList();
  const doneList = state.doneList();
  const deleteList = state.deleteList();

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
                todoList.addTodo(content);
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
                  todoList.finish(v.id);
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
                  todoList.finish(v.id);
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
