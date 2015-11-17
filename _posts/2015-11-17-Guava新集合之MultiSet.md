---
layout: blog
title:  Guava新集合之MultiSet
date: 2015-11-17
category: 编程技术
tag: Guava
---
guava的collection包里新增加了几个集合类型非常实用  



*****
## Multiset
`Multiset`继承自`Collection`, 类似于`Set`, 里面的元素是无顺序的, 但不同的是它可以多次添加相等的元素, 并能记录每个元素的个数.
Multiset {a, a, b}和{a, b, a}是相等的, `Multiset`类似于但绝不等同于`Map<E, Integer>`.  
[Collection中的方法]({{ "/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2015-11-12-Collection%E6%95%B4%E7%90%86.html" | prepend: site.baseurl }})`Multiset`都有, 注意`size()`方法, 重复的元素也会算个数(类似的其它方法也会包含重复元素)   
除此之外`Multiset`接口中定义的方法有:
* `int count(Object element)`: 返回给定元素的计数
* `int add(E element, int occurrences)`: 添加元素并指定元素个数; 返回添加之前该元素的个数, 一般为0
* `int remove(Object element, int occurrences)`: 移除元素, 若该元素个数小于指定个数,则全移除; 返回操作之前该元素的个数
* `int setCount(E element, int count)`: 设定某一个元素的重复次数, 相当于add和remove的组合体; 返回操作之前该元素的个数
* `boolean setCount(E element, int oldCount, int newCount)`: 将符合原有重复个数的元素修改为新的重复次数, 原来个数不为oldCount不会修改
* `Set<E> elementSet()`: 返回仅包含不同元素的set
* `Set<Entry<E>> entrySet()`: 返回Set<Multiset.Entry>, 包含的Entry支持使用`getElement()`和`getCount()`

*****

### 返回排序好的list
* `List<E> sortedCopy(Iterable<E> elements)`: 返回可变的已经排好序的list
* `ImmutableList<E> immutableSortedCopy(Iterable<E> elements)`: 返回不可变的已经排好序的list


*****
