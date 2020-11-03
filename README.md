# use-reactive-states

```typescript
import React from 'react';
import { createReactiveState, useReactiveState } from 'use-reactive-state';

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
