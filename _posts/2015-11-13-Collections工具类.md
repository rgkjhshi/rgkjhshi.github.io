---
layout: blog
title:  Collections工具类
date: 2015-11-13
category: 编程技术
tag: Java
---
JDK的Collections类中提供了大量对Collection和Map的操作,网上资料整理记录下来





******

## 排序操作(主要对List)

* `void sort(List list)`: 对List里的元素根据自然升序排序
* `void sort(List list, Comparator c)`: 自定义比较器排序
* `void reverse(List list)`: 反转指定List集合中元素的顺序
* `void shuffle(List list)`: 打乱List中元素的顺序(重新洗牌)
* `void swap(List list, int i, int j)`: 交换list中的两个元素
* `void swap(Object[] arr, int i, int j)`: 交换数组中的两个元素
* `void rotate(List list, int distance)`: 所有元素循环右移distance位, distance=size则相当于没变

******

## 查找和替换(主要对Collection接口)

* `int binarySearch(List list, T key)`: 二分搜索法, 返回对象在List中的索引, 前提是集合已经排序
* `void fill(List list, T obj)`: 填充对象
* `boolean replaceAll(List list, T oldVal, T newVal)`: 替换, 返回是否含有要替换的元素
* `T min(Collection coll)`: 返回最小元素
* `T min(Collection coll, Comparator comp)`: 根据自定义比较器，返回最小元素
* `T max(Collection coll)`: 返回最大元素
* `T max(Collection coll, Comparator comp)`: 根据自定义比较器，返回最大元素
* `int frequency(Collection c, Object o)`: 返回指定对象在集合中出现的次数

******

## 其他操作

* `boolean addAll(Collection c, T... elements)`: 把elements添加到集合里
* `Comparator reverseOrder()`: 返回自然顺序的反序比较器
* `Comparator reverseOrder(Comparator cmp)`: 返回cmp的逆序比较器, 若cmp为null则等同于`reverseOrder()`

*****
