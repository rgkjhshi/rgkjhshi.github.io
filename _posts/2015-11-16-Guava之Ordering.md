---
layout: blog
title:  Guava之Ordering
date: 2015-11-16
category: 编程技术
tag: Guava
---
guava的collection包里有个`Ordering`抽象类实现了`java.util.Comparator`接口  
`Comparator`就俩方法`int compare(T o1, T o2);`和`boolean equals(Object obj);`  
`Ordering`提供了更多的方法来完成集合排序的功能



*****

## 静态方法

* `Ordering<C> natural()`: 返回自然顺序的比较器, 如数字按大小，日期按先后
* `Ordering<T> from(Comparator<T> comparator)`: 把给定的Comparator转化为排序器
* `Ordering<Object> usingToString()`: 按对象的字符串形式做字典排序
* `Ordering<T> compound(Iterable comparators)`: 合成多个比较器, 类似于实例方法的那个
* `Ordering<Object> allEqual()`: 返回一个认为全都相等的比较器, 相当于没有排序.
它的意义在于返回一个比较器, 这样就可以使用一些实例方法了, 从而进行链式比较,
比如:`Ordering.allEqual().nullsLast().sortedCopy(asList(t, null, e, s, null, t, null))}`

*****

## 实例方法:链式调用

* `Ordering<S> reverse()`: 返回反序比较器
* `Ordering<S> nullsFirst()`: 使用当前排序器, 但额外把`null`放到最前面
* `Ordering<S> nullsLast()`: 使用当前排序器, 但额外把`null`放到最后面
* `Ordering<U> compound(Comparator second)`: 合成比较器, 先按原来排序，然后按second排序
* `Ordering<F> onResultOf(Function<F, T> function)`: 对集合中元素调用Function，再按返回值用当前排序器排序.

看下面这个链式调用的例子, 应该从后往前读, 先调用apply方法获取Foo的name值, 在把null放前面, 再对剩下的按照name的自然顺序进行排序

~~~java
Ordering<Foo> ordering = Ordering.natural().nullsFirst().onResultOf(new Function<Foo, String>() {
    public String apply(Foo foo) {
        return foo.getName;
    }
});
~~~

*****

## 实例方法:操作集合元素的方法
注:后面说的大小是指排序的前后

### `min()`: 返回最小的那个元素, 重载方法有
* `E min(Iterator<E> iterator)`: 迭代器空则抛出`NoSuchElementException`
* `E min(Iterable<E> iterable)`
* `E min(E a, E b)`: 相等则返回第一个
* `E min(E a,  E b, E c, E... rest)`: 多个最小则返回第一个最小的

### `max()`: 返回最大的那个元素, 重载方法有
* `E max(Iterator<E> iterator)`
* `E max(Iterable<E> iterable)`
* `E max(E a, E b)`
* `E max(E a,  E b, E c, E... rest)`

### `leastOf()`: 返回最小的k个元素的列表, 不足k个则都返回
* `List<E> leastOf(Iterable<E> iterable, int k)`
* `List<E> leastOf(Iterator<E> elements, int k)`

### `greatestOf()`: 返回最大的k个元素的列表, 不足k个则都返回
* `List<E> greatestOf(Iterable<E> iterable, int k)`
* `List<E> greatestOf(Iterator<E> elements, int k)`

### 判断是否已经按照排序器排过序
* `boolean isOrdered(Iterable iterable)`: 允许有排序值相等的元素
* `boolean isStrictlyOrdered(Iterable iterable)`: 严格递增, 不允许有相等的

### 返回排序好的list
* `List<E> sortedCopy(Iterable<E> elements)`: 返回可变的已经排好序的list
* `ImmutableList<E> immutableSortedCopy(Iterable<E> elements)`: 返回不可变的已经排好序的list


*****
