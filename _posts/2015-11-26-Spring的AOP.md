---
layout: blog
title:  Spring的AOP
date: 2015-11-26
category: 编程技术
tag: Spring
---
在Spring中使用AOP的详细资料可以查看[这里](http://shouce.jb51.net/spring/aop.html)




*****
## AOP的实现方式
在Java中,从织入切面的方式上来看,存在三种织入方式:编译时织入、加载时织入和运行时织入

* 编译时织入(Compile Time Weaving, CTW)

指在Java编译期,采用特殊的编译器, 将切面织入到Java类中,即发生在从java文件到class文件的过程.  
这种方式将切面直接编译进了字节码，所以运行时不再需要动态创建代理对象, 节约了内存和CPU, 但编译过程复杂(可借助Maven AspectJ插件)，编写aspect文件(.aj文件)复杂
* 加载时织入(Load Time Weaving, LTW)

指通过特殊的类加载器(如AspectJ compiler), 在JVM载入字节码文件时, 织入切面, 即发生在class文件加载的过程.  
具体可参考[这里](http://shouce.jb51.net/spring/aop.html#aop-aj-ltw)

* 运行时织入

采用CGLib工具或JDK动态代理进行切面的织入, 如Spring AOP

*****
## AOP、CGLib、Spring AOP、AspectJ之间的关系

* AOP, Aspect Oriented Programming, 面向切面编程,是个概念, 类似于面向对象编程(OOP)一样
* CGLib, 基于`asm.jar`的字节码增强技术API, 开源的, 也是个jar包:`cglib.jar`
* Spring AOP, Spring的AOP实现, 在运行时基于动态代理(JDK或cglib)的方式进行织入, Spring3.2以后不再需要依赖`cglib.jar`包, 因为它里面的类已经被`spring-core.jar`包含了
* AspectJ, 提供了完整的AOP实现
  1. AspectJ是一个代码生成工具,于自己的语法编译工具，编译的结果是Java Class文件, 支持编译时织入切面，即所谓的CTW机制
  2. AspectJ有自己的类装载器，支持在类装载时织入切面，即所谓的LTW机制
  3. AspectJ同样也支持运行时织入，运行时织入是基于动态代理的(默认机制)

*****
## Spring中AOP相关的概念
在怎么使用之前,最好先看看相关概念,有关`Joinpoint`、`Pointcut`、`Advice`等概念,看[这里](http://shouce.jb51.net/spring/aop.html#aop-introduction-defn)

## 启用@AspectJ支持
在Spring中使用`@AspectJ`可以在配置文件中启用`<aop:aspectj-autoproxy/>`, 甚至启用LTW机制`<context:load-time-weaver/>`, 对应的注解分别为`@EnableAspectJAutoProxy`和`@EnableLoadTimeWeaving`

## 声明一个切面
在带有`@AspectJ`注解的类上同时加上`@Component`(声明为一个bean)注解并确保被自动扫描, 这样才会被Spring识别并管理

## 声明一个切入点
切入点决定了连接点关注的内容，使得我们可以控制通知什么时候执行, 即从哪里把要做的操作(通知)切入进去  
一个切入点声明有两个部分: *切入点签名* 和 *切入点表达式*  
在`@AspectJ`注解风格的AOP中, *切入点签名* 通过一个普通的方法定义来提供, 该方法必需反回`void`类型;  
*切入点表达式* 使用`@Pointcut`注解来表示(内容略多, 后面讲), 一个切入点声明如下:

```java
@Pointcut(value="execution(* sayAdvisorBefore(..)) && args(param)", argNames = "param")
public void pointcutName(String param) {}
```
* value: 指定切入点表达式, 如`execution`、`args`等
* argNames: 指定该切入点方法参数列表,多个用`,`分隔,这些参数将传递给通知方法同名的参数;
* pointcutName: 切入点名字，可以用该名字引用该切入点表达式

## 声明通知
`@AspectJ`风格的声明通知支持5种通知类型:
* `@Before`: 前置通知,执行连接点方法之前执行
* `@AfterReturning`: 后置返回通知, 一个匹配的方法返回的时候执行
* `@AfterThrowing`: 异常通知, 在一个方法抛出异常后执行
* `@After`: 最终通知, 不论一个方法是如何结束的,最终通知都会运行, 最终通知必须准备处理正常返回和异常返回两种情况
* `@Around`: 环绕通知, 在一个方法执行之前和之后执行, 而且它可以决定这个方法在什么时候执行，如何执行，甚至是否执行. 通知的第一个参数必须是`ProceedingJoinPoint`类型,在通知体内，调用`ProceedingJoinPoint`的`proceed()`方法会导致 后台的连接点方法执行

如果在同一个连接点上执行多个通知,可以使用`@Order`注解决定其执行顺序

下面是通知的使用方式:

```java
@Before(value = "切入点表达式或命名切入点", argNames = "参数列表参数名")
@After(value  = "切入点表达式或命名切入点", argNames = "参数列表参数名")
@Around(value = "切入点表达式或命名切入点", argNames = "参数列表参数名")
@AfterReturning(
value = "切入点表达式或命名切入点",
pointcut = "切入点表达式或命名切入点", // 如果指定了将覆盖value属性指定的，pointcut具有高优先级
argNames = "参数列表参数名",
returning = "返回值对应参数名")
@AfterThrowing(
value = "切入点表达式或命名切入点",
pointcut = "切入点表达式或命名切入点",
argNames = "参数列表参数名",
throwing = "异常对应参数名")
```
来个小例子:

```java
@Aspect
public class BeforeExample {
    @Before(value = "pointcutName(param)", argNames = "param")
    public void beforeAdvice(String param) {  // 切入点匹配到的参数将传递过来
        System.out.println(param);
    }
}
```
上例使用`@Before`进行前置通知声明,其中value用于定义切入点表达式或引用命名切入点

*****
## 通知参数
通知方法可以获取被通知方法的参数，主要是通过`JoinPoint`(环绕通知是`JoinPoint`的子类`ProceedingJoinPoint`)来获取, `JoinPoint`必须是第一个参数, Spring会自动传入.

`JoinPoint`的声明如下:

```java
public interface ProceedingJoinPoint extends JoinPoint {  
    public Object proceed() throws Throwable;    // 执行连接点的方法
    public Object proceed(Object[] args) throws Throwable;   // 执行连接点的方法, 可以把原来的参数用新的args替换掉
}
public interface JoinPoint {  
    String toString();          //连接点所在位置的相关信息  
    String toShortString();     //连接点所在位置的简短相关信息  
    String toLongString();      //连接点所在位置的全部相关信息  
    Object getThis();           //返回AOP代理对象  
    Object getTarget();         //返回目标对象  
    Object[] getArgs();         //返回被通知方法参数列表  
    Signature getSignature();   //返回当前连接点签名  
    SourceLocation getSourceLocation();//返回连接点方法所在类文件中的位置  
    String getKind();           //连接点类型  
    StaticPart getStaticPart(); //返回连接点静态部分
    // 这是个内部接口, 提供访问连接点的静态部分，如被通知方法签名、连接点类型等
    public interface StaticPart {  
        Signature getSignature();    //返回当前连接点签名  
        String getKind();            //连接点类型  
        int getId();                 //唯一标识  
        String toString();           //连接点所在位置的相关信息  
        String toShortString();      //连接点所在位置的简短相关信息  
        String toLongString();       //连接点所在位置的全部相关信息  
    }
}
```
*****
## 切入点表达式
切入点表达式就是组成`@Pointcut`注解的值, 用于匹配具体的连接点.  
切入点表达式由切入点指示符、类型匹配语句、通配符、组合符组成

**切入点指示符(PCD)**  
在切入点表达式中可以使用如下的AspectJ切入点指示符(PCD):
* execution: 匹配方法执行, 这是最经常的切入点指示符
* within: 匹配特定类型之内的全部方法执行
* this: 用于匹配当前AOP代理对象类型的连接点,包括接口
* target: 用于匹配当前目标对象类型的连接点,不包括接口
* args: 用于匹配当前执行的方法传入的参数为指定类型的连接点
* @within: 用于匹配持有指定注解类型内的连接点
* @target: 用于匹配当前目标对象类型的连接点，其中目标对象持有指定的注解
* @args: 匹配当前执行的方法传入的参数持有指定的注解
* @annotation: 匹配当前执行方法持有指定注解的方法

看不明白还是看最后面的例子吧

**类型匹配语句**  
类型匹配语句格式像下面这样(带`?`的属于可选,可以不写):

* 对类的匹配: `注解? 类的全限定名字`
* 对方法的匹配: `注解? 修饰符? 返回值类型 类型声明? 方法名(参数列表) 异常列表？`

**类型匹配的通配符**  
* `*`: 匹配任何数量字符；
* `..`:(两个点)匹配任何数量字符的重复;如在类型模式中匹配任何数量子包,而在方法参数模式中匹配任何数量参数
* `+`: 匹配指定类型的子类型,仅能作为后缀放在类型模式后边

**组合切入点表达式**  
AspectJ使用 与(&&)、或(||)、非(!)来组合切入点表达式, 在xml文件中可使用and、or、not

## 切入点表达式示例
* `execution`使用`execution(方法表达式)`匹配方法执行

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| public * *(..)           | 所有public方法  |
| * cn.test..IService.*()  | cn.test及子包下IService中任何无参方法  |
| * cn.test..IService＋.*() | cn.test及子包下IService及子类中任何无参方法  |
| * cn.test..IService.*(＊) | cn.test及子包下IService中只有一个参数的方法  |
| * cn.test..IService.*(..) | cn.test及子包下IService中所有方法  |
| * cn.test..IService.*(java.util.Date) | cn.test及子包下IService中只有一个Date类型参数的方法  |
| * cn.test..IService*.test*(..) | cn.test及子包下IService前缀类型中test前缀开头的任何方法  |
| * cn.test..*.*(..)        | cn.test及子包下任何类的任何方法  |
| @java.lang.Deprecated * *(..) | 任何持有@Deprecated注解的方法 |
| @(java.lang.Deprecated && cn.javass..Secure) * *(..) | 任何持有@java.lang.Deprecated和@ cn.javass..Secure注解的方法 |

* `within`使用`within(类型表达式)`匹配指定类型内的方法执行

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| within(cn.test..*)       | cn.test及子包下的任何方法  |
| within(cn.test..IService＋)  | cn.test及子包下IService及子类的任何方法  |
| within(@cn.test.Secure *) | cn.test及子包下带有@cn.test.Secure注解的任何类(接口不行)的任何方法  |

* `this`使用`this(类型全限定名)`匹配当前AOP代理对象类型的执行方法,包括引入接口,不支持通配符

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| this(cn.test.IService)   | 当前AOP对象实现了IService接口的任何方法  |

* `target`使用`target(类型全限定名)`匹配当前目标对象类型的执行方法,不包括引入接口,不支持通配符

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| this(cn.test.IService)   | 当前目标对象(非AOP对象)实现了IService接口的任何方法  |

* `args`使用`args(参数类型列表)`匹配传入参数(不是声明时的参数)为指定类型的执行方法,参数类型必须是全限定名, 不支持通配符

args属于动态切入点，这种切入点开销非常大，非特殊情况最好不要使用

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| args(java.lang.String, ..)   | 第一个参数为String,后面有任意个参数的方法  |

* `@within`使用`@within(注解类型全限定名)`匹配所以持有指定注解类型内的方法, 必须是在目标对象上声明注解，在接口上声明不起作用

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| @within(cn.test.Secure)  | 任何目标对象对应的类型持有Secure注解的类方法  |

* `@target`使用`@target(注解类型全限定名)`匹配当前目标对象类型的执行方法, 必须是在目标对象上声明注解，在接口上声明不起作用

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| @target(cn.test.Secure)  | 任何目标对象对应的类型持有Secure注解的类方法  |

* `@args`使用`@args(注解类型全限定名)`匹配当前执行的方法传入的参数持有指定注解的执行

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| @args(cn.test.Secure)  | 任何只接受一个参数的方法，且方法运行时传入的参数持有Secure注解   |

* `@annotation`使用`@annotation(注解类型全限定名)`匹配当前执行方法持有指定注解的方法

| 表达式                    | 描述     |
| ------------------------ | -------------- |
| @annotation(cn.test.Secure)  | 当前执行方法上持有Secure注解的方法  |
