---
layout: blog
title:  ConcurrentHashMap详解
date: 2017-05-14
category: 编程技术
tag: Java
---
`HashMap`是非线程安全的, 对应的线程安全版本是`HashTable`, 但`HashTable`加锁的粒度大,`synchronized`是针对整个哈希表的, 效率低. 后来`JDK1.5`出现了`ConcurrentHashMap`, 通过引入`Segment`进行分段加锁, 从而提高并发效率.



*****

* TOC
{:toc}

*****

## 存储结构
`HashMap`的数据结构是数组加链表的形式。结构大体如下:

![ConcurrentHashMap结构图]({{ "/static/images/ConcurrentHashMap.png"  | prepend: site.baseurl }} "ConcurrentHashMap结构图")

可以看出`ConcurrentHashMap`有点像把`HashTable`又包了一层, 把`table`放到了`segments`里, 这样同步锁是在每一个`segment`里的, 只要多个修改操作发生在不同的段上, 它们就可以并发进行. 我们为了区分, 把每个元素`segment`成为`段`(有的文章里称作`桶`), 把`segment`里面的`table`的单个元素成为`桶`.

我们来看看`Segment`的结构, 跟`HashMap`里的结构非常类似:

~~~java
    static final class Segment<K,V> extends ReentrantLock implements Serializable {
        transient volatile HashEntry<K,V>[] table; // 桶, 除了类型, 其他跟HashMap里的table一样
        transient int count;     // HashEntry的总个数, 对应HashMap里的size
        transient int modCount;  // 同HashMap
        transient int threshold; // 同HashMap
    }
~~~

*****

## 需要知道的概念
`ConcurrentHashMap`比`HashMap`多了一层, 新增了几个概念:

* `segments`: 一个数组, 可称为`段`, 该数组的大小总是`2的n次幂`, 默认是16
* `concurrencyLevel`: 并发等级, 实际上就是`segments`数组的大小, 一旦确定就不再改变, 扩容时不会增加Segment的数量, 而只会增加`Segment`中链表数组(`table`)的容量大小
* `segmentShift`: 假设`segments`的大小是`2的n次方`, 则`segmentShift = 32-n`
* `segmentMask`: 用于计算在`segments`中下标的掩码, 假设`segments`的大小是`2的n次方`, 则`segmentMask = 2的n次方-1`

******

## 构造方法
`ConcurrentHashMap`有重载了5个构造方法, 实现都是类似的, 直接从代码中解释

~~~java
    public ConcurrentHashMap(int initialCapacity, float loadFactor, int concurrencyLevel) {
       if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
           throw new IllegalArgumentException();
       if (concurrencyLevel > MAX_SEGMENTS)
           concurrencyLevel = MAX_SEGMENTS;
       // Find power-of-two sizes best matching arguments
       int sshift = 0;
       int ssize = 1;
       while (ssize < concurrencyLevel) {
           ++sshift;     // 移位的次数
           ssize <<= 1;  // segments的size, 数值上为大于等于concurrencyLevel的最小的那个 2的n次幂
       }
       this.segmentShift = 32 - sshift;
       this.segmentMask = ssize - 1;
       if (initialCapacity > MAXIMUM_CAPACITY)
           initialCapacity = MAXIMUM_CAPACITY;
       int c = initialCapacity / ssize;
       if (c * ssize < initialCapacity)
           ++c;
       int cap = MIN_SEGMENT_TABLE_CAPACITY;
       while (cap < c)
           cap <<= 1;
       // create segments and segments[0]
       Segment<K,V> s0 =
           new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                            (HashEntry<K,V>[])new HashEntry[cap]);
       Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
       UNSAFE.putOrderedObject(ss, SBASE, s0); // ordered write of segments[0]
       this.segments = ss;
   }
~~~

******
