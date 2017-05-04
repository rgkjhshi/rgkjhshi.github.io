---
layout: blog
title:  Java中的并发之Future模式
date: 2017-05-03
category: 编程技术
tag: Java
---
Java的多线程编程中经常用到`Future模式`, 本文就简单介绍下`Future模式`



*****

* TOC
{:toc}

*****

## Future模式
`Future模式`的核心在于: 去除了主函数的等待时间，使原本需要等待的时间段可以用于处理其他业务逻辑.  
`Future模式`的关键在于: 返回的数据并不是真实的处理结果`RealData`, 而是一个代理数据`FutureData`, 当调用代理数据的`get`方法时(`FutureData.get()`), 会阻塞等待获取真实数据`RealData`.

下面实现一个简易版的`Future模式`, 这个例子很好的说明了`Future.get()`时的阻塞的形成原理

~~~java
/**
 * FutureData实际上是真实数据RealData的代理, 封装了获取RealData的等待过程
 */
public class FutureData<V> implements Future<V> {
    private V realData = null;        // FutureData是realData的封装
    private boolean isReady = false;  // 是否已经准备好

    public synchronized void setRealData(V realData) {
        if (isReady)
            return;
        this.realData = realData;
        isReady = true;
        notifyAll();  // realData已经被注入到FutureData中, 通知get()方法(因为get方法里在等待锁)
    }

    @Override
    public synchronized V get() throws InterruptedException {
        if (!isReady) {
            wait();  //一直等到realData注入到FutureData中
        }
        return realData;
    }
    // Future的其他接口略...
}
~~~

要使用我们自己实现的简易版`Future模式`, 我们需要一个在一个方法里加工一些数据并最后返回我们的`FutureData`

~~~java
    public Future doSomething() {
        final FutureData futureData = new FutureData();
        // 假设生成realData的过程特别慢, 所以放在单独的线程中运行
        new Thread(new Runnable() {
            @Override
            public void run() {
                String realData = "假设生成realData的过程特别慢"
                futureData.setRealData(realData);
            }
        }).start();
        return futureData; // 直接返回FutureData
    }
~~~

这样当我们调用`Future futureData = doSomething()`来处理数据的时候, 要加工的数据特别慢, 我们直接返回了`FutureData`, 所以在调用`doSomething()`的线程里并不被阻塞, 这个线程可以去做其他事情, 只有当这个线程通过`futureData.get()`时, 线程才会被阻塞, 直到返回`realData`.

******

## JDK中的Future模式: FutureTask

JDK中`Future模式`的经典实现类为`FutureTask`, 它除了实现了`Future`接口外还实现了`Runnable`接口, 它的实现比我们简易版的实现要复杂的多, 我们这里简单介绍下它的独特之处

******
