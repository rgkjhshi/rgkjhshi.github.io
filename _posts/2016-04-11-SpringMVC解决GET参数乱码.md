---
layout: blog
title:  SpringMVC解决GET参数乱码
date:   2016-04-11
category: 编程技术
tag: Spring
---
SpringMVC项目中通过GET方式传递的参数中有中文时, 有可能产生乱码.




*****

* TOC
{:toc}

*****

## 问题描述

在URL中通过GET方式传递参数, 有中文会乱码, 在`web.xml`文件中设置了编码过滤器, 但对于GET方式传过来的参数仍然没有作用

## 乱码的原因

HTTP请求到达Spring的Servlet程序之前, 先经过了Tomcat, 而对于GET方式的URL, Tomcat先做了一次URLDecode.  Tomcat对GET方式的URL默认是以iso-8859-1解码, 所以等请求到达我们的程序时, 就已经乱码了.

## 解决方案

解决办法就是让Tomcat对GET请求解码时, 按照UTF-8解码. 方法是修改Tomcat的配置文件`conf/server.xml`, 将其中的  
`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />`  
改为:  
`<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" URIEncoding="UTF-8" />`


*****
