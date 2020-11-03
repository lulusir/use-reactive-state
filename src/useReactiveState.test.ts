import { renderHook, act } from '@testing-library/react-hooks';
import { useReactiveState, createReactiveState } from './useReactiveState';

// jest.useFakeTimers();

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
    }, 1000);

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
    }, 1000);

    await h1.waitForNextUpdate();
    expect(h1.result.current.age).toBe(35);
    expect(h2.result.current.age).toBe(35);
  });
});
