---
layout: blog
title:  Collection整理
date: 2015-11-12
category: 编程技术
tag: Java
---
Java中Collection的继承关系图, 虚线表示接口, 实线表示类




*****

* any list
{:toc}

*****

## Collection继承关系图

![Collection继承关系图]({{ "/static/images/collection.png" | prepend: site.baseurl }} "Collection结构图")

******

## Collection基本操作

* `int size()`: 返回集合大小
* `boolean isEmpty()`: 是否为空
* `Iterator<E> iterator()`: 返回迭代器
* `Object[] toArray()`: 把集合转成数组
* `<T> T[] toArray(T[] a)`: 这个腹黑的方法详细说明看[这里]({{ "/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2015-11-12-Collection%E7%9A%84toArray%E6%96%B9%E6%B3%95.html" | prepend: site.baseurl }})
* `boolean contains(Object o)`: 是否包含该对象
* `boolean containsAll(Collection<?> c)`: 包含c里的全部元素则返回true
* `boolean add(E e)`: 添加成功改变了集合则返回true
* `boolean addAll(Collection<? extends E> c)`: 全部添加
* `boolean remove(E e)`: 移除元素
* `boolean removeAll(Collection<?> c)`: 相当于减集合c
* `boolean retainAll(Collection<?> c)`: 相当于求与c的交集
* `void clear()`: 清空集合

## Set接口

* Set不允许包含相同的元素, 而判断两个对象是否相同则是根据`equals`方法
* `HashSet`不是同步的, 不能保证元素的排列顺序, 注意`hashCode`方法的实现
* `LinkedHashSet`根据元素的`hashCode`值来决定元素的存储位置，但它同时使用链表维护元素的次序
* `TreeSet`是`SortedSet`接口的实现类, 有顺序, 可自定义比较器(`Comparator`),有`first、last、lower、higher`等方法

## List接口
`List`是经常用到的工具, 是有序集合, 增加了与索引位置相关的操作:

* `E get(int index)`: 获取指定位置的元素
* `E set(int index, E element)`: 替换指定位置的元素
* `void add(int index, E element)`: 将元素添加到指定位置
* `boolean addAll(int index, Collection<? extends E> c)`: 将c里的元素添加到指定位置
* `E remove(int index)`: 移除指定位置的元素
* `int indexOf(Object o)`: o在list中第一次出现的位置
* `int lastIndexOf(Object o)`: o在list中最后一次出现的位置
* `List<E> subList(int fromIndex, int toIndex)`: 子list

### ArrayList和Vector
`ArrayList`是线程不安全的,而`Vector`是线程安全的  

### Stack
`Stack`是`Vector`的子类,模拟数据结构中的栈,有下面几个操作:

* `E push(E item)`: 压栈
* `E pop()`: 出栈
* `E peek()`: 查看栈顶元素, 不出栈
* `boolean empty()`: 判断栈空
* `int search(Object o)`: 返回元素位置, 栈顶元素是1, －1表示栈里没有

## Queue接口
`Queue`用于模拟队列这种数据结构，实现先进先出"FIFO"等数据结构,常用如下操作:

* `boolean add(E e)`: 不建议使用
* `boolean offer(E e)`: 将指定元素插入队尾列,当使用有容量限制的队列时,此方法通常要优于`add(E)`,
后者可能无法插入元素，而只是抛出一个异常。**推荐使用此方法取代add**
* `boolean remove()`: 不建议使用
* `boolean poll()`: 获取头部元素并且删除元素，队列为空返回null;**推荐使用此方法取代remove**
* `boolean element()`: 返回队首元素, 队空抛`NoSuchElementException`
* `boolean peek()`: 返回队首元素, 队空返回`null`

### PriorityQueue类
`PriorityQueue`类中元素的顺序不是按照加入的顺序排列的, 而是按队列元素的优先级重新排序,
调用`peek()`或者是`poll()`方法时，返回的是队列中优先级最小的元素, 可以自定义排序.

### Deque接口与ArrayDeque类
`Deque`代表一个双端队列，可以当作一个双端队列使用，也可以当作“栈”来使用，因为它包含出栈`pop()`与入栈`push()`方法

* `void addFirst(E e)`: 元素增加至队头, 超容量抛异常
* `void addLast(E e)`: 元素增加至队尾, 超容量抛异常
* `boolean offerFirst(E e)`: 元素增加至队头, 比add安全
* `boolean offerLast(E e)`: 元素增加至队尾, 比add安全
* `E removeFirst()`: 获取并删除队头元素, 队空抛`NoSuchElementException`
* `E removeLast()`: 获取并删除队尾元素, 队空抛`NoSuchElementException`
* `E pollFirst()`: 获取并删除队头元素, 队空返回`null`
* `E pollLast()`: 获取并删除队尾元素, 队空返回`null`
* `E getFirst()`: 获取队头元素, 但不删除, 队空抛`NoSuchElementException`
* `E getLast()`: 获取队头元素, 但不删除, 队空抛`NoSuchElementException`
* `E peekFirst()`: 获取队头元素, 但不删除, 队空返回`null`
* `E peekLast()`: 获取队头元素, 但不删除, 队空返回`null`
* `void push(E e)`: 元素增加至队头, 类似`offerFirst`
* `E pop()`: 元素增加至队头, 类似`pollFirst`

### LinkedList
`LinkedList`类同时实现了`List`接口和`Deque`接口, 因此它也可以当做一个双端队列来用, 也可以当作“栈”来使用.  
它基于链表实现, 随机访问性能较差, 但插入与删除操作性能很好


*****
