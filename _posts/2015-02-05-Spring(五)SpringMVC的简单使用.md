---
layout: blog
title:  Spring(五)SpringMVC的简单使用
date:   2015-02-05 
category: Spring  
---


`SpringMVC`是在Spring基础上的一个MVC框架，可以很方便地进行web项目开发。




*****
## 本文结构

* [传统的servlet](#servlet)
* [SpringMVC的控制转发](#DispatcherServlet)
  * [web配置](#web)
  * [类处理器](#controller)
  * [spring的配置](#spring)


*****

<h2 id="servlet"> 传统的servlet </h2>

传统的Java Web项目是通过`Servlet`进行控制转发的（其实`SpringMVC`也是基于`servlet`的），在不使用其他框架的情况下，一个单纯使用`servlet`的web项目应该是这样子的：  
定义一个类(如`LoginServlet`)继承`HttpServlet`，重写其中的`doGet`方法和`doPost`方法

```java
//LoginServlet.java
public class LoginServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.getRequestDispatcher("/login.jsp").forward(req, resp);
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.doPost(req, resp);
    }
}
```
然后在web项目的配置文件`web.xml`中添加servlet的配置：

```xml
<servlet>
    <servlet-name>LoginServlet</servlet-name>
    <servlet-class>com.test.servlet.LoginServlet</servlet-class>
</servlet>    
<servlet-mapping>
    <!-- 要与之前定义的 servlet-name 一致 -->
    <servlet-name>LoginServlet</servlet-name>
    <!-- http请求的url -->
    <url-pattern>/login</url-pattern>
</servlet-mapping>
```

*****

<h2 id="DispatcherServlet"> SpringMVC的控制转发 </h2>

`SpringMVC`是基于`DispatcherServlet`的MVC框架，`DispatcherServlet`的继承关系为：

```
HttpServlet <-- HttpServletBean <-- FrameworkServlet <-- DispatcherServlet
```
每一个请求最先访问的都是`DispatcherServlet`，`DispatcherServlet`负责转发`Request`请求给相应的`Handler`，`Handler`处理以后再返回相应的视图(View)或模型(Model)或都不返回。  
在使用注解的`SpringMVC`中，处理器`Handler`是基于`@Controller`和`@RequestMapping`这两个注解的，`@Controller`声明一个处理器类，`@RequestMapping`声明对应请求的映射关系，这样就可以提供一个非常灵活的匹配和处理方式。  

<h3 id="web"> web配置 </h3>
要想使用`SpringMVC`，就得在`web.xml`文件中像配置普通`servlet`那样对`DispatcherServlet`进行配置：

```xml
<servlet>
    <servlet-name>web</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath*:spring.xml</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>web</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```
上面的`servlet`配置中直接通过初始化参数设置了`contextConfigLocation`，这样就会去指定的位置加载spring配置；如果设置的话，则`SpringMVC`会自动到`/WEB-INF`目录下寻找一个叫`[servlet-name]-servlet.xml`的配置文件，像上面的例子就会找`/WEB-INF/web-servlet.xml`进行加载。

* `classpath*:spring.xml`与`classpath:spring.xml`的区别

`classpath:spring.xml`表示仅加载`classpath`目录下的`spring.xml`  
`classpath*:spring.xml`表示加载`classpath`目录及其子目录下，还有jar包中所有名为的`spring.xml`的文件

<h3 id="controller"> 类控制器 </h3>
类控制器是真正做事情的`Handler`，web配置好了之后，来看看处理器类是怎么写的：

```java
//LoginController.java
@Controller
@RequestMapping("/admin")
public class LoginController {
    @RequestMapping(value = "/login", method = RequestMethod.GET)
    @ResponseBody
    public String login() {
        return "login success";
    }
}
```
上面例子中请求的URL后面的路径为：`/admin/login`，即方法上的`@RequestMapping`注解是在类的注解基础上的，如果类上没有`@RequestMapping`注解，则方法上注解的路径就是绝对路径了。  
另外注解`@ResponseBody`表示直接返回结果，否则，返回的字符串会被当成一个模板文件(如jsp)，具体内容后续文章再说。

<h3 id="spring"> spring的配置 </h3>

通过web配置，可以把请求转发到我们定义的类控制器中处理，前提是web项目能够找到我们定义的类控制器，这就需要在spring配置文件中来指定。  
这里的spring配置跟之前的差不多，无非就是让Spring能够找到我们用`@Controller`注解的Bean，另外还需要添加`<mvc:annotation-driven />`来支持SpringMVC注解

```xml
<!-- 支持SpringMVC注解 -->
<mvc:annotation-driven />
<!-- 扫描 LoginController 所在的包 -->
<context:component-scan base-package="com.test.springMVC"/>
```














*****
