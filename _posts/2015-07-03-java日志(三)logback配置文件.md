---
layout: blog
title:  java日志(三):logback配置文件
date: 2015-07-03
category: 编程技术
tag: Java日志
---
logback配置文件的简单介绍，主要内容均来自[logback官方文档](http://logback.qos.ch/manual/)




*****

* TOC
{:toc}

*****

## logback配置文件的结构

logback配置文件的跟节点为`<configuration>`,它的子节点有3个:`root、logger、appender`，除了`root`之外，每个都可以多次出现。  
下面是我画的一个结构图，实线表示节点，虚线表示属性

![logback配置文件结构图]({{ "/static/images/logbak_config.png"  | prepend: site.baseurl }} "结构图")

* `appender`:用于描述日志的输出格式，是输出到控制台还是输出到文件，日志滚动打包策略等。
* `logger`:用来制定把什么内容用哪个`appender`输出。
* `root`:默认的`logger`。

******

## configuration元素
`configuration`元素是logback配置文件的根元素，它也有许多可选属性，如: `debug、scan、scanPeriod`等

### debug 属性
如果logback的配置文件加载过程中出现了warning或error，则logback会把自身状态的日志打印出来，如下:

~~~
00:16:31,885 |-INFO in ch.qos.logback.classic.joran.action.LoggerAction - Setting level of logger [com.test.log] to INFO
00:16:31,885 |-INFO in ch.qos.logback.classic.joran.action.LoggerAction - Setting additivity of logger [com.test.log] to false
00:16:31,885 |-ERROR in ch.qos.logback.core.joran.action.AppenderRefAction - Could not find an appender named [STDOUT]....
00:16:31,885 |-ERROR in ch.qos.logback.core.joran.action.AppenderRefAction - See ... for more details.
00:16:31,885 |-INFO in ch.qos.logback.classic.joran.action.RootLoggerAction - Setting level of ROOT logger to DEBUG
00:16:31,885 |-ERROR in ch.qos.logback.core.joran.action.AppenderRefAction - Could not find an appender named [STDOUT]....
00:16:31,885 |-ERROR in ch.qos.logback.core.joran.action.AppenderRefAction - See ... for more details.
00:16:31,885 |-INFO in ch.qos.logback.classic.joran.action.ConfigurationAction - End of configuration.
00:16:31,888 |-INFO in ch.qos.logback.classic.joran.JoranConfigurator@36577c06 - Registering current configuration as...
~~~
如果加载过程未出现警告或者错误，就不会打印出来了。  
若指定了`debug="true"`，即使不出现警告和错误，也会打印出logback内部的状态日志。

### scan 属性
可通过属性设置`scan="true"`，在配置文件发生改变时自动重新加载配置文件，默认1分钟重新扫描一次。  
可通过属性设置`scanPeriod="30 seconds"`，指定30秒扫描一次。  
扫描间隔的单位可以是`milliseconds, seconds, minutes 或 hours`，若不指定单位，默认为`milliseconds`。

*****

## logger元素
`logger`元素用于配置代码中的logger，它有属性如: `name、level、additivity`，其中`name`属性是必须的，其他2个可选。
有0个或多个子元素`<appender-ref ref="STDOUT" />`来指定日志输出的格式。若0个，则不指定输出格式，就不会输出了。  
**注意**`root`是最顶级的logger，它只有个可选属性level。

### name 属性
在java代码中，getLogger(String className)的参数一样获取到的logger是同一个，如下面的`logger1`和`logger2`就是同一个对象:

~~~java
Logger logger1 = LoggerFactory.getLogger("org.slf4j.Logger");
Logger logger2 = LoggerFactory.getLogger("org.slf4j.Logger");
~~~
日志`logger`有个`name`属性，跟代码中传的参数有一定的关系，举个例子:

~~~java
    <!-- 配置文件中 -->
    <logger name="A.B" level="debug" >
    // java 代码中
    Logger logger = LoggerFactory.getLogger("A.B.C");
~~~
输出的日志会先在配置文件中匹配名字为"A.B.C"的logger，未找到，匹配到了"A.B"的logger，则按照其指定的`appender`格式进行输出。

### level属性
日志的级别有: `TRACE < DEBUG < INFO <  WARN < ERROR (ALL、OFF)`  
日志级别是可以继承的，root不用指定级别，默认就是"DEBUG". 举个继承的例子:

| Logger name | Assigned level | Effective level |
|: ---------- |: ------------- |: -------------- |
| root        | DEBUG          | DEBUG           |
| X           | INFO           | INFO            |
| X.Y         | 未指定          | INFO(继承来的)   |
| X.Y.Z       | ERROR          | ERROR(自己有)    |

### additivity属性
该属性表示日志的可叠加性，默认为true,表示到达本logger的日志通过本日志的appender指定格式输出之后， 仍会将日志扩散给父logger。  
弄个表格就容易看清楚了:

| Logger Name | Attached Appenders | Additivity Flag | Output Targets | Comment |
|: ---------- |: ------------- |: -------------- |: ------------- |: -------------- |
| root        | A1             | not applicable  | A1             | root没有父logger,所以additivity属性对root不适用    |
| x           | A-x1, A-x2      | true           | A1,<br> A-x1, A-x2     | "x"(自己)的appender,<br> 扩散到root的appender    |
| x.y         | none            | true           | A1,<br> A-x1, A-x2     | 扩散到"x"和root的appender    |
| x.y.z       | A-xyz1          | true           | A1,<br> A-x1, A-x2<br> A-xyz1     | "x.y.z"的appender<br> 扩散到"x"和root的appender    |
| security    | A-sec           | false          | A-sec     | additivity=false, 只用到 appender A-sec   |
| security.access    | none     | true           | A-sec     | "security"中的additivity＝false. 只扩散到了"security" 的appender   |

**注意**  
最后一个小例子:

~~~java
    // java代码,A.B.C包中的类
    logger.debug("debug");
    logger.info("info");
    // logger配置: 无additivity,默认true会扩散，无appender-ref,不会打印
    <logger name="A.B.C" level="info" />
    // root配置: 级别为最高的OFF
    <root level="OFF">
        <appender-ref ref="STDOUT"/>
    </root>
~~~
运行的结果是会打印"info".  
因为logger配置了级别为info，但是并不打印，扩散到了root;  
root级别为OFF，但是logger扩散过来的日志级别仍为继承的info.  
所以只有A.B.C包中级别大于等于info的日志会被打印。

## appender元素
`appender`元素内容稍微多点，它有2个必需属性:`name`和`class`。  
有3个可选的子元素`<encoder>、<layout>、<filter>`，这3个子元素可有0个或者多个。  
一般只用`<encoder>`，它包装了`<layout>`。

### encoder 子元素
`encoder`的作用是把消息转化成输出流，可以控制消息怎么转化，何时输出等。  
而`layout`仅指定消息输出的格式，不能控制消息什么时候输出，不能控制消息暂存到flush然后一下子批量输出。  
实际上`encoder`内部包装了`PatternLayout`，然后又多了一些控制功能。
来个例子:

~~~xml
<!-- 一般这样写 -->
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
  <file>testFile.log</file>
  ...
  <!-- 默认的class就是这个最常用的Encoder类型，所以class可以不指定 -->
  <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
     <!-- encoder 包装了ch.qos.logback.classic.PatternLayout -->
    <pattern>%msg%n</pattern>
    <!-- 是否立刻输出，默认为true,为false表示先存到缓冲区，然后一起输出，速度是true的4倍，但是appender不正常关闭可能导致丢失缓冲区里的log -->
    <immediateFlush>false</immediateFlush>
  </encoder>
</appender>
<!-- 这种写法基本不推荐 -->
<appender name="FILE" class="ch.qos.logback.core.FileAppender">
  <file>testFile.log</file>
  ...
  <layout class="ch.qos.logback.classic.PatternLayout">
    <pattern>%msg%n</pattern>
  </layout>
</appender>  
~~~

### layout 子元素
`layout`用于指定输出格式,有个class属性，不写默认是`ch.qos.logback.classic.PatternLayout`。  
也可以自己定义layout，然后像下面这样使用(一般也不自己定义):

~~~xml
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
      <layout class="chapters.layouts.MySampleLayout" />
    </encoder>
  </appender>
~~~
我们一般使用的方式是上一小结那样，仅自己指定输出格式,输出格式很有必要说明,先来个简单的介绍,下一小节详细介绍pattern

~~~xml
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <!-- class默认就是这个类，可不写 -->
    <layout class="ch.qos.logback.classic.PatternLayout">
        <!-- %d表示日期，
             %thread表示线程名，
             %-5level：级别左对齐显示最少5个字符宽度(不足则补空格),
             %msg：日志消息，
             %n是换行符
        -->
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </layout>
</appender>
~~~

### 日志格式的详细说明(pattern元素)
不管是`encoder`元素中还是`layout`元素中，都少不了`pattern`，它是用来描述日志输出格式的。  
下面就是格式的详细介绍

* **长度限定 : {length}**

像`%logger, %class`等都可以通过`length`来限定长度，对其进行缩写，不过这个长度有点特殊，举个例子说明会更明白:

~~~java
有个logger这样定义:
private static final Logger logger = LoggerFactory.getLogger("Aaaaa.Bbbbb.TestLength");
   格式       |       结果
%logger{0}    :   TestLength
%logger{1}    :   A.B.TestLength
%logger{17}   :   A.B.TestLength
%logger{18}   :   A.Bbbbb.TestLength
%logger{21}   :   A.Bbbbb.TestLength
%logger{22}   :   Aaaaa.Bbbbb.TestLength
~~~
最右边的那个类名总是显示的;  
由于`A.Bbbbb.TestLength`长度为18，所以`0<lenght<18`时会被缩写成`A.B.TestLength`;  
由于`Aaaaa.Bbbbb.TestLength`长度为22，所以`18<lenght<22`时会被缩写成`A.Bbbbb.TestLength`;  
`lenght>=22`时不缩写;  

**length总结** :

1. 0只显示短类名(最右边的); 非0显示全类名，但是包名可能会被缩写，缩写成只有一个首字母
2. 缩写时最外层包最先被缩写，右边的包名最先不被缩写
3. 不缩写的前提是: `总长度<=lenght`

* **日志名 : %c{length} / %lo{length} / %logger{length}**

产生日志的Logger的全名，可通过length缩写， `%logger{36}、%c{36}`效果是一样的。  

* **类名 : %C{length} / %class{length}**

产生日志的类的全名， 如类"A.B.MyClass"中有个Logger名字为"A.B.MyLogger"，前者是类名，后者是日志名。

* **方法名 : %M / %method**

产生日志的方法名。

* **文件名 : %F / %file**

产生日志的java源文件名， 如"LogbackTest.java"。

* **行号 : %L / %line**

日志行产生的行号。

* **日志内容 : %m / %msg / %message**

日志中输出的信息

* **时间 : %d{pattern} / %date{pattern} / %message**

产生日志的时间。日志的格式如下:

~~~java
%d	                   : 2015-07-07 22:45:25,665
%date	               : 2015-07-07 22:45:25,665
%date{HH:mm:ss.SSS}	   : 22:45:25.665
%date{yyyy-MM-dd HH:mm:ss.SSS}	2015-07-07 22:45:25.665
注意那个毫秒前一定要写成点(.)
~~~

* **格式控制**

`"."`前面是最短长度，不够则补白；`"."`后面是最大长度。直接来个例子:

~~~java
   格式化串         logger名                结果
[%20.20logger]	  main.Name             [           main.Name]
[%-20.20logger]   main.Name             [main.Name           ]
[%10.10logger]	  main.foo.foo.bar.Name [o.bar.Name]
[%10.-10logger]	  main.foo.foo.bar.Name [main.foo.f]
~~~


*****
