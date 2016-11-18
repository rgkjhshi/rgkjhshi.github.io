---
layout: blog
title:  Spring boot与Servlet组件
date:   2016-11-18
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

## Servlet组件注册

`Servlet`的组件包括`Filter`, `Listener`, `Servlet`, 具体详情可参考[Servlet详解](http://loveshisong.cn/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2016-11-16-Servlet%E8%AF%A6%E8%A7%A3.html).  
普通的web项目都是从`web.xml`中配置, `Spring boot`中为我们提供了很多注册的方式. 我们先以`Filter`举例, 然后再介绍`Listener`和`Servlet`的注册, 他们的注册方式基本一致.

*****

## 注册Filter

### 方式一
直接作为一个`Bean`注册.  
自定义`Filter`通常可以实现`Filter`接口, 或者可以继承`Spring`提供的`GenericFilterBean`.  
当`Spring Boot`监测到有`javax.servlet.Filter`的`bean`时就会自动加入过滤器调用链.

* 优点: 简单
* 缺点: 不可控(比如无法配置要过滤的URL等), 所以这种方式基本不用

代码如下:

~~~java
@Component
public class MyFilter extends GenericFilterBean {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        //  some code
        return true;
    }
}
~~~

### 方式二
通过`FilterRegistrationBean`注册, 这个类实现了`ServletContextInitializer`接口

* 优点: 简单, 可控

比如还是注册上面写的那个`MyFilter`, 注册及配置的代码如下:

~~~java
@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {
    @Bean
    public FilterRegistrationBean registMyFilter() {
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(new MyFilter());
        registrationBean.setName("myFilter");
        registrationBean.setUrlPatterns(Sets.newHashSet("/*"));
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
~~~

### 方式三
使用`@ServletComponentScan`扫描`@WebFilter`注解自动注册

这种方式需要在 **主配置类** 上加`@ServletComponentScan`注解, 在我们的`MyFilter`类上加`@WebFilter`注解. 代码如下:

~~~java
// 主配置类
@SpringBootApplication
@ServletComponentScan
public class Application {
    // ...
}
// 自定义的过滤器类
@WebFilter(filterName = "myFilter", urlPatterns = "/*")
public class MyFilter extends GenericFilterBean {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        //  some code
        return true;
    }
}
~~~

*****

## 注册Listener
`Listener`的注册方式跟`Filter`一样, 只是继承或实现的接口, 添加的注解不一样.

* 比如实现`ServletContextListener`接口
* 通过`ServletListenerRegistrationBean`注册
* 通过`@WebServlet`注解注册.

*****

## 注册Servlet
在`Spring`项目中, 都是通过`DispatcherServlet`分发, 基本不需要自定义`Servlet`. 下面仅介绍使用方式

* 注意不要使用方式一, 一定要指定相应的URL
* 通过`ServletRegistrationBean`注册
* 通过`@WebServlet(name = "myServlet", urlPatterns = "/abc/*")`注解注册.

*****
