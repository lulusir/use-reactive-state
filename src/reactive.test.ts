import { createReactiveState } from '.';

describe('reactive', () => {
  it('响应式对象修改，触发订阅: object', done => {
    const vm = createReactiveState({
      count: 0,
      change() {
        this.count += 1;
      },
    });

    vm.subscribe(obj => {
      expect(obj.count).toBe(1);
      done();
    });

    vm.change();
  });

  it('响应式对象修改，触发订阅： Deep Object', () => {
    const vm = createReactiveState({
      a: {
        b: {
          count: -1,
        },
      },

      change() {
        this.a.b.count += 1;
      },
    });

    let count = 0;
    vm.subscribe(obj => {
      count += 1;
    });

    for (let index = 0; index < 10; index++) {
      vm.a.b.count = index;
    }

    vm.change();
    expect(vm.a.b.count).toBe(10);
    expect(count).toBe(11);
  });

  it('响应式对象修改，触发订阅： 数组', done => {
    const vm = createReactiveState({
      a: {
        b: [1],
      },

      change() {
        this.a.b.push(1);
      },
    });

    vm.subscribe(obj => {
      expect(obj.a.b.length).toBe(2);
      done();
    });

    vm.change();
  });
});
