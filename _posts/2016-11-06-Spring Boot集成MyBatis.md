---
layout: blog
title:  Spring Boot集成MyBatis
date:   2016-11-06
category: 编程技术
tag: Spring
---
本文先介绍`Spring Boot`的数据源的配置, 然后介绍如何集成`MyBatis`(有两种方式)



*****

* TOC
{:toc}

*****

## 配置数据源

Java的`javax.sql.DataSource`接口提供了标准的使用数据库连接的方法. 建立数据库连接只需要提供`URL`等相关参数, `Spring Boot`就可以创建数据源. 当然我们必须提供相应的包:`spring-boot-starter-data-jpa`, 这个包已经把`spring-boot-starter-jdbc`包含进来了.

`Spring`提供了内嵌数据库的支持(包括`H2, HSQL, Derby`), 当我们使用内嵌数据库的时候, 连`URL`等这些配置都不需要了, 直接导入相应的数据库依赖包就可以, 比如使用`HSQL`, 只需添加pom依赖:

~~~xml
<dependency>
    <groupId>org.hsqldb</groupId>
    <artifactId>hsqldb</artifactId>
    <scope>runtime</scope>
</dependency>
~~~
如果不用内嵌数据库, 而是用`Mysql`的话, 就需要`URL`等配置, 然后在把`Mysql`相关的包依赖添加进来:

~~~xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
~~~

### 连接池
线上使用数据库通常都会通过数据库连接池, `Spring Boot`会按照下面的策略选取一个:

* Tomcat 连接池性能较高, `tomcat-jdbc`可用时优先选择(`spring-boot-starter-jdbc`里已经包含了`tomcat-jdbc`包)
* 如果`HikariCP`可用则选择它
* 如果`Commons DBCP`可用则使用它, 但不推荐
* 最后, 如果`Commons DBCP2`可用, 则使用它

我们可以通过在应用配置的参数`spring.datasource.type`指定一个连接池, 比如使用阿里的德鲁伊(`Druid`):`spring.datasource.type=com.alibaba.druid.pool.DruidDataSource`, 这个需要添加依赖:

~~~xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
~~~

关于数据源的配置, 可在应用配置文件`application.properties`中进行配置

~~~sh
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
spring.datasource.driver-class-name=com.mysql.jdbc.Drive
~~~
对于不同连接池还有一些其他参数(`spring.datasource.tomcat.*`, `spring.datasource.hikari.*`), 比如:

~~~sh
# Number of ms to wait before throwing an exception if no connection is available.
spring.datasource.tomcat.max-wait=10000
# Maximum number of active connections that can be allocated from this pool at the same time.
spring.datasource.tomcat.max-active=50
# Validate the connection before borrowing it from the pool.
spring.datasource.tomcat.test-on-borrow=true
~~~

关于数据源, 我们仅需要配置一下参数, `Spring Boot`已经自动帮我们配置了, 使用的时候直接注入就可以.

*****

## 集成MyBatis

我们可以使用传统的`mybatis-spring`的方式, 引入`mybatis`和`mybatis-spring`包, 手动配置`MyBatis`, 这种方式跟原来使用`Spring`框架时比较类似, 比较灵活, 可自行配置`SqlSessionFactoryBean`. 这是我们将用的第一种方式.

`MyBatis`官方也提供了一个`starter`形式的包([GitHub地址](https://github.com/mybatis/spring-boot-starter)), 这个`starter`里已经包含了`mybatis`和`mybatis-spring`. 这是第二种方式, 这种方式更简单, 只需要在应用配置`application.yml`中添加配置即可.




不管哪种方式, 包依赖和数据源的配置少不了, 因此先把数据源配置(在`application.yml`中)贴出来:

~~~yml
# 数据库配置
spring:
    datasource:
        url: jdbc:mysql://10.90.187.120:3306/test?useUnicode=true&characterEncoding=UTF-8
        username: dbname
        password: dbpass
        driver-class-name: com.mysql.jdbc.Driver
~~~
包依赖(第一种方式只要包含`mybatis`和`mybatis-spring`即可):

~~~xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
~~~

### `mybatis-spring`方式
这种方式不再需要额外的配置, 主配置类该怎么写还是怎么写, 另外我们专门为`MyBatis`添加两个配置类:

~~~java
// com.example.project.config.MyBatisConfig.java 这个类是MyBatis的配置类
@Configuration  // 不要忘记加配置注解
@EnableTransactionManagement  // 事务管理
public class MyBatisConfig implements TransactionManagementConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(MyBatisConfig.class);

    @Resource
    DataSource dataSource;  // 这个数据源, Spring boot 会自动注入

    @Bean(name = "sqlSessionFactory")
    public SqlSessionFactory sqlSessionFactoryBean() {
        SqlSessionFactoryBean sqlSessionFactory = new SqlSessionFactoryBean();
        // 设置数据源
        sqlSessionFactory.setDataSource(dataSource);
        // 自动重命名
        sqlSessionFactory.setTypeAliasesPackage("com.example.project.entity");
        // 设置 typeHandler
        sqlSessionFactory.setTypeHandlersPackage("com.example.project.typeHandler");
        // 添加拦截器插件 (如果有的话, 分页插件, 分表插件等)
//        sqlSessionFactory.setPlugins(new Interceptor[]{pageHelper});
        // 设置 mapper 文件
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            sqlSessionFactory.setMapperLocations(resolver.getResources("classpath:sqlmaps/*.xml"));
            return sqlSessionFactory.getObject();
        } catch (Exception e) {
            logger.error("初始化SqlSessionFactory失败", e);
            throw new RuntimeException(e);
        }
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean
    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }
}

