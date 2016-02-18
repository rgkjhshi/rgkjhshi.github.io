---
layout: blog
title:  Guava之Splitter
date: 2015-11-20
category: 编程技术
tag: Guava
---
`Splitter`相当于拆分器,跟[Joiner]({{ "/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2015-11-19-Guava%E4%B9%8BJoiner.html" | prepend: site.baseurl }})正好是相反的操作





*****

## 生成 Splitter 的方法
工厂方法:

* `Splitter on(char separator)`
* `Splitter on(final CharMatcher separatorMatcher)`
* `Splitter on(final String separator)`
* `Splitter on(final Pattern separatorPattern)`: 支持正则
* `Splitter onPattern(String separatorPattern)`: 等效于`Splitter.on(Pattern.compile(pattern))`
* `Splitter fixedLength(final int length)`: 每length个元素分成一组

修饰方法:

* `Splitter omitEmptyStrings()`
* `Splitter limit(int limit)`
* `Splitter trimResults()`
* `Splitter trimResults(CharMatcher trimmer)`

示例:

~~~java
Splitter.on(',').split("foo,,bar");  // ["foo", "", "bar"]
Splitter.on(CharMatcher.anyOf(";,")).split("foo,;bar,quux"); // ["foo", "", "bar", "quux"]
Splitter.on(", ").split("foo, bar,baz"); // ["foo", "bar,baz"]
Splitter.on(Pattern.compile("\\d+")).split("a12b3c"); // [a, b, c]
Splitter.fixedLength(2).split("abcde"); // ["ab", "cd", "e"]
Splitter.on(',').limit(3).split("a,b,c,d"); // ["a", "b", "c,d"]
Splitter.on(',').limit(3).omitEmptyStrings().split("a,,,b,,,c,d"); // ["a", "b", "c,d"]
Splitter.on(',').limit(3).trimResults().split(" a , b , c , d "); // ["a", "b", "c , d"]
Splitter.on(',').trimResults(CharMatcher.is('_')).split("_a ,_b_ ,c__"); // ["a ", "b_ ", "c"]
~~~

*****

## split 方法

* `Iterable<String> split(final CharSequence sequence)`
* `List<String> splitToList(CharSequence sequence)`

*****

## MapSplitter
Splitter提供了个方法返回内部类`Splitter.MapSplitter`专门分割成map

* `MapSplitter withKeyValueSeparator(String separator)`
* `MapSplitter withKeyValueSeparator(char separator)`
* `MapSplitter withKeyValueSeparator(Splitter keyValueSplitter)`

注意: `MapSplitter`的`split`方法返回的是`Map<String, String>`

~~~java
Map<String, String> map = Splitter.on("&").withKeyValueSeparator("=").split("a=1&b=2&c=3");
~~~

*****
