import { MIN_DEPTH_FOR_PREFIXED_DIRS } from '../constants';

export function requiresPrefix(depth: number): boolean {
  return depth >= MIN_DEPTH_FOR_PREFIXED_DIRS;
}