/*
 * Copyright 2015 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.module('jscomp.runtime_tests.polyfill_tests.object_assign_test');
goog.setTestOnly();

const testSuite = goog.require('goog.testing.testSuite');

testSuite({
  testAssign_simple() {
    const obj = {a: 2, z: 3};
    assertEquals(obj, Object.assign(obj, {a: 4, b: 5}, null, {c: 6, b: 7}));
    assertObjectEquals({a: 4, b: 7, c: 6, z: 3}, obj);
  },

  testAssign_skipsPrototypeProperties() {
    if (!Object.create) return;
    const proto = {a: 4, b: 5};
    const from = Object.create(proto);
    from.a = 6;
    from.c = 7;
    assertObjectEquals({a: 6, c: 7}, Object.assign({}, from));
    assertObjectEquals({a: 6, b: 1, c: 7}, Object.assign({b: 1}, from));
  },

  testAssign_skipsNonEnumerableProperties() {
    const from = {'b': 23};
    try {
      Object.defineProperty(from, 'a', {enumerable: false, value: 42});
    } catch (err) {
      return; // Object.defineProperty in IE8 test harness exists, always fails
    }
    assertObjectEquals({'b': 23}, Object.assign({}, from));
    assertObjectEquals({'a': 1, 'b': 23}, Object.assign({'a': 1}, from));
  },
});
