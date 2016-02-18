---
layout: blog
title:  Guava之Objects
date: 2015-11-10
category: 编程技术
tag: Guava
---
`Objects`在Guava的`com.google.common.base`包中  
JDK7已经把Objects收录在了`java.util.Objects`里, 现在可以直接用啦





*****

* TOC
{:toc}

*****

## equals
看实现代码， 不用担心空指针了

~~~java
public static boolean equals(Object a, Object b) {
    return (a == b) || (a != null && a.equals(b));
}
~~~

*****

## hashCode和hash
首先`hashCode(Object o)`不用担心空指针
~~~java
public static int hashCode(Object o) {
    return o != null ? o.hashCode() : 0;
}
~~~
另外还有个`hash(Object... values)`方法非常好用，可以传多个对象进去得到hash值, 比如可以这样用:  
`Objects.hashCode(field1, field2, ..., fieldn)`  
来个例子:

~~~java
    Objects.hash("a", "b"); // 4066
    Objects.hash("b", "a"); // 4096
~~~

*****

## toString
有两个方法`toString(Object o)`和`toString(Object o, String nullDefault)`, 代码如下:

~~~java
// 如果传null则返回字符串"null"
public static String toString(Object o) {
    return String.valueOf(o);
}
// 这个可以自己指定为null时返回什么
public static String toString(Object o, String nullDefault) {
    return (o != null) ? o.toString() : nullDefault;
}
~~~

*****

## requireNonNull
还有两个判空方法

~~~java
// 直接抛空指针异常
public static <T> T requireNonNull(T obj) {
    if (obj == null)
        throw new NullPointerException();
    return obj;
}
// 可以自定义异常描述
public static <T> T requireNonNull(T obj, String message) {
    if (obj == null)
        throw new NullPointerException(message);
    return obj;
}
~~~

*****
