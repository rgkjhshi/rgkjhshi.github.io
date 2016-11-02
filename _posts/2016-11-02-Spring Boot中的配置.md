---
layout: blog
title:  Spring Boot中的配置
date:   2016-11-02
category: 编程技术
tag: Spring
---
这里所说的配置是指`properties`文件这样的配置




*****

* TOC
{:toc}

*****

## 配置的方式及优先级
`Spring Boot`允许通过`properties`文件, `YAML`文件, `Environment`变量, 命令行参数等进行配置. 属性值可以通过`@Value`注入到bean中并通过Spring的`Environment`访问, 或通过`@ConfigurationProperties`直接绑定到对象上.

`Spring Boot`所提供的配置优先级从高到低如下所示:

1. Spring的`devtools`的全局配置(`~/.spring-boot-devtools.properties`文件)(当使用了`devtools`时)
2. Test类上通过`@TestPropertySource`声明的属性文件
3. Test类上通过`@SpringBootTest#properties`声明的属性
4. 命令行参数
5. `SPRING_APPLICATION_JSON`属性, 环境变量或系统属性中的JSON
6. `ServletConfig`初始化参数
7. `ServletContext`初始化参数
8. 来自于`java:comp/env`的JNDI属性
9. Java系统属性(`System.getProperties()`)
10. 操作系统环境变量
11. 通过`RandomValuePropertySource`生成的`random.*`属性
12. jar包外的`profile`配置文件(`application-{profile}.properties`和`YAML`配置)
13. jar包内的`profile`配置文件(`application-{profile}.properties`和`YAML`配置)
14. jar包外的应用程序配置文件(`application.properties`和`YAML`配置)
15. jar包内的应用程序配置文件(`application.properties`和`YAML`配置)
16. 配置类(`@Configuration`类)上的通过`@PropertySource`注解声明的属性文件
17. 通过`SpringApplication.setDefaultProperties`声明的默认属性

### 优先级举例
在`classpath:application.properties`文件里有个`name`变量(假设将它打成了jar包), 当在一个新的环境中运行时,
可以通过在jar包外(即新环境的的`classpath`下)提供一个`application.properties`文件, 重新设置`name`变量的值.
甚至在测试的时候,可以通过优先级更高的命令行参数指定`name`的值(`java -jar app.jar --name="Spring"`)

### 命令行参数
`SpringApplication`会把所有的命令行参数(以`--`开头, 如`--server.port=9000`)转化为属性加载到Spring的`Environment`中, 命令行参数的优先级高于配置文件

如果不想让命令行参数添加到`Environment`中, 可通过`SpringApplication.setAddCommandLineProperties(false)`设置

### SPRING_APPLICATION_JSON
上面第5条中说的`SPRING_APPLICATION_JSON`属性, 可以在命令行中指定

~~~
$ SPRING_APPLICATION_JSON='{"foo":{"bar":"spam"}}' java -jar myapp.jar  // 环境变量形式
~~~
这样就相当于在Spring的`Environment`中添加了`foo.bar=spam`.  
也可以像下面这些方式提供:

~~~
$ java -Dspring.application.json='{"foo":"bar"}' -jar myapp.jar   // 系统变量
$ java -jar myapp.jar --spring.application.json='{"foo":"bar"}'   // 命令行参数
~~~
或以JNDI变量`java:comp/env/spring.application.json`提供

其实上面介绍的这几条优先级比较高的配置, 实际并不太常用. 命令行在测试的时候用的还算比较多

*****

## 配置文件:`application.properties`
`SpringApplication`默认会加载配置文件`application.properties`中的配置并加到Spring `Environment`中, 该文件的加载有个优先级: `classpath:/config/application.properties` > `classpath:/application.properties`即在`classpath:/config/`下的配置文件优先级比较高. 也可以使用YAML文件(`application.yml`)来替代properties文件.

`application.properties`文件中默认有很多属性, 比如`server.port=8080`等; 你可以覆盖这些默认配置, 当然也可以把自己的配置放到这个默认加载的配置文件里.

配置文件的名字和位置, 也可自定义, 可通过`spring.config.name`和`spring.config.location`环境属性来指定, 这两个属性使用的时期非常早, 所以一般会在命令行或者系统属性或环境变量中来指定, 如:

~~~
$ java -jar myproject.jar --spring.config.name=myproject
$ java -jar myproject.jar --spring.config.location=classpath:/default.properties,classpath:/override.properties
~~~
若`spring.config.location`指定的是一个目录, 则应该以`/`结尾, 并且使用该目录下`spring.config.name`指定的配置文件

### 随机变量
`RandomValuePropertySource`可以注入一些随机变量, 可产生`integer, long, string, uuid`等类型的随机值, 例如

~~~
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.uuid=${random.uuid}
my.number.less.than.ten=${random.int(10)}
my.number.in.range=${random.int[1024,65536]}
~~~

`random.int*`的语法为`OPEN value (,max) CLOSE`, `OPEN,CLOSE`是字符, `value,max`是整数. 如果有`max`则最小值是`value`最大值是`max`(不包括max).

### 变量引用
`application.properties`中定义的变量已经被`Environment`过滤, 所以可以引用前面定义过的变量, 比如:

~~~
app.name=MyApp
app.description=${app.name} is a Spring Boot application
~~~

*****

## 多环境配置
* 从配置的优先级的第12~15条可以看出, `application-{profile}.properties`的优先级要高于`application.properties`.
* 这个`profile`就用于区分是`dev`环境还是`beta`环境还是`prod`环境. 如果没有被指定, 默认会使用`application-default.properties`配置.
* 至于到底启用哪个`profile`, 可以在`application.properties`中通过属性`spring.profiles.active=profile`来指定, 在`profile`配置文件中指定该属性不起作用.

