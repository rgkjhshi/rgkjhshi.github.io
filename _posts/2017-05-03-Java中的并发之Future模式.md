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

## FutureTask详解

JDK中`Future模式`的经典实现类为`FutureTask`, 它除了实现了`Future`接口外还实现了`Runnable`接口, 它的实现比我们简易版的实现要复杂一些

* `FutureTask`本身实现了`Future`(就像上面的`FutureData`), 我们执行了这个`FutureTask`之后, 想要获取结果可以使用`FutureTask.get()`来获取真实数据
* `FutureTask`自己实现了`Runnable`接口, 也就是说我们我们不用再另起线程来执行某任务了(就像`doSomething()`里做的), 可以直接使用`Thread`去启动这个`FutureTask`或者把它交给一个`ExecutorService`去执行.

### FutureTask的结构

`FutureTask`内部的主要成员如下:

~~~java
    /**
     * 任务的状态
     * 可能的状态转换:
     * NEW -> COMPLETING -> NORMAL
     * NEW -> COMPLETING -> EXCEPTIONAL
     * NEW -> CANCELLED
     * NEW -> INTERRUPTING -> INTERRUPTED
     */
    private volatile int state;
    private static final int NEW          = 0;  // 初始化的状态(包括任务未启动, 任务执行中, 任务刚跑完)
    private static final int COMPLETING   = 1;  // 完成中, 这是个过渡状态, 任务跑完了但是还没给outcome赋值
    private static final int NORMAL       = 2;  // 已完成
    private static final int EXCEPTIONAL  = 3;  // 运行中出现了异常
    private static final int CANCELLED    = 4;  // 已取消
    private static final int INTERRUPTING = 5;  // 正在中断
    private static final int INTERRUPTED  = 6;  // 已中断

    /** 可执行的任务, 即最后的结果是由它计算出来的; 运行结束后将被设置为null */
    private Callable<V> callable;
    /** 用于存放get()时要返回的结果或者异常 */
    private Object outcome;
    /** 执行callable的那个线程 */
    private volatile Thread runner;
    /** 用于存放等待任务结果的线程, 即调用get()的那些被阻塞的线程都用这个链表来保存, 以便于结果完成时把等待的线程唤醒 */
    private volatile WaitNode waiters;
~~~

### 构造方法

~~~java
    public FutureTask(Callable<V> callable) {
        if (callable == null)
            throw new NullPointerException();
        this.callable = callable;
        this.state = NEW;
    }
    public FutureTask(Runnable runnable, V result) {
        this.callable = Executors.callable(runnable, result);  // 把runnable转成了callable
        this.state = NEW;
    }
~~~

我们看到成员变量里只有一个`callable`, 而构造方法里传入`Runnable 或 Callable`都可以, 在构造方法里已经把`Runnable`转化成了`Callable`. 我们也可以这样声明一个不需要返回值的task: `Future<?> f = new FutureTask<Void>(runnable, null)`

### run方法
`run()`方法是真正执行任务获取最终数据的地方

~~~java
    public void run() {
        if (state != NEW ||  // 如果状态不是 NEW, 短路或就会直接返回, 只有状态 是NEW的时候才会执行后面的CAS
            !UNSAFE.compareAndSwapObject(this, runnerOffset, null, Thread.currentThread()))
            // 这句CAS的意思为 this.runner == null ? (this.runner = 当前线程, 然后返回true) : (返回 false)
            // CAS是一个原子操作, 整个if的意思是, 只有状态为NEW且头一回被线程执行(this.runner == null)才会把当前线程赋值给 this.runner
            return;
        try {
            Callable<V> c = callable;
            if (c != null && state == NEW) {
                V result;
                boolean ran;  // 是否正常运行完得到结果的标识
                try {
                    result = c.call();  // 处理过程, 获取最终结果的过程
                    ran = true;  // 虽然此时已经处理完了获取了result, 但在调用 set 之前state一直是NEW
                } catch (Throwable ex) { // 出了异常的情况
                    result = null;
                    ran = false;
                    setException(ex); // state状态变换 NEW -> COMPLETING -> EXCEPTIONAL
                }
                if (ran)
                    set(result);  // state状态变换 NEW -> COMPLETING -> NORMAL
            }
        } finally {
            // runner must be non-null until state is settled to
            // prevent concurrent calls to run()
            runner = null;
            // state must be re-read after nulling runner to prevent
            // leaked interrupts
            int s = state;
            if (s >= INTERRUPTING)
                handlePossibleCancellationInterrupt(s);
        }
    }
~~~
******
