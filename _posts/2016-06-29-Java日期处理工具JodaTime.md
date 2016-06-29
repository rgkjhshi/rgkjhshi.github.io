---
layout: blog
title:  Java日期处理工具JodaTime
date:   2016-06-29
category: 编程技术
tag: Java
---
主要是介绍下有这么一个好用的工具包, 简单写几个使用的例子




*****

* TOC
{:toc}

*****

## maven依赖

~~~xml
<dependency>
    <groupId>joda-time</groupId>
    <artifactId>joda-time</artifactId>
    <version>2.9.4</version>
</dependency>
~~~

*****

## 使用示例

最常用的一个类就是`DateTime`类, 它有很多构造方法和时间的操作方法

~~~java
    public static void main(String[] args) {
        DateTime dateTime;
        // 创建当前时间
        dateTime = DateTime.now();
        // 创建某一时刻的时间
        dateTime = new DateTime(2016, 6, 6, 12, 1, 1, 999);
        // 通过系统毫秒数创建当前时间
        dateTime = new DateTime(System.currentTimeMillis());

        // 与JDK 的 Date 相互转换
        dateTime = new DateTime(new Date());
        Date jdkDate = dateTime.toDate();

        // 默认输出格式
        System.out.println(dateTime.toString()); // 2016-06-29T15:36:41.591+08:00
        // 格式化输出
        System.out.println(dateTime.toString("yyyy-MM-dd HH:mm:ss.SSS")); // 2016-06-06 12:01:01.999
        // 输出星期几
        System.out.println(dateTime.toString("E yyyy-MM-dd HH:mm:ss")); // 星期三 2016-06-29 15:38:47

        // 时间操作, 注意每个返回都是一个新对象
        // 33天后
        dateTime = new DateTime(2016, 1, 1, 12, 10, 10, 10);  // 2016-01-01 12:10:10.010
        dateTime = dateTime.plusDays(33);  // 2016-02-03 12:10:10.010
        // 年月日时分秒 还有毫秒, 都能加

        // 某月最后一天
        dateTime = new DateTime(2016, 1, 1, 12, 10, 10, 10);  // 2016-01-01 12:10:10.010
        dateTime = dateTime.dayOfMonth().withMaximumValue();  // 2016-01-31 12:10:10.010

        // 某周第一天
        dateTime = new DateTime(2016, 1, 1, 12, 10, 10, 10);  // 2016-01-01 12:10:10.010
        dateTime = dateTime.dayOfWeek().withMinimumValue();   // 2015-12-28 12:10:10.010
        // 类似的有 yearOfCentury dayOfYear monthOfYear dayOfMonth dayOfWeek
    }
~~~

其实创建`DateTime`对象时也能传`ISODateTimeFormat`格式化的字符串, 如:"2006-01-26T13:30:00-06:00", 但要确保给出的字符串格式正确, 可以参考[Joda API文档](http://joda-time.sourceforge.net/api-release/index.html)


*****
