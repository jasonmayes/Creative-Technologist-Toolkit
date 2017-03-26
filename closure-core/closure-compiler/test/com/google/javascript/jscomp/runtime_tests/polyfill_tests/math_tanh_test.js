/*
 * Copyright 2016 The Closure Compiler Authors.
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

goog.module('jscomp.runtime_tests.polyfill_tests.math_tanh_test');
goog.setTestOnly();

const testSuite = goog.require('goog.testing.testSuite');
const testing = goog.require('jscomp.runtime_tests.polyfill_tests.testing');

const assertExactlyNaN = testing.assertExactlyNaN;
const assertNegativeZero = testing.assertNegativeZero;
const assertPositiveZero = testing.assertPositiveZero;
const noCheck = testing.noCheck;

testSuite({
  testTanh() {
    assertPositiveZero(Math.tanh(0));
    assertPositiveZero(Math.tanh(noCheck([-0])));
    assertNegativeZero(Math.tanh(-0));
    assertEquals(1, Math.tanh(Infinity));
    assertEquals(1, Math.tanh(1e20));
    assertEquals(-1, Math.tanh(-1e20));
    assertEquals(-1, Math.tanh(-Infinity));
    assertExactlyNaN(Math.tanh(NaN));
    assertExactlyNaN(Math.tanh(noCheck({})));

    assertRoughlyEquals(0.761594155955765, Math.tanh(1), 1e-15);
    assertRoughlyEquals(-0.761594155955765, Math.tanh(-1), 1e-15);
  },
});
