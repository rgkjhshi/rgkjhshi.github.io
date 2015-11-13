---
layout: blog
title:  Collection的toArray方法
date: 2015-11-12
category: 编程技术
tag: Java
---
Java中Collection的有两个toArray方法:`Object[] toArray()`和`<T> T[] toArray(T[] a)`  
后面那个范型方法略难懂, 整理时发现些比较屌的地方,记录下来



******
`<T> T[] toArray(T[] a)`方法在抽象类`AbstractCollection`中有个实现  
该方法也是把集合转成数组, 你可以指定转成什么类型的数组,若转换的类型与集合中元素类型不一样,会抛`ArrayStoreException`.  
关于参数的写法上, 这个数组a可以是空的, 也可以不空, 会有不同的效果, 看下面代码:

```java
// 先创建一个集合
Set<String> set = new HashSet<String>(5);
// 可以这么写, 长度为0, 只表示转成什么类型, 在内部还会创建一个长度为5的数组
String[] array = set.toArray(new String[0]);
// 也可以这么写, 长度是集合的size, 在内部会把集合里的元素放到这个传参时创建的数组
String[] array = set.toArray(new String[set.size()]);
// 还可以这么写, 长度大于集合的size, 在内部会把集合里的元素放到这个传参时创建的数组, 后面多出来的3(8-5)个位置填充null
String[] array = set.toArray(new String[8]);
// 无论哪种方式, 如果传入的类型与即集合里元素的类型不匹配, 就会抛出ArrayStoreException
```
仔细看下JDK1.7的源码, 发现也很腹黑:
```java
public <T> T[] toArray(T[] a) {
    int size = size();
    T[] r = a.length >= size ? a : (T[])java.lang.reflect.Array.newInstance(a.getClass().getComponentType(), size);
    Iterator<E> it = iterator();
    for (int i = 0; i < r.length; i++) {
        if (! it.hasNext()) {
            if (a == r) {
                r[i] = null;
            } else if (a.length < i) {           // 仔细想了下, 貌似这俩else分支根本不会被执行
                return Arrays.copyOf(r, i);
            } else {                             // 但人家可是JDK里的源码呀, 不可能出错吧!
                System.arraycopy(r, 0, a, 0, i);
                if (a.length > i) {
                    a[i] = null;
                }
            }
            return a;
        }
        r[i] = (T)it.next();
    }
    return it.hasNext() ? finishToArray(r, it) : r;
}
```
代码里注释中提的问题我想了好久, 我考虑的情况都是正常情况, 在并发环境中, 集合里的元素有可能会被其他线程remove掉,
这就造成了iterator迭代出的元素个数小于size的情况, 注释里的那俩else就会被执行到了!  
 JDK源码写的还真是考虑周到啊...

*****
