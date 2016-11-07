---
layout: blog
title:  Spring Boot中的日志
date:   2016-11-03
category: 编程技术
tag: Spring
---





*****

* TOC
{:toc}

*****

## 日志的配置
`Spring Boot`支持各种日志工具, 最常用的是`Logback`. 我们可以对日志进行配置, 由于日志是在`ApplicationContext`创建之前初始化的, 所以对日志的配置不能通过在`@Configuration`配置类上使用`@PropertySources`注解加载进来. 可以使用系统变量或者外部配置`application.properties`来加载.  配置文件中可以指定这些属性:

* `logging.config=`: 配置文件的位置, 比如:`classpath:logback.xml`(logback的配置文件)
* `logging.file=`: 日志文件名, 如:`myapp.log`, 输出日志到当前目录的`myapp.log`文件
* `logging.path=`: 日志文件位置, 如:`/var/log`, 输出日志到`/var/log/spring.log`文件
* `logging.level.*=`: 日志等级, 如:`logging.level.org.springframework=DEBUG`
* `logging.pattern.console=`: 输出到`console`的日志格式, 只有logback有效
* `logging.pattern.file=`: 输出到文件的日志格式, 只有logback有效
* `logging.pattern.level=`: 日志级别的格式, 默认是`%5p`. 只有logback有效
* `logging.exception-conversion-word=%wEx`: log异常时使用哪个格式转换器(`base.xml`中定义了三个`conversionRule`)
* `logging.register-shutdown-hook=false` # Register a shutdown hook for the logging system when it is initialized(没用过)

上面这些属性配置, 一般写在`application.properties`中, 这样会被加载到`Spring Environment`中, 为了方便其他地方使用, `Spring Environment`中的一些属性也被转换到了系统属性(`System property`)里, 下面是这些属性于系统属性的对应关系:

| Spring Environment                  | System Property                 |
|: ---------------------------------- |: ------------------------------ |
| `logging.exception-conversion-word` | `LOG_EXCEPTION_CONVERSION_WORD` |
| `logging.file`                      | `LOG_FILE`                      |
| `logging.path`                      | `LOG_PATH`                      |
| `logging.pattern.console`           | `CONSOLE_LOG_PATTERN`           |
| `logging.pattern.file`              | `FILE_LOG_PATTERN`              |
| `logging.pattern.level`             | `LOG_LEVEL_PATTERN`             |
| `PID`                               | `PID`                           |

### 日志配置文件
`logging.config`属性用于指定日志配置文件的位置, 以`logback`为例.

* 如果不指定该属性, `logback`本身会默认寻找`classpath`下的配置文件, 寻找顺序为:
`logback.groovy > logback-test.xml > logback.xml`;  
* `Spring Boot`又加了俩默认的配置文件:`logback-spring.groovy > logback-spring.xml`, 这俩优先级低于上面的那三个. 推荐指定使用`logback-spring.xml`.
* 不指定配置文件时, 寻找上面的配置文件, 制定了则加载指定的配置文件. 如:`logging.config=classpath:logback-abc.xml`, 则会加载`classpath`下的`logback-abc.xml`文件

使用`groovy`需要添加`groovy`的包依赖:

~~~xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy</artifactId>
    <version>2.4.7</version>
</dependency>
~~~

### 输出到日志文件
`logging.file`和`logging.path`这俩属性用于指定日志文件输出的位置. 默认情况下`Spring Boot`只会把日志输出到`console`, 添加了这两个属性(任意一个即可), 才会把日志输出到文件里.

* 两个属性都不指定, 只输出到控制台, 不输出到文件
* `logging.file`指定文件, 可以是相对路径, 可以是绝对路径.  
* `logging.path`指定目录, 若制定了目录, 则会输出日志到指定目录下的`spring.log`文件中
* 两个同时指定, 以`logging.file`为准

