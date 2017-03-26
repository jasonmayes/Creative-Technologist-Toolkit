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

goog.module('NestingTestModule');
goog.setTestOnly();


var testSuite = goog.require('goog.testing.testSuite');
var Inner = goog.require('nesting.Outer.Inner');
var Outer = goog.require('nesting.Outer');


testSuite({
  test_Main: function() {
    var inner = new Inner();
    assert(inner instanceof Inner);
    var outer = new Outer();
    assert(outer instanceof Outer);
  }
});
