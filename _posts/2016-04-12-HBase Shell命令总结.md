---
layout: blog
title:  HBase Shell命令总结
date:   2016-04-12
category: 点滴积累
tag: HBase
---
HBase Shell命令总结, 便于查阅




*****

* TOC
{:toc}

*****

## namespace

表名`ns:table1`中冒号前面的就是`namespace`, 它可以在逻辑上隔离数据, 也可以对不同的`namespace`进行不同授权  
HBase系统默认定义了两个缺省的namespace

* `hbase`: 系统命名空间, 用于包含hbase的内部表, 包括namespace和meta表
* `default`: 用户建表时未指定namespace的表都创建在此

### 常用命令

下面是对于`namespace`的一些操作

* 创建: `create_namespace 'ns'`
* 删除: `drop_namespace 'ns'`
* 查看所有: `list_namespace`
* 查看某个: `describe_namespace 'ns'`
* 查看namespace下的表: `list_namespace_tables 'ns'`
* 在namespace下创建表: `create 'ns:testtable', 'fm1'`
* 修改属性: `alter_namespace 'ns', {METHOD => 'set', 'PROPERTY_NAME' => 'PROPERTY_VALUE'}`

### 基于namespace的授权操作

具备Create权限的namespace Admin可以对表创建和删除、生成和恢复快照  
具备Admin权限的namespace Admin可以对表splits或major compactions  
RWXCA

* 授权`userA`用户对`test_ns`的写权限: `grant 'userA' 'W' '@test_ns'`
* 回收`userA`用户对`test_ns`的所有权限: `revoke 'userA''@test_ns'`

通过`hbase-site.xml`在HBase中启用授权机制:

~~~xml
<property>
     <name>hbase.security.authorization</name>
     <value>true</value>
</property>
<property>
     <name>hbase.coprocessor.master.classes</name>
     <value>org.apache.hadoop.hbase.security.access.AccessController</value>
</property>
<property>
     <name>hbase.coprocessor.region.classes</name>
     <value>org.apache.hadoop.hbase.security.token.TokenProvider,org.apache.hadoop.hbase.security.access.AccessController</value>
</property>
~~~

## shell 命令总结表

在hbase shell中直接敲命令会给出说明，并有很多例子, 一看就知道怎么用了

| shell 命令           | 描述            |
|:---------------------|:---------------|
| list                 |  查看所有表      |
| describe             |  描述表         |
| count                |  统计表中行数    |
| create               |  创建表         |
| alter                |  修改列族模式    |
| drop                 |  删除表         |
| exists               |  测试表是否存在  |
| disable              |  使表无效       |
| enable               |  使表有效       |
| put                  |  插入数据       |
| incr                 |  增加表、行或列的值  |
| get                  |  查看数据       |
| scan                 |  查看批量数据    |
| delete               |  删除表行列对应的值   |
| deleteall            |  删除指定行的所有元素  |
| shutdown             |  关闭HBase集群(不同于exit) |
| truncate             |  重新创建指定表      |
| tools                |  列出HBase支持的工具 |
| status               |  返回HBase集群状态   |
| version              |  查看hbase版本      |
| exit                 |  推出HBase shell   |

*****