举个例子, `application.properties`中有个默认属性`server.port=8080`用于指定服务的端口. 假设有下面的文件, 文件内容如下:

~~~java
// application.properties
server.port=8080
spring.profiles.active=dev
// application-default.properties
server.port=8081
// application-dev.properties
server.port=8082
// application-prod.properties
server.port=8083
~~~

假设`application.properties`中不指定`spring.profiles.active`属性, 则`application-default.properties`中的8081端口生效, 若指定`spring.profiles.active=prod`, 则8083端口生效. 访问8080端口都会找不到服务

*****

## 自定义配置
`Spring Boot`默认加载`application.properties`中的配置, 这个文件中的默认属性相当多...  
如果我们要加载自己的配置, 比如下面的数据库配置:

~~~
db.driver=MySQL
db.username=username
db.password=123456
db.tables[0]=table1
db.tables[1]=table2
~~~
可以把这些属性直接放到`application.properties`中, 但极力不推荐这样.

### 传统的配置加载方式
我们一般都是定义自己的配置文件, 比如把这些属性放到`db.properties`文件. 然后通过`@PropertySource`加载配置文件, 然后通过`@Value("${key:defaultVlaue}")`的形式进行配置, 如下:

~~~java
@Component
@PropertySource("db.properties")
public class DBConfig {
    @Value("${db.driver}")
    private String driver;

    @Value("${db.username}")
    private String username;

    @Value("${db.password}")
    private String password;

    @Value("${db.tables[0]}")
    private String table1;

    @Value("${db.tables[1]}")
    private String table2;

}
~~~

### 类型安全的配置加载方式
上面这种方式在`Spring Framework`普遍使用, 但是 `Spring Boot`提供了更高级的使用配置的方式,类似于`Spring`中的`DataBinder`工具. 还是`db.properties`文件, 我们可以这样进行数据绑定:

~~~java

@Data
@Component
@ConfigurationProperties(prefix="db", locations = "classpath:db.properties")
public class DBConfig {
    private String driver;
    private String username;
    private String password;
    private List<String> tables;
}
~~~
最上面的`@Data`是`Lombok`包中用于生成`getter, setter`等的注解, pom依赖为:

~~~xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.16.10</version>
</dependency>
~~~
不用这个包也可以, 那就需要自己写 `getter`和`setter`方法了

另外注意此时该类上是加了`@Component`注解的, 这样才会被当作Spring的Bean.

其实不在`DBConfig`上加`@Component`注解也有办法, 通常`@ConfigurationProperties`是和`@EnableConfigurationProperties`一起使用的, `@EnableConfigurationProperties`注解需要加到配置类上.
像下面这样使用:

~~~java
// 配置类
@SpringBootApplication
@EnableConfigurationProperties({DBConfig.class})
public class Application {
  // 代码
}
// 加载属性的类(主意这个类没有加 @Component 注解)
@ConfigurationProperties(prefix="db", locations = "classpath:db.properties")
public class DBConfig {
  // 代码
}
~~~

这种形式, `@ConfigurationProperties`bean将会以名字`<prefix>-<fqn>`注册, `<prefix>`就是注解中指定的前缀, `<fqn>`是该类的全类名. 上面的`DBConfig`将会被注册成名字为`db-com.example.myproject.config.DBConfig`的bean

### `@ConfigurationProperties`的优缺点
优点:

* 结构化, 对于结构化的配置, 优势明显
* 松散绑定, `Environment`属性名和`@ConfigurationProperties Beans`属性名不需要精确匹配, 比如驼峰`person.firstName`, 虚线`pserson.first-name`, 下划线`person.first_name`, 大写`PERSON_FIRST_NAME`都能正确区分绑定
* 可校验, 可以在属性上添加`@NotNull`, `@NotEmpty`等(JSR-303)注解进行校验
* 可生成`meta-data`文件(可被IDE使用)

缺点:

* 不支持`SpEL`表达式

## 使用YAML配置
`YAML`是`JSON`的超集, 有一定的结构, `SpringApplication`提供了对`YAML`的支持.
使用`YAML`配置文件需要确保在classpath中引入了`SnakeYAML`包, `spring-boot-starter`中已经包含了`SnakeYAML`包, 也可以主动显式地添加pom依赖:

~~~xml
<dependency>
	  <groupId>org.yaml</groupId>
		<artifactId>snakeyaml</artifactId>
		<version>1.17</version>
</dependency>
~~~

### 加载`application.yml`
`Spring Boot`会自动加载这个配置, 因此效果跟`application.properties`一样。  
Spring 提供了两个方便的类加载`YAML`, `YamlPropertiesFactoryBean`把`YAML`作为`Properties`加载, `YamlMapFactoryBean`把`YAML`作为`Map`加载;  
 `YamlPropertySourceLoader`可以把`YAML`作为`PropertySource`加到Spring `Environment`中, 这样就可以用`@Value`的方式进行注入了.

 比如下面的写法是一样的

~~~
// yml文件
environments:
    dev:
        url: http://dev.bar.com
        name: Developer Setup
    prod:
        url: http://foo.bar.com
        name: My Cool App
my:
    servers:
        - dev.bar.com
        - foo.bar.com
// properties文件
environments.dev.url=http://dev.bar.com
environments.dev.name=Developer Setup
environments.prod.url=http://foo.bar.com
environments.prod.name=My Cool App
my.servers[0]=dev.bar.com
my.servers[1]=foo.bar.com
~~~

### 加载自定义`YAML`配置
遗憾的是, `YAML`不能像`properties`文件一样使用`@PropertySource`注解的方式加载.  
加载自定义的`YAML`文件可以通过`@ConfigurationProperties`注解来加载, 如:`@ConfigurationProperties(prefix="db", locations = "classpath:db.yml")`

*****
