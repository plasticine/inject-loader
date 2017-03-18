/* eslint-disable import/prefer-default-export */

import getFoo from 'getFoo';
import { BAR } from 'bar';

export function getValue() {
  return getFoo() * BAR;
}
