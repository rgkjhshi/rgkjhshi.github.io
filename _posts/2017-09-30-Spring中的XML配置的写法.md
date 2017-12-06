---
layout: blog
title:  Spring中的XML配置的写法
date:   2017-09-30
category: 编程技术
tag: Spring
---

现在的Spring项目提倡无`xml`配置, 但是在一些老的项目中难免会遇见一些通过`xml`进行配置的地方, 这篇文章总结下通过`xml`来配置`Bean`的各种写法

*****

* TOC
{:toc}

*****

## 构造器创建实例
构造器注入可以注入值, 也可以注入其他`Bean`的引用, 我们有两种配置方式可供选择, `<constructor-arg>元素` 和 `c-命名空间`

### `<constructor-arg>元素`注入
`<constructor-arg>`元素的写法有多种形式

* 按顺序注入, 如:

~~~xml
    <bean id="beanService" class="com.test.BeanService">
        <constructor-arg value="第一个参数"/>
        <constructor-arg value="第二个参数"/>
    </bean>
~~~

* 指定顺序注入, 参数是从0开始的. 如:

~~~xml
    <bean id="beanService" class="com.qunar.finance.demo.service.BeanService">
        <constructor-arg index="0" value="第0个参数的值"/>
        <constructor-arg index="1" value="第1个参数的值"/>
    </bean>
~~~

* 按参数名称注入, 如:

~~~xml
    <bean id="beanService" class="com.test.BeanService">
        <constructor-arg name="name" value="name的值"/>
        <constructor-arg name="title" value="title的值"/>
    </bean>
~~~

* 注入的不是值, 而是另一个`Bean`的引用, 只需要把`value`换成`ref`即可, 如:

~~~xml
    <constructor-arg ref="otherBeanId"/>
    <constructor-arg index="0" ref="otherBeanId"/>
    <constructor-arg name="otherBean" ref="otherBeanId"/>
~~~

### `c-命名空间`注入
`c-命名空间`是在Spring 3.0中引入的, 要使用这个空间需要在`XML`顶部生命其模式:`xmlns:c="http://www.springframework.org/schema/c"`, 但是一般集成开发环境都会有自动导入功能.

先看几个例子:

~~~xml
<bean id="beanService" class="com.test.BeanService" c:name="Tom" c:title="TestTitle" />
<bean id="beanService" class="com.test.BeanService" c:_0="Tom" c:_1="TestTitle" />
<bean id="beanService" class="com.test.BeanService" c:otherBean-ref="otherBeanId" />
<bean id="beanService" class="com.test.BeanService" c:_0-ref="otherBeanId" />
~~~

与之前类似, 注入引用只是比注入值多了一个`-ref`, 但由于变量名不能以数字开头, 所以会在数字前面加一个下划线`_`, 如`c:_0`表示第0个参数

*****

## 工厂方法创建实例
有的类提供了一个静态工厂方法来产生实例(往往这种方法可以使用`initialization on demand holder`技术进行延时加载, 不论是静态内部类还是非静态内部类都是在第一次使用时才会被加载)。

~~~java
public class Singleton {
    private Singleton() {
    }
    private static class SingletonHolder {  // 延迟加载实例
        static Singleton instance = new Singleton();
    }
    public static Singleton getInstance() {
        return SingletonHolder.instance;  // 返回实例
    }
}
~~~

我们可以使用`factory-method`属性来创建实例:

~~~xml
<bean id="beanService" class="com.test.Singleton" factory-method="getInstance" />
~~~

*****

## 装配属性
属性装配是以`setter`方法为基础的, 如果属性没有`setter`方法, 是无法通过这种方式进行属性注入的.

与构造注入类似, 属性注入也有两种方式: `<property>`和`p-命名空间`, 如:

~~~xml
    <!-- property方式, name属性是必须的 -->
    <bean id="beanService" class="com.test.BeanService">
        <property name="name"  value="Tom"/>
        <property name="otherBean" ref="otherBeanId"/>
    </bean>
    <!-- p命名空间 -->
    <bean id="beanService" class="com.test.BeanService">
        <p:name value="Tom"/>
        <p:otherBean-ref value="otherBeanId"/>
    </bean>
~~~

*****

## 装配集合
集合可以作为属性或者构造函数参数的值. Spring 提供了4中集合元素

* `<list>`: 装备list类型的值, 允许重复
* `<set>`: 装备set类型的值, 不允许重复
* `<map>`: 装备map类型的值, 名称和值可以是任意类型
* `<props>`: 装备properties类型的值, 名称和值必须是`String`型

实际上, `<list>`和`<set>`可以装备任意`java.util.Collection`甚至是数组, 两者唯一的区别就是`<set>`中重复元素会被过滤掉; `<map>`和`<props>`元素分别对应`java.util.Map`和`java.util.Properties`, `<props>`要求键和值都必须是`String`类型.

### 装配List、Set和Array
属性为数组或`List`或者`Set`都可以这样装配:

~~~xml
    <!-- 注入值 -->
    <property name="nameList">
        <list>
            <value>Tom</value>
            <value>Tom</value>
            <value>Michael</value>
        </list>
    </property>
    <!-- 注入bean的引用 -->
    <property name="otherBeanList">
        <list>
            <ref bean="beanId" />
            <ref bean="beanId" />
            <ref bean="beanId" />
        </list>
    </property>
~~~

### 装配Map

`<map>`元素包含多个`<entry>`元素, `<entry>`元素由有个键和一个值组成

* `key`: 指定`map`中`entry`的键为`String`
* `key-ref`: 指定`map`中`entry`的键其他Bean的引用
* `value`: 指定`map`中`entry`的值为`String`
* `value-ref`: 指定`map`中`entry`的值为其他Bean的引用

比如:

~~~xml
    <property name="map">
        <map>
            <entry key="a" value-ref="helloService" />
            <entry key="b" value-ref="helloService" />
            <entry key="c" value-ref="helloService" />
        </map>
    </property>
~~~

### 装配Properties
`Properties`类提供了和`Map`大致相同的功能, 只是它的键和值都必须是`String`类型

`<props>`元素包含多个`<prop>`元素, `<prop>`元素有个`key`属性. 比如:

~~~xml
    <property name="properties">
        <props>
            <prop key="a">Tom</prop>
            <prop key="b">Jim</prop>
            <prop key="c">Michael</prop>
        </props>
    </property>
~~~

### `util-命名空间`
`util-命名空间`可以用来装配集合,  它有如下元素:

* `util:list`: 创建一个`java.util.List`类型的`bean`, 其中包含值或引用
* `util:set`: 创建一个`java.util.Set`类型的`bean`, 其中包含值或引用
* `util:map`: 创建一个`java.util.Map`类型的`bean`, 其中包含值或引用
* `util:properties`: 创建一个`java.util.Properties`类型的`bean`
* `util:property-path`: 引用一个`bean`的属性(或内嵌属性)，并将其暴露为`bean`(不太常用)
* `<util:constant>`: 引用某个类的`public static`域, 并将其暴露为`bean`(不太常用)

例如:

~~~xml
    <util:list id="listBean">
        <value>Tom</value>
        <value>Michael</value>
    </util:list>
    <util:set id="setBean">
        <value>Tom</value>
        <value>Michael</value>
    </util:set>
    <util:map id="mapBean">
        <entry key="key1" value="value1" />
        <entry key="key2" value="value2" />
    </util:map>
    <util:properties id="propertiesBean">
        <prop key="key1">value1</prop>
        <prop key="key2">value2</prop>
    </util:properties>
    <util:properties id="properties" location="classpath:config.properties" />
~~~

*****
