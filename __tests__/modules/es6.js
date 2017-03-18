import a, { a as methodA } from './a.js';
import b from './b.js';

export function getA() {
  return methodA();
}

export function getB() {
  return b();
}

export function callRequireMethod() {
  return a.require();
}