// com.example.project.config.MyBatisMapperScannerConfig.java 这个类用来设置自动扫描的路径
@Configuration
// MapperScannerConfigurer 执行的比较早, 所以要加下面这个注释, 不然其他 bean 还没初始化
@AutoConfigureAfter(MyBatisConfig.class)  // 确保在 MyBatisConfig 初始化之后初始化
public class MyBatisMapperScannerConfig {

    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer mapperScannerConfigurer = new MapperScannerConfigurer();
        // 设置自动扫描包, 该包下的Mapper(Dao)将会被mybatis自动注册, 不用写实现类
        mapperScannerConfigurer.setBasePackage("com.example.project.dao");
        mapperScannerConfigurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
        return mapperScannerConfigurer;
    }
}
~~~

这种方式, `MyBatis`就配置完了, 剩下的就是写实体和对应的Mapper(`Dao`)了.

~~~java
// com.example.project.entity.User.java
@Data
public class UserCreditRecord {
    private Long id;
    private String name;
    private String age;
}
// com.example.project.dao.UserDao.java
@Repository
public interface UserDao {

   @Select("select * from user where id = #{id}")
    User getById(@Param("id") Long id);
}
~~~

当实体跟数据库中字段名字一致的时候没啥问题, 但实体字段跟数据库字段不一致时(比如一个驼峰, 一个用下划线)就比较麻烦了, 这种情况我们可以不使用注解形式, 而使用`User.xml`文件, 在文件中可以`select user_name as userName`也可以通过`resultMap`来制定数据库字段名`column`与实体属性名`property`的映射关系;

还有一个第三方`Mapper`插件, 可以完美解决这个问题, 参考[这里](https://github.com/abel533/Mapper)

### `mybatis-spring-boot-starter`方式
这种方式就更简单了, 仅仅需要在应用配置文件`application.yml`添加一些配置:

~~~yml
# mybatis 配置
mybatis:
    typeAliasesPackage: com.example.project.entity
    typeHandlersPackage: com.example.project.handler  # 如果有 typeHandler
    mapperLocations: classpath:sqlmaps/*.xml          # mapper 文件
    configLocation: classpath:mybatis-config.xml      # 可以不设置
~~~

然后从 main类 上添加注解:`@MapperScan("com.example.project.dao")`, 扫描Mapper(`Dao`)的位置即可. 其他的`Spring Boot`都帮我们做了, 接下来就专注于写`Dao`和`entity`就可以了.

注意上面的mybatis的配置文件`classpath:mybatis-config.xml`, 如果没有这个文件就不要配置, 要是配置了就保证存在, 网上找了个例子:

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <settings>
        <!-- 这个配置使全局的映射器启用或禁用缓存。系统默认值是true -->
        <setting name="cacheEnabled" value="true"/>
        <!-- 全局启用或禁用延迟加载。当禁用时，所有关联对象都会即时加载。 系统默认值是true -->
        <setting name="lazyLoadingEnabled" value="true"/>
        <!-- 允许或不允许多种结果集从一个单独的语句中返回(需要适合的驱动)。 系统默认值是true -->
        <setting name="multipleResultSetsEnabled" value="true"/>
        <!--使用列标签代替列名。不同的驱动在这方便表现不同。参考驱动文档或充分测试两种方法来决定所使用的驱动。 系统默认值是true -->
        <setting name="useColumnLabel" value="true"/>
        <!--允许 JDBC 支持生成的键。需要适合的驱动。如果设置为 true 则这个设置强制生成的键被使用，尽管一些驱动拒绝兼容但仍然有效（比如Derby）。 系统默认值是false -->
        <setting name="useGeneratedKeys" value="false"/>
        <!--配置默认的执行器。SIMPLE 执行器没有什么特别之处。REUSE 执行器重用预处理语句。BATCH 执行器重用语句和批量更新 系统默认值是SIMPLE -->
        <setting name="defaultExecutorType" value="SIMPLE"/>
        <!--设置超时时间，它决定驱动等待一个数据库响应的时间。 系统默认值是null -->
        <setting name="defaultStatementTimeout" value="25000"/>
    </settings>
    <!-- 设置插件 -->
    <plugins>
        <plugin interceptor="com.github.pagehelper.PageHelper"> <!-- 这是一个第三方的分页插件 -->
            <property name="reasonable" value="true"/>
            <property name="offsetAsPageNum" value="true"/>
            <property name="rowBoundsWithCount" value="true"/>
            <property name="pageSizeZero" value="true"/>
        </plugin>
    </plugins>
</configuration>
~~~

*****