在`spring-boot`包里关于`logback`的配置`file-appender.xml`中定义了文件输出到`${LOG_FILE}`, 在同一包下的`base.xml`文件里有这么一句:`<property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}}/spring.log}"/>`. 稍微分析下就知道为什么以`logging.file`为主, 指定`logging.path`时会输出到该目录下的`spring.log`文件里了.  
注意上面语句中多次嵌套使用了`${key:-defaultVlaue}`形式

### 日志级别
`logging.level.*`用于指定日志级别, 比如:

~~~sh
logging.level.root=WARN
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=ERROR
~~~

注意: 该属性配置的日志级别优先级要高于日志配置文件(如`logback.xml`), 即日志配置文件中与该属性定义的日志级别不一致时, 以该属性定义的级别为准.

### 日志格式

* `ogging.pattern.console`指定在控制台输出的日志格式;
* `ogging.pattern.file`指定在文件输出的日志格式;
* `ogging.pattern.level`指定日之级别(`DEBUG, INFO, ERROR`等)的格式, 默认为`%5p`;

这些属性不指定时, 默认的格式在`spring-boot`包中的`DefaultLogbackConfiguration`类里有定义, 在`defaults.xml`里也有定义  
格式大致为:  
`2016-11-02 21:59:11.366  INFO 11969 --- [           main] o.apache.catalina.core.StandardService   : Starting service Tomcat`  
依次为: `时间 日志级别 PID --- [线程名] 日志名 : 日志内容`

*****

## 如何写自己的日志配置文件

`spring-boot`包里有四个相关的`xml`文件:

* `console-appender.xml`: 定义了控制台输出的日志格式
* `file-appender.xml`: 定义了一个日志的文件输出格式(指定每个文件`10M`)
* `defaults.xml`: 定义了一些日志级别
* `base.xml`: 包含了上面3个文件, 并指定了`root`的输出级别和输出方式

我们的日志配置线上不需要输出到`console`, 日志文件的大小一般也不会是`10M`, 所以上面那几个文件, 我们可以参考.

比如我们可以这样定义`logback.xml`

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 这里面定义了 CONSOLE_LOG_PATTERN, FILE_LOG_PATTERN 等日志格式, 还定义了一些日志级别 -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <!-- 命令行输出, 一般线上不用 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder  charset="UTF-8">
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <property name="LOG_FILE_NAME" value="myLog"/> <!-- 定义一个属性, 下面用 -->

    <!-- 输出格式 appender -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${catalina.base}/logs/${LOG_FILE_NAME}.log</file>  <!-- 可自己定义 -->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern> <!-- 输出格式也可自己定义 -->
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${catalina.base}/logs/${LOG_FILE_NAME}.%d{yyyy-MM-dd}.log</fileNamePattern>
        </rollingPolicy>
    </appender>

    <!-- error 日志 appender -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${catalina.base}/logs/${LOG_FILE_NAME}_error.log</file>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
        <encoder  charset="UTF-8">
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${catalina.base}/logs/${LOG_FILE_NAME}_error.%d{yyyy-MM-dd}.log</fileNamePattern>
        </rollingPolicy>
    </appender>

    <!-- 定义日志级别, 也可在应用配置中指定 -->
    <logger name ="com.example.project" level="INFO" />
    <logger name="org.springframework.web" level="DEBUG"/>
    <root level="ERROR">
        <appender-ref ref="CONSOLE" /> <!-- 线上不需要输出到 CONSOLE -->
        <appender-ref ref="FILE" />
        <appender-ref ref="ERROR_FILE" />
    </root>
</configuration>
~~~

* 上例中, 日志会输出到文件`XXX.log`, 错误日志单独输出到一个`XXX_error.log`文件, 日志文件并每天打包一次.  
* 上例中, 应用配置(`application.properties`)里用于指定日志文件名文件位置的属性(`logging.file`和`logging.path`)将不起作用, 因为例子里没有用到这些属性, 其他配置(比如日志级别)仍有作用.
* 上例中的哪个`${catalina.base}`算是一个系统变量, 表示应用所在目录, 文件名(位置)完全可以自己指定, 也可参考`spring-boot`包里的使用方式.

*****
