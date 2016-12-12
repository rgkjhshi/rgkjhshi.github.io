---
layout: blog
title:  Spring Boot多数据源配置
date:   2016-12-12
category: 编程技术
tag: Spring
---



*****

* TOC
{:toc}

*****

在([Spring Boot集成MyBatis](http://loveshisong.cn/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2016-11-06-Spring-Boot%E9%9B%86%E6%88%90MyBatis.html))一文介绍了配置数据源的简单方法, 本文介绍如何配置多个数据源, 如何与`MyBatis`配合多个数据源使用.

## 多数据源
假设我们有三个数据源, 配置这三个数据源的方法非常简单, 首先在`application.properties`文件中添加这三个数据源的相关配置:

~~~
# 默认数据源
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db0
spring.datasource.username=root
spring.datasource.password=123123
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
# 数据源db1配置
custom.datasource.ds1.url=jdbc:mysql://127.0.0.1:3306/db1
custom.datasource.ds1.username=root
custom.datasource.ds1.password=123123
custom.datasource.ds1.driver-class-name=com.mysql.jdbc.Driver
# 数据源db2配置
custom.datasource.ds2.url=jdbc:mysql://127.0.0.1:3306/db2
custom.datasource.ds2.username=root
custom.datasource.ds2.password=123123
custom.datasource.ds2.driver-class-name=com.mysql.jdbc.Driver
~~~
我们可以通过一个配置类把这三个数据源加到spring容器中:

~~~java
@Configuration
public class DataSourceConfig {
    @Bean("ds0")
    @Primary  // 这个注解表示主数据源
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource ds0() {
        // 这里也可以使用其他连接池, 比如 DruidDataSource
        return new DruidDataSource();
    }
    @Bean("ds1")
    @ConfigurationProperties(prefix = "custom.datasource.ds1")
    public DataSource ds1() {
        return DataSourceBuilder.create().build();
    }
    @Bean("ds2")
    @ConfigurationProperties(prefix = "custom.datasource.ds2")
    public DataSource ds2() {
        return DataSourceBuilder.create().build();
    }
}
~~~

多数据源的配置就这么简单, 在用到的地方可以直接通过数据源的`name`注入

*****
