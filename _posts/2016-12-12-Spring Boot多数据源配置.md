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

## 多数据源配置
假设我们有三个数据源, 配置这三个数据源的方法非常简单, 首先在`application.properties`文件中添加这三个数据源的相关配置:

~~~sh
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

多数据源的配置就这么简单, 在用到的地方可以直接通过数据源的`name`注入, 下面介绍如何配合使用多数据源.

*****

## MyBatis使用多数据源
先交代下场景. 假设我们有两个数据源(就用上面的ds0和ds1), 除了数据源的配置文件跟原来不一样, 其他跟普通的`MyBatis`项目一样(SQL映射文件暂时不用注解, 还是使用mapper映射文件来写sql). 相关的文件和目录结构如下:

~~~sh
# 源码目录结构 父目录为: com.example.demo
+- Application.java
|
+- config  # 这是数据源的配置
|   +- DS0Config.java
|   +- DS1Config.java
|
+- dao  # 这是Mapper映射接口, 分别放到两个目录里
|   +- ds0
|   |   +- Test0Dao.java
|   +- ds1
|   |   +- Test1Dao.java
# 资源文件
resource/sqlmaps
|   +- ds0
|   |   +- test0.xml
|   +- ds1
|   |   +- test1.xml
~~~
如何配置`MyBatis`之前的文章已经做过介绍, 这里只看两个配置类是如何写的:

~~~java
// DS0Config.java
@Configuration
@MapperScan(basePackages = "com.example.demo.dao.ds0", sqlSessionFactoryRef = "ds0SqlSessionFactory")
public class DS0Config {
    @Bean
    @Primary  // 这个数据源设置为主要数据源
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource ds0() {
        return new DruidDataSource();
    }
    @Bean  // 如果这里不用 Qualifier 指定, 则注入的是Primary数据源
    public SqlSessionFactory ds0SqlSessionFactory(@Qualifier("ds0") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        // 领域模型包位置
        sessionFactory.setTypeAliasesPackage("com.example.demo.domain");
        // 设置映射文件的位置
        sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:sqlmaps/ds0/*.xml"));
        return sessionFactory.getObject();
    }
    @Bean
    public SqlSessionTemplate ds0SqlSessionTemplate(@Qualifier("ds0SqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}

// DS1Config.java
@Configuration
@MapperScan(basePackages = "com.example.demo.dao.ds1", sqlSessionFactoryRef = "ds1SqlSessionFactory")  // 这个包里的mapp使用的是ds1数据源
public class DS1Config {
    @Bean
    @ConfigurationProperties(prefix = "custom.datasource.ds1")  // 自动会把属性注入到对应的字段
    public DataSource ds0() {
       return DataSourceBuilder.create().build();
    }
    @Bean
    public SqlSessionFactory ds1SqlSessionFactory(@Qualifier("ds1") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        // 领域模型包位置
        sessionFactory.setTypeAliasesPackage("com.example.demo.domain");
        // 设置映射文件的位置
        sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:sqlmaps/ds1/*.xml"));
        return sessionFactory.getObject();
    }
    @Bean
    public SqlSessionTemplate ds1SqlSessionTemplate(@Qualifier("ds1SqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
~~~

上面这样, 把`MyBatis`配置好之后, 特别是通过`MapperScan`指定`dao`扫描路径之后, 就可以像之前一样直接在spring中注入对应的`Dao`操作数据库了.


*****
