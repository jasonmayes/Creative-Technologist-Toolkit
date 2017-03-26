/*
 * Copyright 2008 The Closure Compiler Authors.
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

package com.google.javascript.jscomp.deps;

import static com.google.common.truth.Truth.assertThat;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.javascript.jscomp.ErrorManager;
import com.google.javascript.jscomp.PrintStreamErrorManager;

import junit.framework.TestCase;

import java.util.List;

/**
 * Tests for {@link DepsFileParser}.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */
public final class DepsFileParserTest extends TestCase {

  private DepsFileParser parser;
  private ErrorManager errorManager;
  private static final String SRC_PATH = "/path/1.js";
  private static final List<String> EMPTY = ImmutableList.of();

  @Override
  public void setUp() {
    errorManager = new PrintStreamErrorManager(System.err);
    parser = new DepsFileParser(errorManager);
    parser.setShortcutMode(true);
  }

  /**
   * Tests:
   *  -Parsing of comments,
   *  -Parsing of different styles of quotes,
   *  -Parsing of empty arrays,
   *  -Parsing of non-empty arrays,
   *  -Correct recording of what was parsed.
   */
  public void testGoodParse() {
    final String contents = "/*"
        + "goog.addDependency('no1', [], []);*//*\n"
        + "goog.addDependency('no2', [ ], [ ]);\n"
        + "*/goog.addDependency('yes1', [], []);\n"
        + "/* blah */goog.addDependency(\"yes2\", [], [])/* blah*/\n"
        + "goog.addDependency('yes3', ['a','b'], ['c']); // goog.addDependency('no3', [], []);\n"
        + "// goog.addDependency('no4', [], []);\n"
        + "goog.addDependency(\"yes4\", [], [ \"a\",'b' , 'c' ]); //no new line at EOF";

    List<DependencyInfo> result = parser.parseFile(SRC_PATH, contents);
    ImmutableList<DependencyInfo> expected = ImmutableList.<DependencyInfo>of(
        new SimpleDependencyInfo("yes1", SRC_PATH, EMPTY, EMPTY, false),
        new SimpleDependencyInfo("yes2", SRC_PATH, EMPTY, EMPTY, false),
        new SimpleDependencyInfo(
            "yes3", SRC_PATH, ImmutableList.of("a", "b"), ImmutableList.of("c"),
            false),
        new SimpleDependencyInfo(
            "yes4", SRC_PATH, EMPTY, ImmutableList.of("a", "b", "c"), false)
    );

    assertThat(result).isEqualTo(expected);
    assertThat(errorManager.getErrorCount()).isEqualTo(0);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testTooFewArgs() {
    parser.parseFile(SRC_PATH, "goog.addDependency('a', []);");
    assertThat(errorManager.getErrorCount()).isEqualTo(1);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testTooManyArgs1() {
    parser.parseFile(SRC_PATH, "goog.addDependency('a', [], [], []);");
    assertThat(errorManager.getErrorCount()).isEqualTo(1);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testTooManyArgs2() {
    parser.parseFile(SRC_PATH, "goog.addDependency('a', [], [], false, []);");
    assertThat(errorManager.getErrorCount()).isEqualTo(1);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testTooManyArgs3() {
    parser.parseFile(SRC_PATH, "goog.addDependency('a', [], [], {}, []);");
    assertThat(errorManager.getErrorCount()).isEqualTo(1);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testBadLoadFlagsSyntax() {
    parser.parseFile(SRC_PATH, "goog.addDependency('a', [], [], {module: 'goog'});");
    assertThat(errorManager.getErrorCount()).isEqualTo(1);
    assertThat(errorManager.getWarningCount()).isEqualTo(0);
  }

  public void testModule() {
    List<DependencyInfo> result = parser.parseFile(SRC_PATH,
        "goog.addDependency('yes1', [], [], true);\n" +
        "goog.addDependency('yes2', [], [], false);\n");
    ImmutableList<DependencyInfo> expected = ImmutableList.<DependencyInfo>of(
        new SimpleDependencyInfo("yes1", SRC_PATH, EMPTY, EMPTY, true),
        new SimpleDependencyInfo("yes2", SRC_PATH, EMPTY, EMPTY, false)
        );
    assertThat(result).isEqualTo(expected);
  }

  public void testLoadFlags() {
    List<DependencyInfo> result = parser.parseFile(SRC_PATH, ""
        + "goog.addDependency('yes1', [], [], {'module': 'goog'});\n"
        + "goog.addDependency('yes2', [], [], {\"lang\": \"es6\"});\n"
        + "goog.addDependency('yes3', [], [], {});\n");
    ImmutableList<DependencyInfo> expected = ImmutableList.<DependencyInfo>of(
        new SimpleDependencyInfo("yes1", SRC_PATH, EMPTY, EMPTY, ImmutableMap.of("module", "goog")),
        new SimpleDependencyInfo("yes2", SRC_PATH, EMPTY, EMPTY, ImmutableMap.of("lang", "es6")),
        new SimpleDependencyInfo("yes3", SRC_PATH, EMPTY, EMPTY, false));
    assertThat(result).isEqualTo(expected);
  }

  public void testShortcutMode() {
    List<DependencyInfo> result = parser.parseFile(SRC_PATH,
        "goog.addDependency('yes1', [], []); \n" +
        "foo();\n" +
        "goog.addDependency('no1', [], []);");
    ImmutableList<DependencyInfo> expected = ImmutableList.<DependencyInfo>of(
        new SimpleDependencyInfo("yes1", SRC_PATH, EMPTY, EMPTY, false));
    assertThat(result).isEqualTo(expected);
  }

  public void testNoShortcutMode() {
    parser.setShortcutMode(false);
    List<DependencyInfo> result = parser.parseFile(SRC_PATH,
        "goog.addDependency('yes1', [], []); \n" +
        "foo();\n" +
        "goog.addDependency('yes2', [], []);");
    ImmutableList<DependencyInfo> expected = ImmutableList.<DependencyInfo>of(
        new SimpleDependencyInfo("yes1", SRC_PATH, EMPTY, EMPTY, false),
        new SimpleDependencyInfo("yes2", SRC_PATH, EMPTY, EMPTY, false));
    assertThat(result).isEqualTo(expected);
  }
}
