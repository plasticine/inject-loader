import a, { a as methodA } from './a.js';
import b from './b.js';
import c from './c.js';

export function getA() {
  return methodA();
}

export function getB() {
  return b();
}

export function getC() {
  return c;
}

export function callRequireMethod() {
  return a.require();
}
