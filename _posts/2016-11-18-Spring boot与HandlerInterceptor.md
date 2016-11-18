---
layout: blog
title:  Spring boot与HandlerInterceptor
date:   2016-11-18
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

## HandlerInterceptor
`Spring`提供的拦截器`Interceptor`与`Servlet`中的`Filter`不同的是, `Interceptor`采用`AOP`的方式在`Servlet`的`service`方法执行之前进行拦截, 可以进行更精细的控制.

在`Spring`中定义一个`Interceptor`只需要实现`HandlerInterceptor`接口, `Spring`已经为我们提供了一个`HandlerInterceptorAdapter`, 我们只需要继承它, 覆盖想要重写的方法.

### 拦截器中的方法
`Interceptor`中有如下方法:

* `preHandle`: 在`Controller`处理之前调用, 返回`false`时整个请求结束
* `postHandle`: 在`Controller`调用之后执行, 但它会在`DispatcherServlet`进行视图的渲染之前执行, 也就是说在这个方法中你可以对`ModelAndView`进行操作
* `afterCompletion`: 在整个请求完成之后执行, 也就是`DispatcherServlet`已经渲染了视图之后执行; 这个方法的主要作用是用于清理资源的
* `afterConcurrentHandlingStarted`: 这个方法是`AsyncHandlerInterceptor`接口中添加的. 当`Controller`中有异步请求方法的时候会触发该方法, 异步请求先支持`preHandle`、然后执行`afterConcurrentHandlingStarted`, 异步线程完成之后执行会再执行`preHandle、postHandle、afterCompletion`

关于最后那个方法, 举个列子:

~~~java
@RestController
public class ExampleController {
    @RequestMapping("/")
    DeferredResult<String> home() {
        DeferredResult<String> dr = new DeferredResult<String>();
        dr.setResult("成功");
        return dr;
    }
}
~~~
上面这样的`Controller`里面有个异步结果, 则拦截器的执行顺序将是: `preHandle -> afterConcurrentHandlingStarted -> preHandle -> postHandle -> afterCompletion`.

如果把`dr.setResult("成功");` 这句删掉, 将只执行`preHandle -> afterConcurrentHandlingStarted`

可以认为, `afterConcurrentHandlingStarted`是返回异步结果时调用(此时异步结果里不需要有数据), 而`postHandle`必须是返回的结果执行完, 异步结果中有数据了(`dr.setResult`)才调用.

## Spring boot 定制 Interceptor

首先我们先定义我们自己的拦截器, 方式还是继承`HandlerInterceptorAdapter`, 覆盖想要的方法:

~~~java
@Component
public class MyInterceptor extends HandlerInterceptorAdapter {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        return true;
    }
    // ...
}
~~~
像这样我们把`MyInterceptor`作为一个`Bean`, `Spring boot`并不会帮我们注册到拦截器列表中. 就像添加消息转换器一样, 我们可以在继承`WebMvcConfigurerAdapter`的配置类里, 通过覆盖方法来添加:

~~~java
@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {
      // 拦截器需要手动加入到调用链中
      @Override
      public void addInterceptors(InterceptorRegistry registry) {
          registry.addInterceptor(new MyInterceptor());
      }
}
~~~


*****
