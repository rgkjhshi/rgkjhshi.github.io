---
layout: blog
title:  Guava之Optional
date: 2015-11-11
category: 编程技术
tag: Guava
---
`Optional`用于处理有可能为`null`的情况,在Guava的`com.google.common.base`包中  
`Optional`是一个抽象类，有两个`final`的子类:`Present`和`Absent`  
使用的时候直接用`Optional`即可, 不用关心`Present`和`Absent`



*****

* TOC
{:toc}

*****

## 静态方法
`Optional`有三个常用的静态方法:  

1. Optional.of(T reference): 返回的是一个`Present`对象, 表示不能为`null`, 当`reference`为`null`时直接抛`NullPointerException`  
2. Optional.absent(): 返回的是一个`final`的`Absent`对象, 表示`null`
3. Optional.fromNullable(T nullableReference): 返回的可能是`Present`或者`Absent`, 表示对象肯能为`null`, 即参数为`null`时等同于`absent()`  

*****

## 实例方法

1. boolean isPresent( ): Optional包含的T实例不为`null`，则返回true
2. T get( ): 返回包含实例, 若包含的实例为`null`则抛出`IllegalStateException`异常
3. T or(T defaultValue): `a.or(b)`a不为null返回a, 否则返回b, b为`null`时抛出`NullPointerException`
4. T orNull( ): `a.orNull()`a不为null返回a, 否则返回null, 逆操作是`fromNullable()`


*****
