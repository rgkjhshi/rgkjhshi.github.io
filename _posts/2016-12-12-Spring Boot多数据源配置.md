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
    @Bean("datasource")
    @Primary  // 这个注解表示主数据源
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource datasource() {
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

## 自动注册多数据源
如果数据源比较多, 我们可以把多个数据源通过其它方式注入到Spring容器中, 使用时可以直接通过名字注入使用.  
假设有如下配置:

~~~sh
# 默认数据源
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/db0
spring.datasource.username=root
spring.datasource.password=123123
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
# 数据源db1配置
custom.datasource.names=ds1, ds2    # 这个属性表示数据源名字列表
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

上面的数据源, 我们可以直接拿来使用:

~~~java
// 这个是注入默认的数据源
@Resource
private DataSource dataSource
// 注入ds1数据源
@Resource("ds1")
private DataSource ds1
// 在方法里注入ds2数据源
@Bean
public SqlSessionFactory sqlSessionFactory(@Qualifier("ds2") DataSource dataSource) {
    ....
}
~~~

要实现多数据源的自动注册, 我们需要借助`BeanDefinitionRegistryPostProcessor`和`EnvironmentAware`两个接口. 下面是自动注册多数据源的方法:

~~~java

@Component
public class MultiDataSourceRegister implements BeanDefinitionRegistryPostProcessor, EnvironmentAware {
    private static final Logger logger = LoggerFactory.getLogger(MultiDataSourceRegister.class);
    // 存放DataSource配置的集合, <dsName, dbProperties>
    private Map<String, PropertyValues> dataSourceMap = Maps.newHashMap();

    /**
     * 这个方法主要用于加载多数据源配置, 添加到dataSourceMap中, 之后在postProcessBeanDefinitionRegistry进行注册。
     */
    @Override
    public void setEnvironment(Environment environment) {
        // 获取到前缀是 "custom.datasource." 的属性列表值
        RelaxedPropertyResolver propertyResolver = new RelaxedPropertyResolver(environment, "custom.datasource.");
        // 获取到所有数据源的名称列表
        String dsNames = propertyResolver.getProperty("names"); // 拿到 custom.datasource.names 定义的数据源列表
        for (String dsName : Splitter.on(",").omitEmptyStrings().splitToList(dsNames)) {
            // 把数据源的配置(url, username, password, driver-class-name, type等)咱存到 dsMap 中
            Map<String, Object> dsMap = propertyResolver.getSubProperties(dsName + ".");
            if (CollectionUtils.isEmpty(dsMap)) {
                logger.warn("未找到数据源{}的属性配置", dsName);
            } else {
                PropertyValues propertyValues = new MutablePropertyValues(dsMap);
                dataSourceMap.put(dsName, propertyValues);  // 数据源 dsName 的所有配置
            }
        }
    }

    /**
     * 自动注册 dataSourceMap 中的所有数据源
     */
    @Override
    @SuppressWarnings("unchecked")
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        for (String dsName : dataSourceMap.keySet()) {
            PropertyValues pv = dataSourceMap.get(dsName);
            DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();  // 这里并没有创建数据源, 只是依靠Spring拿到数据源类型
            if (pv.contains("type")) {
                String type = pv.getPropertyValue("type").getValue().toString();  // 如果指定了type, 则使用指定的数据源类型
                try {
                    dataSourceBuilder.type((Class<? extends DataSource>) Class.forName(type));
                } catch (ClassNotFoundException e) {
                    logger.error("加载数据源{}失败, 使用默认数据源");
                }
            }
            // 注册
            AnnotatedGenericBeanDefinition definition = new AnnotatedGenericBeanDefinition(dataSourceBuilder.findType());
            registry.registerBeanDefinition(dsName, definition);
        }
    }

    /**
     * 把自定义数据源的属性绑定到对应的bean上
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        // 把默认数据源设置为主数据源;
        beanFactory.getBeanDefinition("dataSource").setPrimary(true);
        // 设置自定义数据源的属性绑定
        for (String dsName : dataSourceMap.keySet()) {
            DataSource customDS = beanFactory.getBean(dsName, DataSource.class);
            RelaxedDataBinder dataBinder = new RelaxedDataBinder(customDS);
            dataBinder.bind(dataSourceMap.get(dsName));
        }
    }
}
~~~


*****
