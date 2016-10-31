---
layout: blog
title:  使用Spring Boot构建应用
date:   2016-10-30
category: 编程技术
tag: Spring
---
`Spring Boot`于2014年4月发布1.0.0版本, 用于创建`Spring 4.0`项目, 简化了Spring中繁琐的配置, 提高了开发效率




*****

* TOC
{:toc}

*****

## Spring Boot简介
* `Spring Boot`致力于快速构建应用, 去掉了`Spring`的繁琐配置, 使创建Spring应用就像写一个`main`函数一样方便.
* 直接嵌入`Tomcat`或`Jetty`服务器, 不需要部署 WAR 文件, 可以直接`run`
* 无`XML`配置(也支持导入XML配置)
* 构建`Spring4`应用, 最好使用高版本环境(`JDK8`, `Maven3.2+`, `Servlet3.0+`)
* 提供了maven插件, 可把应用及所需要的所有依赖包内嵌到一个jar包中
* 提供了一个命令行工具`Spring Boot CLI`([安装方法](http://docs.spring.io/spring-boot/docs/1.4.1.RELEASE/reference/htmlsingle/#getting-started-installing-spring-boot))
* 支持`Groovy`编程语言

*****

## CLI和Groovy示例
`Spring Boot CLI`是一个命令行工具, 可以快速搭建Spring原型, 支持`Groovy`脚本.  
我们通过`CLI`使用`Groovy`脚本创建一个最简单的`Web`应用, 创建一个`app.groovy`文件, 内容如下:

~~~java
@RestController
class ThisWillActuallyRun {
    @RequestMapping("/")
    String home() {
        "Hello World!"
    }
}
~~~
然后在shell中运行下面命令:

~~~
$ spring run app.groovy
~~~
则已经运行了一个Spring web应用(首次运行需要下载依赖包, 比较慢), 访问`127.0.0.1:8080`就会看到输出内容`Hello World!`

*****

## 快速创建一个应用
通过`Maven`创建一个`Spring Boot`应用, `pom.xml`内容如下:

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.project</groupId>
    <artifactId>spring_boot</artifactId>
    <version>1.0</version>

    <!-- 继承spring-boot-starter-parent是最快的方式, 后面有不继承该怎么写 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.4.1.RELEASE</version>
    </parent>
    <!-- 这一个依赖就够了 -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
~~~
可以通过`mvn dependency:tree`来看看都用到了哪些jar包  

从`src/main/java/`目录下创建一个类`src/main/java/Example.java`:

~~~java
@RestController
@EnableAutoConfiguration
public class Example {
    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }
    public static void main(String[] args) throws Exception {
        SpringApplication.run(Example.class, args);
    }
}
~~~
到此整个应用就创建完毕, 可以直接运行`main`方法启动容器, 访问`127.0.0.1:8080`

*****

## 运行容器的方式
* 像上面那样直接运行`main`方法
* 通过`mvn spring-boot:run`命令运行
* 创建可执行`jar`包运行

通过插件`spring-boot-maven-plugin`可将应用及依赖打成`jar`包, 如果没有继承`spring-boot-starter-parent`则需要主动添加一下这个插件, 并且parent中的`<executions>`需要自己进行配置

~~~xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
        </plugin>
    </plugins>
</build>
~~~

通过命令`mvn package`打包, 将会得到`target/spring_boot-1.0.jar`文件, 可通过命令`jar tvf target/myproject-1.0.jar`查看该jar包的结构. 除此之外, 还有个文件`target/spring_boot-1.0.jar.original`, 这是`Spring Boot`重新打包之前, `Maven`创建的原始jar文件

使用命令`java -jar target/spring_boot-1.0.jar`即可运行

*****

## 依赖管理
上面都是以继承`spring-boot-starter-parent`的形式进行一来管理, 这个`parent`里有如下内容:

* 指定了Java的版本, 和编码(不继承parent可自己指定)
* <resource.delimiter>配置, 除了接受原有的Spring形式的`${…​}`, 还支持了Maven的`@..@`形式(不继承parent可自己指定)
* 包依赖管理, 继承自`spring-boot-dependencies`(不继承parent的形式就是引入这个pom)
* 插件配置(不继承parent需要自己配置)

因此, 如果不继承`spring-boot-starter-parent`, 我们的pom文件可以这么写:

~~~xml
    <properties>
        <java.version>1.8</java.version>
        <resource.delimiter>@</resource.delimiter> <!-- delimiter that doesn't clash with Spring ${} placeholders -->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <tomcat.version>7.0.57</tomcat.version> <!-- 配置你的tomcat版本 -->
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>1.4.1.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- 如果是通过parent方式继承spring-boot-starter-parent则不用配置此插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
~~~

*****

## 目录结构及配置
官方建议项目有一个标准的目录结构, 就像其他Spring项目一样, 包名采用一个反转的域名, 结构类似于下面这样:

~~~
com.example.myproject
         +- Application.java
         |
         +- service
         |   +- CustomerService.java
         |
         +- controller
             +- CustomerController.java
~~~
其中`Application.java`的内容如下:

~~~java
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
~~~
该项目中`Application.java`为main类, 将main类放到其他类所在包的顶层(`root package`), 并将`@EnableAutoConfiguration`注解加main类上, 这样就隐式地定义了一个基础包扫描路径, 所以采用`root package`时, `@ComponentScan`注解就不需要添加`basePackage`属性了

解释下这几个注解的意思:

* `@Configuration`: 表示一个配置类, 类似于原来的一个`xml`文件
* `@EnableAutoConfiguration`: Spring Boot的自动配置会根据所添加的jar包依赖自动配置Spring应用, 通常项目中只有一个`@EnableAutoConfiguration`注解, 并建议将它加到主配置类(`primary @Configuration`)上
* `@ComponentScan`: 包扫描路径, 采用`root package`形式会自动收集`root package`包下所有组件, 包括配置类(`@Configuration`类)

由于平时配置`main类`时, 频繁的一起使用`@Configuration、@EnableAutoConfiguration、@ComponentScan`这三个注解, 因此Spring Boot提供了一个简单的注解`SpringBootApplication`来代替这三个注解, 其效果与这三个注解一起使用的效果完全一样

另外, 还有几个有用的用法:

* `@Import`: 导入其他配置类
* `@ImportResource`: 引入`XML`形式的配置
* `@EnableAutoConfiguration(exclude={XXXConfiguration.class})`排除某些配置, 若配置类不在`classpath`中, 可以使用`excludeName`属性指定全限定名

*****
