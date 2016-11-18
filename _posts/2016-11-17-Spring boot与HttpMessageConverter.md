---
layout: blog
title:  Spring boot与HttpMessageConverter
date:   2016-11-17
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

## 默认的HttpMessageConverter
在构建`RESTful`服务时, 我们常常会把一个对象直接转换成`json`对象, 就像下面这样:

~~~java
@RestController
public class HomeController {
    @RequestMapping("/")
    Map<String, Object> home() {
        Map<String, Object> map = Maps.newHashMap();
        map.put("name", "中文");
        map.put("age", 18);
        return map;
    }
}
~~~

`Spring`提供了多种`HttpMessageConverter`让我们对结果进行转换, 像上面那样, 把对象转换成`json`格式输出, `Spring boot`默认使用`MappingJackson2HttpMessageConverter`进行转换. 如果我们想要使用另一个工具进行`json`转换, 或者想添加自己的`HttpMessageConverter`, `Spring boot`提供了多种不通的方式来实现.

## 自定义HttpMessageConverter
我们以`GsonHttpMessageConverter`为例, 除了主配置类之外, 我们添加另一个配置类, 从这个类中添加自己的`Converter`

### 方式一
直接添加一个`Bean`, 它将添加到`Converter`列表的最前面

* 优点: 简单, 无需继承其他类
* 缺点: 不容易直观地看出, 有一个`Converter`列表

代码如下:

~~~java

@Configuration
public class WebMvcConfig {
    @Bean
    public GsonHttpMessageConverter gsonHttpMessageConverter() {
        Gson gson = new GsonBuilder().serializeNulls()    // null 也序列化
                .setDateFormat("yyyy-MM-dd HH:mm:ss")     // 时间转化为特定格式 yyyy-MM-dd HH:mm:ss
                .create();
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        converter.setGson(gson);
        return converter;
    }
}
~~~

### 方式二
继承`WebMvcConfigurerAdapter`, 覆盖`configureMessageConverters`方法

* 优点: 直观看到有个`List`, 断点调试会发现, 这是向列表中添加的第一个`Converter`
* 缺点: 要是有多个配置也以同样的方式添加了其他`Converter`, 就无法保证以固定的顺序添加到列表中了

代码如下:

~~~java
@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        Gson gson = new GsonBuilder().serializeNulls()    // null 也序列化
                .setDateFormat("yyyy-MM-dd HH:mm:ss")     // 时间转化为特定格式 yyyy-MM-dd HH:mm:ss
                .create();
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        converter.setGson(gson);
        converters.add(converter);
    }
}
~~~

### 方式三
继承`WebMvcConfigurerAdapter`, 覆盖`extendMessageConverters`方法

* 优点: 这个方法在其他`Converter`加入列表之后执行, 可以进行精确控制, 如顺序等
* 缺点: 同样有可能, 别的配置里也以相同方式重写了这个方法

代码如下:

~~~java
@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.clear();  // 把其他 converter 清除掉
        Gson gson = new GsonBuilder().serializeNulls()    // null 也序列化
                .setDateFormat("yyyy-MM-dd HH:mm:ss")     // 时间转化为特定格式 yyyy-MM-dd HH:mm:ss
                .create();
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        converter.setGson(gson);
        converters.add(converter);
    }
}
~~~

*****
