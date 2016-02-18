---
layout: blog
title:  Guava之CharMatcher
date: 2015-11-21
category: 编程技术
tag: Guava
---
`CharMatcher`是字符匹配器, 代表着某一类字符, `CharMatcher`实现了`Predicate<Character>`接口  
`CharMatcher`提供了一系列方法，让你对字符作特定类型的操作：修剪[trim]、折叠[collapse]、移除[remove]、保留[retain]等  
`CharMatcher`只处理`char`类型代表的字符即`0x0000`~`0xFFFF`




*****

* TOC
{:toc}

*****

## 获取CharMatcher
CharMatcher中的常量可以满足大多数字符匹配需求

| 内置CharMatcher           | 说明                |
|--------------------------|---------------------|
| ANY                      | 任何字符都匹配        |
| NONE                     | 不匹配任何字符        |
| WHITESPACE               | 空白字符(Unicode标准)             |
| BREAKING_WHITESPACE      | 被空白隔开的两个词之间的那个空白, 比如两个单词之间的空白间隔 |
| INVISIBLE                | 不可见字符, 如LINE_SEPARATOR     |
| DIGIT                    | Unicode数字,比JAVA_DIGIT范围大,如果要表示0～9请用`inRange('0', '9')`  |
| JAVA_LETTER              |              |
| JAVA_DIGIT               | Java定义的数字,范围超过0~9,如果要表示0～9请用`inRange('0', '9')`  |
| JAVA_LETTER_OR_DIGIT     | JAVA_LETTER 或 JAVA_DIGIT |
| JAVA_UPPER_CASE          | 范围比a~z大             |
| JAVA_LOWER_CASE          |              |
| JAVA_ISO_CONTROL         |              |
| ASCII                    | ASCII码,这意味着它的代码点低于128      |
| SINGLE_WIDTH             |              |
| ZEROES                   |              |
| NINES                    |              |

获取字符匹配器的常见方法

* `is(final char match)`: 给定单一字符匹配
* `isNot(final char match)`: 不是某字符
* `anyOf(final CharSequence sequence)`: 枚举匹配字符,如`CharMatcher.anyOf(“aeiou”)`匹配小写英语元音
* `noneOf(CharSequence sequence)`: 不是sequence里的任意一个,anyOf的相反方法, 等同于`anyOf(sequence).negate()`
* `inRange(final char startInclusive, final char endInclusive)`: 给定字符范围匹配，如`CharMatcher.inRange(‘a’, ‘z’)`
* `or(CharMatcher other)`: 取并集
* `and(CharMatcher other)`: 取交集
* `negate(CharMatcher other)`: 取反

*****

## 使用字符匹配器
返回是否匹配(`boolean`)的方法:

* `boolean matchesAnyOf(CharSequence sequence)` : 是否sequence中有匹配的字符
* `boolean matchesAllOf(CharSequence sequence)` : 是否sequence中的所有字符都匹配
* `boolean matchesNoneOf(CharSequence sequence)` : sequence中不包含能够匹配的字符

返回`int`的方法:

* `int indexIn(CharSequence sequence)` : 返回第一次匹配上的下标, -1表示没有匹配的
* `int indexIn(CharSequence sequence, int start)` : >=start或-1
* `int lastIndexIn(CharSequence sequence)` : 最后一次匹配的下标, -1表示没有匹配的

返回匹配的内容(`String`)的方法:

* `String removeFrom(CharSequence sequence)` : 移除匹配字符,返回的是移除匹配字符之后剩下的
* `String retainFrom(CharSequence sequence)` : 保留匹配字符
* `String replaceFrom(CharSequence sequence, char replacement)` : 替代匹配字符
* `String replaceFrom(CharSequence sequence, CharSequence replacement)` :替代匹配字符
* `String trimFrom(CharSequence sequence)` : 移除前导和尾部的匹配字符
* `String trimLeadingFrom(CharSequence sequence)`: 只移除前导匹配的
* `String trimTrailingFrom(CharSequence sequence)`: 只移除尾部匹配的
* `String collapseFrom(CharSequence sequence, char replacement)`: 替换,但连续的匹配字符只替换一次
* `String trimAndCollapseFrom(CharSequence sequence, char replacement)`: 中间连续的只替换一次,开头和结尾的直接去掉

示例:

~~~java
CharMatcher.is('a').removeFrom("bazaar");  // "bzr"
CharMatcher.is('a').retainFrom("bazaar");  // "aaa"
CharMatcher.is('a').replaceFrom("radar", 'o'); // "rodor"
CharMatcher.is('a').replaceFrom("yaha", "oo"); // "yoohoo"
CharMatcher.anyOf("ab").trimFrom("abacatbab"); // "cat"
CharMatcher.inRange('\0', ' ').trimFrom(str); // 等同于 str.trim()
CharMatcher.anyOf("eko").collapseFrom("bookkeeper", '-') // "b-p-r"
~~~

*****
