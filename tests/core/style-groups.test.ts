import { describe, it, expect } from 'bun:test';
import { groupStyle } from '../../src/core/style-groups';

describe('groupStyle', () => {
  it('classifies display as layout', () => {
    expect(groupStyle('display')).toBe('layout');
  });
  it('classifies font-size as text', () => {
    expect(groupStyle('font-size')).toBe('text');
  });
  it('classifies background-color as bg', () => {
    expect(groupStyle('background-color')).toBe('bg');
  });
  it('falls back to other for unknown', () => {
    expect(groupStyle('zzz-unknown')).toBe('other');
  });
});
