---
layout: blog
title:  Spring boot在外部tomcat的部署
date:   2016-11-21
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****
`Sprign boot`提供了内嵌的`tomcat`, 允许我们直接把项目打包成`fat jar`来运行. 但有时候我们仍想像之前一样,使用外部的`tomcat`, 将项目打成`war`包来发布. `Spring boot`同样提供了非常简单的解决方案

第一步, 在`pom`中添加`<packaging>war</packaging>`标签

第二步, 主配置类`Application.java`继承`SpringBootServletInitializer`并重写`configure`方法

~~~java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(this.getClass());
    }
    public static void main(String[] args) {
        SpringApplication springApplication = new SpringApplication(Application.class);
        springApplication.run(args);
    }
}
~~~

第三步, 修改pom, 把内嵌tomcat改成`provided`. 这样我们可以很方便的切换成在本地通过`main`方法来启动应用(去掉`provided`就可以了).

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
~~~
这三步就可以像原来一样打包部署到外部`tomcat`了

*****
