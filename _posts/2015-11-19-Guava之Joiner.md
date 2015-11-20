---
layout: blog
title:  Guava之Joiner
date: 2015-11-19
category: 编程技术
tag: Guava
---
`Joiner`在Guava的`com.google.common.base`包中, 算是字符处理工具, 其作用是连接多个元素, 可当作连接器来使用  





*****
## 生成`Joiner`的方法
工厂方法:
* `Joiner on(String separator)`
* `Joiner on(char separator)`

修饰方法:
* `Joiner useForNull(final String nullText)`
* `Joiner skipNulls()`

```java
Joiner.on("; ").skipNulls().join("Harry", null, "Ron", "Hermione"); // Harry; Ron; Hermione
```

**注意**: Joiner类是不可变的, 即它是线程安全的, 可以将其定义为`static final`常量  
像下面这样使用是 **错误** 的:

```java
Joiner joiner = Joiner.on(',');   // joiner 是不可变的
joiner.skipNulls();   // 这里返回了个新的Joiner, 原来的joiner并没变
joiner.join("wrong", null, "wrong"); // 这就直接报NullPointerException了, 原来的joiner没有skipNull功能
```

*****

## join 方法
返回连接之后的字符串, 返回的字符串都是`final`的:
* `public final String join(Iterable<?> parts)`
* `public final String join(Iterator<?> parts)`
* `public final String join(Object[] parts)`
* `public final String join(Object first, Object second, Object... rest)`

```java
Joiner.on(",").join(Arrays.asList(1, 5, 7)); // returns "1,5,7"
```
*****

## appendTo 方法
把后面的参数以字符串的方式添加到第一个参数后面  
`java.lang.Appendable`接口的子类(如`StringBuilder` `BufferedWriter`等), 都可以作为第一个参数

* `StringBuilder appendTo(StringBuilder builder, Iterable<?> parts)`
* `StringBuilder appendTo(StringBuilder builder, Iterable<?> parts)`
* `StringBuilder appendTo(StringBuilder builder, Object[] parts)`
* `StringBuilder appendTo(StringBuilder builder, Object first, Object second, Object... rest)`
* `<A extends Appendable> A appendTo(A appendable, Iterable<?> parts)`
* `<A extends Appendable> A appendTo(A appendable, Iterator<?> parts)`
* `<A extends Appendable> A appendTo(A appendable, Object[] parts)`
* `<A extends Appendable> A appendTo(A appendable, Object first, Object second, Object... rest)`

```java
Joiner.on(",").appendTo(new StringBuilder("list:"), Arrays.asList(1, 2, 3)).toString(); // list:1,2,3
```
*****

## MapJoiner
Joiner提供了个方法返回内部类`Joiner.MapJoiner`专门用于处理map  
* `MapJoiner withKeyValueSeparator(String keyValueSeparator)`

```java
Map<String, Integer> map = Maps.newHashMap();
map.put("a", 1);
map.put("b", 2);
Joiner.on(";").withKeyValueSeparator("->").join(map); // b->2;a->1
```

*****
