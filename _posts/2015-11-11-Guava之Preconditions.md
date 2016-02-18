---
layout: blog
title:  Guava之Preconditions
date: 2015-11-11
category: 编程技术
tag: Guava
---
`Preconditions`用于各种条件检查, 在Guava的`com.google.common.base`包中  
它提供了几个静态方法, 不满足条件时会抛出异常




*****

* any list
{:toc}

*****

## checkNotNull
函数声明: `public static <T> T checkNotNull(T reference)`  
函数功能: 检查参数不为空, 否则抛出`NullPointerException`  
应用场景: 判断对象不为null  
有三个重载函数
* checkNotNull(T reference)
* checkNotNull(T reference, Object errorMessage)
* checkNotNull(T reference, String errorMessageTemplate, Object... errorMessageArgs)

第二个可自定义错误描述，第三个可以使用模板,如`("Age is %s", 18)`等

*****

## checkArgument
函数声明: `public static void checkArgument(boolean expression)`  
函数功能: 检查参数表达式是否为true, 为false时抛出`IllegalArgumentException`  
应用场景: 判断表达式真假, 如`age > 18`  
同样有三个重载函数

*****

## checkState
函数声明: `public static void checkState(boolean expression)`  
函数功能: 检查参数不为空, 否则抛出`IllegalStateException`  
应用场景: 判断表达式真假, 常用于不依赖参数的判断, 如`Iterator.next()`  
同样有三个重载函数

*****

## checkElementIndex
函数声明: `public static int checkElementIndex(int index, int size)`  
函数功能: 检查index范围属于[0, size), 否则抛出`IndexOutOfBoundsException`  
应用场景: 一个List只传入`list.size()`和要判断的下标即可  
有两个重载函数:
* checkElementIndex(int index, int size)
* checkElementIndex(int index, int size, String desc)

第二个可以自己写描述, 如传入的是(5, 3, "index")描述将是"index (4) must not be greater than size (3)"  
第一个默认是"index"的描述

*****

## checkPositionIndex
函数声明: `public static int checkPositionIndex(int index, int size)`  
函数功能: 检查index范围属于[0, size], 否则抛出`IndexOutOfBoundsException`  
应用场景: 我还在想  
也有有两个重载函数同上

*****

## checkPositionIndexes
函数声明: `public static void checkPositionIndexes(int start, int end, int size)`  
函数功能: 检查 start和end属于[0, size]且start<=end, 否则抛出`IndexOutOfBoundsException`  

*****
