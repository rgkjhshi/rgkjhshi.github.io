---
layout: blog
title:  Spring Bean的生命周期
date:   2017-08-14
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

## 生命周期
普通的`Java`程序中一个对象通过关键字`new`进行实例化, 而在`Spring`容器里, `Bean`的生命周期由`Spring`来控制, 而`Spring`中对`Bean`的生命周期的控制非常细致, 我们可以通过`Spring`提供的扩展点来自定义`Bean`的创建过程.

下图是一个典型的生命周期过程:

![Bean生命周期]({{ "/static/images/bean_lifecycle.png"  | prepend: site.baseurl }} "Bean生命周期")

1. 对`Bean`进行实例化, 相当于调用构造函数, `new`出一个对象
2. 将`值`和`Bean的引用`注入到`Bean`对应的属性中
3. 若`Bean`实现了`BeanNameAware`接口, Spring将Bean的ID传递给`setBeanName(String name)`方法. (实现`BeanNameAware`主要是为了通过Bean的引用来 **获取** Bean的ID)
4. 若`Bean`实现了`BeanFactoryAware`接口, Spring将调用`setBeanFactory(BeanFactory beanFactory)`方法, 将`BeanFactory`容器实例传入. (实现`BeanFactoryAware`主要目的是为了获取Spring容器, 如Bean通过Spring容器发布事件等)
5. 若`Bean`实现了`ApplicationContextAware`接口, Spring容器将调用`setApplicationContext(ApplicationContext applicationContext)`方法, 将应用上下文的引用传入. (作用与`BeanFactoryAware`类似都是为了获取Spring容器, 不同的是Spring容器在调用`setApplicationContext`方法时会把自己作为参数传入, 而Spring容器在调用`setBeanFactory`前需要程序员自己指定`setBeanFactory`里的参数`BeanFactory`)
6. 若`Bean`实现了`BeanPostProcessor`接口, Spring将调用它们的`预初始化方法: postProcessBeforeInitialization(Object bean, String beanName)`方法. (作用是在Bean实例创建成功后对进行增强处理, 如对Bean进行修改, 增加某个功能)
7. 调用`@PostConstruct`注解的方法, 该方法必须无参数, 不能抛受检查异常, 返回值必须为`void`.
8. 若`Bean`实现了`InitializingBean`接口, Spring将调用它们的`afterPropertiesSet()`方法.
9. 调用自定义初始化方法, 即`<bean init-method="" />`或`@Bean(initMethod = "")`声明的方法.
10. 若`Bean`实现了`BeanPostProcessor`接口的实现类, Spring将调用它们的`后初始化方法: postProcessAfterInitialization(Object bean, String beanName)`方法.
11. 此时`Bean`已经准备就绪, 可以被应用程序使用了, 它将一直驻留在应用上下文中, 直到应用上下文被销毁
12. 调用`@PreDestroy`注解的方法, 该方法必须无参数, 不能抛受检查异常, 返回值必须为`void`.
13. 若`Bean`实现了`DisposableBean`接口, Spring将调用它的`destroy()`方法.
14. 调用自定义销毁方法, 即`<bean destroy-method="" />`或`@Bean(destroyMethod = "")`声明的方法.

`注意`: 黄色部分标识的`BeanPostProcessor`接口有点特殊, 如果我们定义了一个实现`BeanPostProcessor`接口的`Bean`(后处理器), 那么在这个`Bean`所在的容器中的 **其他所有Bean** 在初始化前后都会执行该后处理器的方法

*****

## 测试示例
如果我们在xml文件中有这样的配置

~~~xml
<bean id="lifecycleService" class="XXX.service.LifecycleService"
  init-method="initMethod" destroy-method="destroyMethod"/>
~~~

Bean的定义如下:

~~~java
// 后处理器
@Service
public class MyBeanPostProcessor implements BeanPostProcessor {
    private static final Logger logger = LoggerFactory.getLogger(LifecycleService.class);

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        // 每一个没有实现BeanPostProcessor接口的Bean都会调用
        if (bean instanceof LifecycleService) {
            logger.info("BeanPostProcessor.postProcessBeforeInitialization()方法, beanName={}", beanName);
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        // 每一个没有实现BeanPostProcessor接口的Bean都会调用
        if (bean instanceof LifecycleService) {
            logger.info("BeanPostProcessor.postProcessBeforeInitialization()方法, beanName={}", beanName);
        }
        return bean;
    }

}
// 一个普通的Bean, 在上面的xml文件中声明
public class LifecycleService implements BeanNameAware, BeanFactoryAware, ApplicationContextAware, InitializingBean, DisposableBean {
    private static final Logger logger = LoggerFactory.getLogger(LifecycleService.class);

        public LifecycleService() {
            logger.info("1. 构造方法");
        }

        @Override
        public void setBeanName(String beanName) {
            logger.info("2. BeanNameAware.setBeanName()方法, 用于获取Bean的ID");
        }

        @Override
        public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
            logger.info("3. BeanFactoryAware.setBeanFactory()方法");
        }

        @Override
        public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
            logger.info("4. ApplicationContextAware.setApplicationContext()方法");
        }

        @PostConstruct
        private void init() {
            logger.info("5. @PostConstruct");
        }

        @Override
        public void afterPropertiesSet() throws Exception {
            logger.info("6. InitializingBean.afterPropertiesSet()方法");
        }

        public void initMethod() {
            logger.info("7. initMethod");
        }

        // bean就绪

        @PreDestroy
        public void preDestory() {
            logger.info("8. @PreDestroy");
        }

        @Override
        public void destroy() throws Exception {
            logger.info("9. DisposableBean.destroy()方法");
        }

        public void destroyMethod() throws Exception {
            logger.info("10. destroyMethod");
        }
}
~~~

这个例子的输出结果为:

~~~java
1. 构造方法
2. BeanNameAware.setBeanName()方法, 用于获取Bean的ID
3. BeanFactoryAware.setBeanFactory()方法
4. ApplicationContextAware.setApplicationContext()方法
BeanPostProcessor.postProcessBeforeInitialization()方法, beanName=lifecycleService
5. @PostConstruct
6. InitializingBean.afterPropertiesSet()方法
7. initMethod
BeanPostProcessor.postProcessBeforeInitialization()方法, beanName=lifecycleService
8. @PreDestroy
9. DisposableBean.destroy()方法
10. destroyMethod
~~~

*****
