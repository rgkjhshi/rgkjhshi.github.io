---
layout: blog
title:  "MyBatis(四): 动态SQL"
date:   2015-01-24
category: 编程技术  
tag: MyBatis
---

MyBatis的动态SQL是基于ONGL表达式的




*****

* any list
{:toc}

*****

## if

if一般是where的一部分，如

~~~xml
<select id="findBlog" resultType="Blog">
  SELECT * FROM BLOG WHERE 1 = 1
  <if test="title != null">
    AND title LIKE CONCAT(CONCAT('%', #{title}), '%')
    <!-- mysql也可以这样写：AND title LIKE "%"#{title}"%" -->
  </if>
  <if test="author != null and author.name != null">
    AND author_name like #{author.name}
  </if>
</select>
~~~

*****

## where
像上面的例子，为了拼接sql，专门写了个 WHERE 1 = 1，`where`标签就能避免这样的问题，它会自动去除不该有的`AND`或`OR`

~~~xml
<select id="findBlog" resultType="Blog">
  SELECT * FROM blog
  <where>
    <if test="state != null">
         state = #{state}
    </if>
    <if test="title != null">
        AND title like #{title}
    </if>
    <if test="author != null and author.name != null">
        AND author_name like #{author.name}
    </if>
  </where>
</select>
~~~

*****

## set
set元素主要是用在更新操作的时候，它会智能去掉最后的逗号。如果set中一个条件都不满足，则会报错。

~~~xml
<update id="updateBlog" parameterType="Blog">  
    UPDATE blog  
    <set>  
        <if test="title != null">  
            title = #{title},  
        </if>  
        <if test="content != null">  
            content = #{content},  
        </if>  
        <if test="owner != null">  
            owner = #{owner}  
        </if>  
    </set>  
    where id = #{id}  
</update>  
~~~

*****

## foreach
foreach主要用在in语句中，它可以在SQL语句中遍历一个集合。

~~~xml
<select id="foreachTest" parameterType="java.util.List" resultType="Blog">  
    SELECT * FROM blog WHERE id in  
    <foreach collection="list" index="index" item="item" open="(" separator="," close=")">  
        #{item}  
    </foreach>  
</select>
~~~

* `item`声明可以用在元素体内的集合项，相当于集合每一个元素进行迭代时的别名  
* `index`声明可以用在元素体内的索引变量，即元素的位置。
  * 比如上例中，如果list里面的元素为"[3,6,9]"，则'item'的值会分别为"3,6,9"，而`index`则分别为"0,1,2"
* `open separator close`用于指定开闭匹配的字符串以及在迭代之间放置分隔符，如 "(1,2,3,4)"
* `collection`属性比较容易出错
  * 当传入参数(parameterType)是单个参数且参数类型是一个List的时候，collection属性值为list，就像上面，传入参数`parameterType="java.util.List"`
  * 当传入参数(parameterType)是单个参数且参数类型是一个array数组的时候，collection的属性值为array，比如`parameterType="[Ljava.lang.Integer;"`
  * 传入的参数是多个的时候，肯定要先封装成一个Map，这个时候collection属性值就是传入的map中List或array数组类型的变量的key值，比如`parameterType="java.util.Map"`，传入的map中有一个key为"idList"的List对象，则这个时候collection的属性值就应该是idList。

*****

## choose (when, otherwise)
choose元素的作用就相当于JAVA中的switch语句

~~~xml
<select id="chooseTest" parameterType="Blog" resultType="Blog">  
    SELECT * FROM blog WHERE 1 = 1   
    <choose>  
        <when test="title != null">  
            and title = #{title}  
        </when>  
        <when test="content != null">  
            and content = #{content}  
        </when>  
        <otherwise>  
            and author = "Michael"  
        </otherwise>  
    </choose>  
</select>
~~~

*****
