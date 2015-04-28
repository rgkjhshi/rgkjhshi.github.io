---
layout: blog
title: 注解(Annotation)
date:  2015-04-27
category: java
---


刚用到Spring中的注解时，感觉真是太方便了，其实在JDK1.5就已经支持注解了，1.5以后默认内置了三个注解  
@Override:只能用在方法之上的，表示重写父类的方法。   
@Deprecated:可用在任何元素上，表示API已过时，编译时会产生警告。  
@SuppressWarnings: 可以关闭警告信息。  



*****

## 本文结构

* [如何定义注解](#define)
* [注解的使用规则](#rule)

*****

<h2 id="define"> 如何定义注解 </h2>
我们可以通过关键字`class`来声明一个类，类似的我们可以用某东西来声明注解，用来声明注解的这东西叫做"元注解"。  
在`java.lang.annotation`包中定义了4个元注解，分别是: `@Target、 @Retention、 @Documented、 @Inherited`  

* @Target

`@Target`用于说明Annotation所修饰的对象范围，比如用于修饰类、接口、构造方法、成员方法、成员变量等，它作用范围的取值有:  

```
ElementType.CONSTRUCTOR     : 用于描述构造器  
ElementType.FIELD           : 用于描述字段  
ElementType.LOCAL_VARIABLE  : 用于描述局部变量  
ElementType.METHOD          : 用于描述方法  
ElementType.PACKAGE         : 用于描述包  
ElementType.PARAMETER       : 用于描述参数  
ElementType.TYPE            : 用于描述类、接口(包括注解类型) 或enum声明  
```

* @Retention

`@Retention`定义Annotation的有效期，即生命周期，如是源码级还是class级还是可以被加载到虚拟机，它的取值有:   

```
RetentionPoicy.SOURCE       : 在源文件中有效（即源文件保留）
RetentionPoicy.CLASS        : 在class文件中有效（即class保留）
RetentionPoicy.RUNTIME      : 在运行时有效（即运行时保留）
```

* @Documented

`@Documented`是一个标记注解，没有成员，表示可以被javadoc文档化

* @Inherited

`@Inherited`是一个标记注解，允许子类继承父类中的注解  

下面是定义注解的例子:

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)    // 表示注解将被加载到虚拟机
@Target({ElementType.METHOD, ElementType.TYPE})  // MyAnnotation 可修饰方法和类等
public @interface MyAnnotation {       // @interface 即为定义注解的“关键字”
    //为注解添加属性
    String color();
    String value() default "default"; //为属性提供默认值
    int[] array() default {1, 2, 3}; 
}

// 测试文件
// (value="not default")则可以写成("not default")value比较特殊，其他不可以省略写
@MyAnnotation(color = "red")  // 注解中没有默认值的必须赋值； 
public class AnnotationTest {
    public static void main(String[] args) {
        //检查类AnnotationTest是否含有@MyAnnotation注解
        if (AnnotationTest.class.isAnnotationPresent(MyAnnotation.class)) {
            //若存在就提取注解的值
            MyAnnotation annotation = (MyAnnotation) AnnotationTest.class.getAnnotation(MyAnnotation.class);
            System.out.println(annotation.color());
            System.out.println(annotation.value());
        }
    }
}
```


*****

<h2 id="rule"> 注解的使用规则 </h2>

1. 使用`@interface`定义注解时，自动继承了`java.lang.annotation.Annotation`接口，由编译程序自动完成其他细节。  
2. 定义注解时，不能继承其他的注解或接口。  
3. `@interface`用来声明一个注解，其中的每一个方法实际上是声明了一个配置参数。方法的名称就是参数的名称，返回值类型就是参数的类型。
4. 参数类型只能是基本类型、String、Class、enum、Annotation或这些类型的数组。
5. 可以通过default来声明参数的默认值。
6. 参数只能用public或默认(default)这两个访问权修饰.例如,String value();这里把方法设为defaul默认类型；
7. 如果只有一个参数成员,最好把参数名称设为"value",后加小括号，指定其值时可以是(value="abc")或简写成("abc")，其他名字的成员不能简写。
8. 注解元素必须有确定的值，要么在定义注解的默认值中指定，要么在使用注解时指定，非基本类型的注解元素的值不可为null。

*****

