---
layout: blog
title:  HBase Shell命令总结
date:   2016-04-12
category: 点滴积累
tag: HBase
---
SpringMVC项目中通过GET方式传递的参数中有中文时, 有可能产生乱码.




*****

* TOC
{:toc}

*****

## namespace

表名`ns:table1`中冒号前面的就是`namespace`, 它可以在逻辑上隔离数据, 也可以对不同的`namespace`进行不同授权  
HBase系统默认定义了两个缺省的namespace

* `hbase`: 系统内建表，包括namespace和meta表
* `default`: 用户建表时未指定namespace的表都创建在此

### 常用命令

下面是对于`namespace`的一些操作

* 创建: `create_namespace 'ns'`
* 删除: `drop_namespace 'ns'`
* 查看所有: `list_namespace`
* 查看某个: `describe_namespace 'ns'`
* 查看namespace下的表: `list_namespace_tables 'ns'`
* 在namespace下创建表: `create 'ns:testtable', 'fm1'`

### API

~~~java
Configuration conf = HBaseConfiguration.create();
HBaseAdmin admin = new HBaseAdmin(conf);
//create namespace named "my_ns"
admin.createNamespace(NamespaceDescriptor.create("my_ns").build());

//create tableDesc, with namespace name "my_ns" and table name "mytable"
//HTableDescriptor tableDesc = new HTableDescriptor(TableName.valueOf("my_ns:mytable"));
//tableDesc.setDurability(Durability.SYNC_WAL);

//add a column family "mycf"
//HColumnDescriptor hcd = new HColumnDescriptor("mycf");
//tableDesc.addFamily(hcd);
//admin.createTable(tableDesc);
admin.close();
~~~

*****
