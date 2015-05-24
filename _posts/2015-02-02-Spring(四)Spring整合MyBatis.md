---
layout: blog
title:  "Spring(四): Spring整合MyBatis"
date:   2015-02-02
category: Spring  
---


*****

## 本文结构

* [整合的方法](#id1)
* [SqlSessionFactoryBean的注入](#SqlSessionFactoryBean)
* [MapperFactoryBean](#MapperFactoryBean)
* [使用MapperScannerConfigurer自动注册Mapper](#MapperScannerConfigurer)
* [事务管理](#transactionManager)


*****

<h2 id="id1"> 整合的方法 </h2>

MyBatis 是以`SqlSessionFactory`为核心的，Spring是以`BeanFactory`或`ApplicationContext`为核心的。把两者整合在一起，`Mybatis-Spring`封装了一个`SqlSessionFactoryBean`，在这个`Bean`里可以产生`SqlSessionFactory`。所以通过Spring的IoC实现`SqlSessionFactoryBean`的注入即可将二者整合。

使用`Mybatis-Spring`模块需要`mybatis-spring-x.x.x.jar`包，如果使用`Maven`，则需在`pom.xml`文件中添加下面代码：

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis-spring</artifactId>
  <version>x.x.x</version>
</dependency>
```

*****

<h2 id="SqlSessionFactoryBean"> SqlSessionFactoryBean的注入 </h2>

在`MyBatis`中,`session`工厂可以使用`SqlSessionFactoryBuilder`来创建。而在`MyBatis-Spring`中,则使用`SqlSessionFactoryBean`来替代。
要想实现对`SqlSessionFactoryBean`的注入，需要在spring的配置文件中添加这样的一个bean元素：

```xml
    <!-- 读取properties文件 -->
    <context:property-placeholder location="classpath:jdbc.properties"/>
    <!-- 配置数据源 -->
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
       <property name="driverClassName" value="${jdbc.driver}" />
       <property name="url" value="${jdbc.url}" />
       <property name="username" value="${jdbc.username}" />
       <property name="password" value="${jdbc.password}" />
    </bean>
    <!-- SqlSessionFactoryBean -->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- dataSource用于指定mybatis的数据源 -->
        <property name="dataSource" ref="dataSource"/>
        <!-- mapperLocations用于指定mybatis中mapper文件所在的位置 -->
        <property name="mapperLocations" value="classpath:mapper/*.xml"/>
        <!-- 自动重命名 -->
        <property name="typeAliasesPackage" value="com.test.mybatis_spring.model" />
        <!-- 用于指定mybatis配置文件的位置 -->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
    </bean>
```
构建`SqlSessionFactoryBean`的时候，`dataSource`属性是必须指定的，它表示用于连接数据库的数据源。我们也可以指定一些其他的属性，如：

* `typeAliasesPackage`：实体类所在的包，自动取包中不包括包名的简单类名作为别名。多个package之间可以用逗号或者分号等来进行分隔。
* `typeAliases`：数组类型，用来指定别名的。指定了这个属性后，Mybatis会把这个类型的短名称作为这个类型的别名，前提是该类上没有`@Alias`注解，否则将使用该注解对应的值作为此种类型的别名。如：

 ```xml
 <property name="typeAliases">  
    <array>  
        <value>com.test.mybatis.model.Blog</value>  
        <value>com.test.mybatis.model.Comment</value>  
    </array>  
</property>
 ```
* `plugins`：数组类型，用来指定Mybatis的`Interceptor`。
* `typeHandlersPackage`：用来指定`TypeHandler`所在的包，自动把该包下面的类注册为对应的`TypeHandler`。多个package之间可以用逗号或者分号等来进行分隔。
* `typeHandlers`：数组类型，用来指定`TypeHandler`。

*****

<h2 id="MapperFactoryBean"> MapperFactoryBean </h2>

通过`SqlSessionFactoryBean`可以产生`SqlSessionFactory`，在MyBatis中，通过`sqlSessionFactory.openSession()`得到`sqlSession`，然后通过`session.getMapper(xxx.class)`得到对应的`Mapper`。在Spring中，通过`MapperFactoryBean`可以获取到我们想要的`Mapper`对象。

`MapperFactoryBean`实现了Spring的`FactoryBean`接口，所以`MapperFactoryBean`是通过`FactoryBean`接口中定义的`getObject`方法来获取对应的`Mapper`对象的。在定义一个`MapperFactoryBean`的时候有两个属性需要我们注入，一个是Mybatis-Spring用来生成实现了`SqlSession`接口的`SqlSessionTemplate`对象的`sqlSessionFactory`；另一个是我们所要返回的对应的`Mapper`接口。

比如，有一个`UserMapper`接口:

```java
//UserMapper.java
public interface UserMapper {
  @Select("SELECT * FROM users WHERE id = #{userId}")
  User getUser(@Param("userId") String userId);
}
```
使用`MapperFactoryBean`把接口加入到 Spring 中:

```xml
<bean id="userMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
  <!-- 指定的映射器类必须是一个接口,而不是具体的实现类 -->
  <property name="mapperInterface" value="com.test.mybatis_spring.mapper.UserMapper" />
  <property name="sqlSessionFactory" ref="sqlSessionFactory" />
</bean>
```

定义好`Mapper`接口对应的`MapperFactoryBean`之后，就可以把对应的`Mapper`接口注入到由Spring管理的bean对象中了。当我们需要使用到相应的`Mapper`接口时，`MapperFactoryBean`会从它的`getObject`方法中获取对应的`Mapper`接口，而`getObject`内部还是通过我们注入的属性调用`SqlSession`接口的`getMapper()`方法来返回对应的`Mapper`接口。这样就通过把`SqlSessionFactory`和相应的`Mapper`接口交给Spring管理实现了Mybatis跟Spring的整合。

*****

<h2 id="MapperScannerConfigurer"> 使用MapperScannerConfigurer自动注册Mapper </h2>

像上面一个`Mapper`就需要定义一个对应的`MapperFactoryBean`。`Mybatis-Spring`提供了一个叫`MapperScannerConfigurer`的类，可以自动注册`Mapper`对应的`MapperFactoryBean`对象。我们只需要在配置文件中添加这样的内容：

```xml
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
  <property name="basePackage" value="com.test.mybatis_spring.mapper" />
</bean>
```
`MapperScannerConfigurer`有一个`basePackage`属性必须指定。`basePackage`用来指定`Mapper`接口文件所在的包，在这个包或其子包下面的`Mapper`接口都将被搜索到。多个包之间可以使用逗号或者分号进行分隔。另外还有两个可以缩小搜索和注册范围的属性，一个是`annotationClass`，另一个是`markerInterface`。

* `annotationClass`：当指定了`annotationClass`时，`MapperScannerConfigurer`将只注册使用了`annotationClass`注解标记的接口。
* `markerInterface`：`markerInterface`用于指定一个接口，当指定了`markerInterface`之后，`MapperScannerConfigurer`将只注册继承自`markerInterface`的接口。

如果上述两个属性都指定了的话，那么`MapperScannerConfigurer`将取它们的并集，而不是交集。

*****

<h2 id="transactionManager"> 事务管理 </h2>

`MyBatis-Spring`利用了存在于`Spring`中的`DataSourceTransactionManager`进行事务管理。一旦`Spring`的`PlatformTransactionManager`配置好了,就可以在`Spring`中以你通常的做法`(@Transactional注解)`来配置事务。在事务处理期间,会创建一个单独的`SqlSession`对象，当事务完成时,这个`session`会以合适的方式提交或回滚。

要开启`Spring`的事务处理,需要在`Spring`的配置文件中创建一个`DataSourceTransactionManager`对象:

```xml
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
  <property name="dataSource" ref="dataSource" />
</bean>
```
下面这段代码展示如何编程式地控制事务：

```java
DefaultTransactionDefinition def = new DefaultTransactionDefinition();
def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

TransactionStatus status = txManager.getTransaction(def);
try {
    userMapper.insertUser(user);
}
catch (MyException ex) {
    txManager.rollback(status);
    throw ex;
}
txManager.commit(status);
```
*****
