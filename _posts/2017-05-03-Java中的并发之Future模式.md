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
    // WaitNode 类定义
    static final class WaitNode {
        volatile Thread thread;
        volatile WaitNode next;
        WaitNode() { thread = Thread.currentThread(); }
    }

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


### set方法
不管是`set()`还是`setException()`, 都大同小异, 他们两个都调用了`finishCompletion()`方法

~~~java
    protected void set(V v) {
        if (UNSAFE.compareAndSwapInt(this, stateOffset, NEW, COMPLETING)) {  // 这里状态变成 COMPLETING
            outcome = v; // 把结果放在 outcome(出现异常时, 异常也放在outcome)
            UNSAFE.putOrderedInt(this, stateOffset, NORMAL); // 把state改成NORMAL, 但不保证立即改过来(可理解为延时生效, 即不保证修改立即可见)
            finishCompletion();
        }
    }
    // 这个方法很重要, 它用来唤醒所有的阻塞线程
    private void finishCompletion() {
        // 外层是个循环, 很有必要
        for (WaitNode q; (q = waiters) != null;) {
            // 代码执行到这里是有可能产生 q != waiters 的情况的, 比如刚进入循环, 又有个地方因调用future.get()
            // 而被加入到阻塞链表里, 这时if就不满足了, 所以外层必须是个循环才能继续执行唤醒工作
            if (UNSAFE.compareAndSwapObject(this, waitersOffset, q, null)) { // 原子操作 waiters = null
                for (;;) {
                    Thread t = q.thread;
                    if (t != null) {
                        q.thread = null;
                        LockSupport.unpark(t);  // 唤醒阻塞线程
                    }
                    WaitNode next = q.next;
                    if (next == null) // 唤醒所有阻塞线程后跳出死循环
                        break;
                    q.next = null; // unlink to help gc
                    q = next;
                }
                break; // 跳出外层循环(不用担心在唤醒的的时候又有新线程被添加到阻塞链表里, get方法中可以保证)
            }
        }
        done();
        callable = null;   // 清理执行足迹
    }
~~~


### get方法
不管是`get()`是获取最终结果的方法, 如果结果数据还没准备好, 则调用线程将被阻塞, 被记录在`FutureTask`的阻塞链表(`waiters`)里.

~~~java
    public V get() throws InterruptedException, ExecutionException {
        int s = state;
        if (s <= COMPLETING)
            s = awaitDone(false, 0L);  // 真正的阻塞发生在这里
        return report(s); // 根据状态返回结果
    }
    // 根据state返回结果, 结果或异常都在outcome里
    private V report(int s) throws ExecutionException {
        Object x = outcome;
        if (s == NORMAL)  // 正常结束返回结果
            return (V)x;
        if (s >= CANCELLED)  // 取消了抛异常
            throw new CancellationException();
        throw new ExecutionException((Throwable)x); // 执行过程中产生的异常直接抛出
    }
    // 等待(可以等待一段时间, 时间到就不再等了)
    private int awaitDone(boolean timed, long nanos)
        throws InterruptedException {
        final long deadline = timed ? System.nanoTime() + nanos : 0L;
        WaitNode q = null;
        boolean queued = false;  // 这个变量表示有没有把当前线程加入到阻塞链表中去
        for (;;) { // 这个循环会被执行很多次, 每次都匹配到条件执行, 直到复合特定条件才直接返回结果
            if (Thread.interrupted()) {
                removeWaiter(q);
                throw new InterruptedException();
            }
            int s = state;  // 这里注意跟set中同步, 有可能刚得到s, sate就被更改了
            if (s > COMPLETING) {  // 这里保证只有 NEW 和 COMPLETING 才不会直接返回
                if (q != null)
                    q.thread = null;
                return s;  // 这里的跳出循环并返回结果, 实际上只有任务完成(或被取消)才会执行到
            }
            else if (s == COMPLETING) // 这里把 COMPLETING 也排除掉了, 也就是说, 往下走的情况只有 s = NEW
                Thread.yield();
            else if (q == null)
                q = new WaitNode();
            else if (!queued)
                // 头插法(q.next指向原表头, 并把q赋值给了waiters, 相当于q放在了链表头), 成功返回true表示已经加入到了阻塞链表.
                // 这一切发生的前提是 waitersOffset == waiters, 这并不总是成立,
                // 因为有可能刚好在q.next = waiters之后(此时得到了waiters, 假设用tmp表示),
                // set方法里把futureTask.waiters改成了null. 这时就会出现waitersOffset != waiters(tmp)的情况
                queued = UNSAFE.compareAndSwapObject(this, waitersOffset, q.next = waiters, q);
            else if (timed) {
                nanos = deadline - System.nanoTime();
                if (nanos <= 0L) {
                    removeWaiter(q);
                    return state;  // 如果设置了等待时间, 时间到了也会跳出循环
                }
                LockSupport.parkNanos(this, nanos);
            }
            else
                LockSupport.park(this);
        }
    }
~~~

******
