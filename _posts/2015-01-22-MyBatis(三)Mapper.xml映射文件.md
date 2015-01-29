---
layout: blog
title:  "MyBatis(三): Mapper.xml映射文件"
date:   2015-01-22 
category: MyBatis  
comments: true
---

`Mapper.xml`文件的主要功能是映射SQL语句，对数据库进行增删改查操作，与JDBC代码相比，更加方便。




*****

## 本文结构

* [select 语句简介](#select)
* [insert update delete 简介](#insert)
* [Parameters 参数](#parameter)
* [ResultMap](#ResultMap)

*****

<h2 id="select"> select 语句简介 </h2>

查询语句是 MyBatis 中最常用的元素之一，先来个例子

```xml
<select id="selectPerson" parameterType="int" resultType="hashmap">
  SELECT * FROM PERSON WHERE ID = #{id}
</select>
```
其中的`XXXType`使用的都是**完全限定名**或者**[别名](/blog/mybatis/2015/01/20/MyBatis(二)配置文件.html#typeAliases)**，其中的符号`#{id}`会使用预处理语句，在 SQL 中会由一个“?”来标识，在`JDBC`中相当于这样：

```java
// Similar JDBC code, NOT MyBatis…
String selectPerson = "SELECT * FROM PERSON WHERE ID=?";
PreparedStatement ps = conn.prepareStatement(selectPerson);
ps.setInt(1,id);
```
`select` 元素还有很多属性

```java
id              | 在命名空间中唯一的标识符, 可以被用来引用这条语句
resultType      | 如果是集合情形, 那应该是集合可以包含的类型, 而不能是集合本身. 比如返回的结果是多个Persion, 这里应该写Persion而不是List
resultMap       | 外部resultMap的命名引用, 与resultType不能同时使用. 后面会具体讲
parameterType   | 默认值:unset. 可选, MyBatis可以通过TypeHandler推断出具体传入语句的参数
flushCache      | 默认值:false. true表示任何时候只要语句被调用, 都会导致本地缓存和二级缓存都会被清空
useCache        | 默认值:true. true表示本条语句的结果被二级缓存
timeout         | 默认:unset. 在抛出异常之前, 驱动程序等待数据库返回请求结果的秒数
resultSetType   | 默认:unset. 取值为FORWARD_ONLY,SCROLL_SENSITIVE或SCROLL_INSENSITIVE中的一个
fetchSize       | 默认:unset. 驱动程序每次批量返回的结果行数和这个设置值相等
statementType   | 默认值:PREPARED. STATEMENT,PREPARED或CALLABLE的一个. 这会让MyBatis分别使用Statement,PreparedStatement或CallableStatement
databaseId      | 如果配置了 databaseIdProvider, MyBatis 会加载所有的不带databaseId或匹配当前databaseId的语句;如果带或者不带的语句都有,则不带的会被忽略
resultOrdered   | 默认值:false. 这个设置仅针对嵌套结果select语句适用:如果为 true,就是假设包含了嵌套结果集或是分组了,这样的话当返回一个主结果行的时候,就不会发生有对前面结果集的引用的情况. 这就使得在获取嵌套的结果集的时候不至于导致内存不够用
resultSets      | 这个设置仅对多结果集的情况适用, 它将列出语句执行后返回的结果集并每个结果集给一个名称,名称是逗号分隔的
```

*****

<h2 id="insert"> insert, update 和 delete 简介</h2>
`insert, update, delete`同`select`类似，也有许多属性，其中  

*  `id, parameterType, timeout, statementType, databaseId`与select元素中的属性相同;   
*  `flushCache`的默认值为'true'
*  还有些是`insert和update`所特有的属性，如:

```java
useGeneratedKeys  | 默认值:false. 为true时会令MyBatis使用JDBC的getGeneratedKeys方法来取出由数据库内部生成的主键
keyProperty       | 默认:unset. 唯一标记一个属性,MyBatis会通过getGeneratedKeys的返回值或者通过insert语句的selectKey子元素设置它的键值. 如果希望得到多个生成的列,也可以是逗号分隔的属性名称列表
keyColumn         | 通过生成的键值设置表中的列名,当主键列不是表中的第一列的时候需要设置. 如果希望得到多个生成的列,也可以是逗号分隔的属性名称列表
```
例如下面这段代码，如果你的数据库支持自动生成主键的字段（比如 MySQL 和 SQL Server），那么你可以设置 useGeneratedKeys=”true”，然后再把 keyProperty 设置到目标属性上就OK了。

```xml
<insert id="insertAuthor" useGeneratedKeys="true" keyProperty="id">
  insert into Author (username,password,email,bio)
  values (#{username},#{password},#{email},#{bio})
</insert>
```

*****

<h2 id="parameter"> Parameters 参数 </h2>
参数是 MyBatis 非常强大的功能, `parameterType="anyType"`其中的`anyType`可以是`int`等基本类型，也可以是`User`等复杂类型。  

```xml
<insert id="insertUser" parameterType="User">
  insert into users (id, username, password)
  values (#{id}, #{username}, #{password})
</insert>
```
上例中，传入的事复杂类型`User`，将会在`User`中查找id、username 和 password 属性，并放入对应位置。如果是`int`或`String`等类型，不存在属性，则直接将其值放入对应的位置。

另外，参数映射也可以指定映射类型，甚至可以指定类型处理器，像之前讲一样，`javaType`通常可以根据参数对象去推测。

 ```xml
 #{age,javaType=int,jdbcType=NUMERIC,typeHandler=MyTypeHandler}
 ```
### 字符串替换
默认情况下,使用#{}格式的语法会创建预处理语句属性并安全地设置值（比如?）。不过有时只想直接在 SQL 语句中插入一个不改变的字符串，就可以这样使用参数：

```xml
ORDER BY ${columnName}
```
这里 MyBatis 不会修改或转义字符串

*****

<h2 id="ResultMap"> ResultMap </h2>
`resultMap` 元素是MyBatis中最重要最强大的元素，resultMap元素本身有一些属性，如下代码，`id`用于标识该`resultMap`，`type`用于指定该`resultMap`映射到哪个`JavaBean`

```xml
<resultMap id="blogResultMap" type="Blog">...</resultMap>
```
它还有很多子元素，下面是`resultMap`元素的概念图

**resultMap**

* constructor - 类在实例化时,用来注入结果到构造方法中
  * idArg - ID 参数;标记结果作为 ID 可以帮助提高整体效能
  * arg - 注入到构造方法的一个普通结果
* id – 一个 ID 结果;标记结果作为 ID 可以帮助提高整体效能
* result – 注入到字段或 JavaBean 属性的普通结果
* association – 一个复杂的类型关联;许多结果将包成这种类型
  * 嵌入结果映射 – 结果映射自身的关联,或者参考一个
* collection – 复杂类型的集
  * 嵌入结果映射 – 结果映射自身的集,或者参考一个
* discriminator – 使用结果值来决定使用哪个结果映射
  * case – 基于某某些值的结果映射
    * 嵌入结果映射 – 这种情形结果也映射它本身,因此可以包含很多相 同的元素,或者它可以参照一个外部的结果映射

**注意**由于DTD的限制，这些元素出现的顺序必须按照上面的顺序  

下面详细说明`resultMap`的每个子元素

### id和result
这是最基本的内容，这两者之间的唯一不同是`id`所指定属性将是能够唯一标识对象的属性，这能提高效率，特别是有联合映射时。  
`id`和`reslut`元素有`column, property, javaType, jdbcType, typeHandler`等属性，其中`column`用于指定数据库中的列名，`property`用于指定`JavaBean`对应的属性，其他属性则与之前讲的一样。

```xml
<id column="id" property="id"/>
<result column="user_name" property="username"/>
```

### 构造方法constructor
如果`resultMap`所映射的`JavaBean`的构造方法需要提供参数，则`constructor`就不能缺少了  
`constructor`有`idArg`和`arg`两个子元素，意义差不多(参见`id`和`result`的区别)，都是给构造方法提供参数。他们的属性也同`id`和`result`一样  
`constructor`常用的形式如下：

```xml
<constructor>
  <idArg column="id" javaType="int"/>
  <arg column="username" javaType="String"/>
</constructor>
```
**注意** Java 没有自查(反射)参数名的方法，所以要保证这里的参数顺序同`JavaBean`定义的顺序一致，而且数据类型也是确定的。

### 关联association
关联元素处理“有一个”类型的关系。比如,一个博客有一个作者，就像下面这样

```java
//来自 Author.java
public class Author {

    private Integer id;
    private String name;
    private Integer age;
    ...
}
//来自 Blog.java
public class Blog {

    private Integer id;
    private String title;
    private String content;
    private Author author; //数据库中对应的字段是 author_id int类型
    ...
}
```
可以这样做级联查询

```xml
<resultMap id="BlogResultMap" type="Blog">
    <id column="id" property="id"/>
    <result column="title" property="title"/>
    <result column="content" property="content"/>
    <!-- 只要提供了返回类型，像上面的id和result指定的字段，即使不指定MyBatis也能自动封装 -->
    <association column="author_id" property="author" javaType="Author"
                 select="com.test.mybatis.mapper.AuthorMapper.selectAuthorById"/>
                 <!-- 这里如果起了别名也可使用 -->
</resultMap>

<select id="selectBlogById" parameterType="int" resultMap="BlogResultMap">
    SELECT * FROM blog WHERE id = #{id}
</select>

<!-- 来自 AuthorMapper.xml -->
<select id="selectAuthorById" parameterType="int" resultType="Author">
    SELECT * FROM author WHERE id = #{id}
</select>
```
`association`是通过把column指定的字段作为参数，传给select子查询的。

### 集合collection
如果博客有了许多评论，则会出现“一对多”的情形，比如上面的`Blog`会多出一个属性

```java
    //Blog.java新增的属性
    private List<Comment> comments;

//Comment.java
public class Comment {

    private Integer id;
    private String content;
    private Blog blog;
    ...
}
```
那么对于`Blog`的查询将变成这样

```xml
<resultMap id="BlogResultMap" type="Blog">
    <id column="id" property="id"/>
    <result column="title" property="title"/>
    <result column="content" property="content"/>
    <!-- 只要提供了返回类型，像上面的id和result指定的字段，即使不指定MyBatis也能自动封装 -->
    <association column="author_id" property="author" javaType="Author"
                 select="com.test.mybatis.mapper.AuthorMapper.selectAuthorById"/>
                 <!-- 这里如果起了别名也可使用 -->
    <collection property="comments" javaType="ArrayList" column="id" ofType="Comment" 
                select="com.test.mybatis.mapper.CommentMapper.selectCommentForBlog"/>
</resultMap>

<select id="selectBlogById" parameterType="int" resultMap="BlogResultMap">
    SELECT * FROM blog WHERE id = #{id}
</select>

<!-- 来自 AuthorMapper.xml -->
<select id="selectAuthorById" parameterType="int" resultType="Author">
    SELECT * FROM author WHERE id = #{id}
</select>

<!-- 来自 CommentMapper.xml -->
<select id="selectCommentForBlog" parameterType="int" resultType="Comment">
    SELECT * FROM comment WHERE blog_id = #{id}
</select>
```
其中的`ofType`用于表示集合中所存放的类型，上面可以理解为产生了一个`ArrayList<Comment> comments`，`javaType`属性可以省略；`column`指定了id作为传入参数


*****