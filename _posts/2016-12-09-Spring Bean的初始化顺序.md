---
layout: blog
title:  Spring Bean的初始化顺序
date:   2016-12-09
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

![Bean生命周期]({{ "/static/images/bean_init.png"  | prepend: site.baseurl }} "Bean生命周期")

1. 对`Bean`进行实例化, 相当于调用构造函数, `new` 出一个对象
2. 若实现了`BeanNameAware`接口, 则会调用其`setBeanName(String name)`方法, 用于获取Bean的ID.
3. 若实现了`BeanFactoryAware`接口, 则调用其`setBeanFactory(BeanFactory beanFactory)`方法, 用于拿到Spring容器, 如通过容器发布一些事件等.
4. 若实现了`ApplicationContextAware`接口, 则调用其`setApplicationContext(ApplicationContext applicationContext)`方法, 作用与`BeanFactoryAware`类似都是为了获取Spring容器, 不同的是Spring容器在调用`setApplicationContext`方法时会把它自己(`this`)作为参数传入，而Spring容器在调用`setBeanDactory`前需要程序员自己指定`setBeanDactory`里的参数`BeanFactory`.
5. 若有`BeanPostProcessor`接口的实现类, 则调用其`postProcessBeforeInitialization(Object bean, String beanName)`方法.
6. 调用自定义初始化方法, 即自己通过`@PostConstruct`注解的定义方法, 该方法必须为`public`或`protected`, 不能抛受检查异常, 返回值必须为`void`.
7. 若实现了`InitializingBean`接口, 则调用其`afterPropertiesSet()`方法
8. 若有`BeanPostProcessor`接口的实现类, 则调用其`postProcessAfterInitialization(Object bean, String beanName)`方法.
9. 调用自定义销毁方法, 即自己通过`@PreDestroy`注解定义的方法
10. 若实现了`DisposableBean`接口, 则调用其`destroy()`方法.

`Bean`的整个生命周期历程为: `定义 --> 创建(构造并填充属性) --> 初始化 --> 准备就绪 --> 销毁`



*****
