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
