import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // 値を変更
    rerender({ value: 'updated', delay: 500 });
    
    // まだデバウンス期間中なので、古い値のまま
    expect(result.current).toBe('initial');

    // デバウンス期間を進める
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // デバウンス期間が過ぎたので、新しい値に更新
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // 最初の変更
    rerender({ value: 'first', delay: 500 });
    
    // 250ms後に再度変更
    act(() => {
      vi.advanceTimersByTime(250);
    });
    rerender({ value: 'second', delay: 500 });

    // さらに250ms後（最初の変更から500ms経過）
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    // タイマーがリセットされているので、まだ'initial'
    expect(result.current).toBe('initial');

    // さらに250ms進めて、合計500ms（2回目の変更から）
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // 最後の変更の500ms後に更新
    expect(result.current).toBe('second');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    // 500ms後はまだ更新されない
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // 1000ms後に更新される
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    
    // 遅延時間を変更
    rerender({ value: 'updated', delay: 1000 });

    // 元の500ms後
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial'); // まだ更新されない

    // 新しい遅延時間の1000ms後
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should work with different data types', () => {
    // Number type
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 500 } }
    );

    numberRerender({ value: 42, delay: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(numberResult.current).toBe(42);

    // Object type
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: { name: 'initial' }, delay: 500 } }
    );

    const newObject = { name: 'updated' };
    objectRerender({ value: newObject, delay: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(objectResult.current).toEqual(newObject);
  });
});