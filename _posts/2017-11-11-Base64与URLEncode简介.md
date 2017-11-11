---
layout: blog
title:  Base64与URLEncode简介
date:   2017-11-11
category: 编程技术
tag:
---


*****

* TOC
{:toc}

*****

## Base64简介
`Base64`是最常见的一种基于64个可打印字符来表示二进制数据的方法.

### Base64原理

* 首先, `Base64`基于64个可打印字符, 这64个字符有`A~Z`, `a~z`, `0~9`, `+`, `/`

> `['A', 'B', 'C', ... 'a', 'b', 'c', ... '0', '1', ... '+', '/']`

* 然后, 对二进制数据进行处理, 每3个字节一组, 一共是`3x8=24bit`, 划为4组, 每组正好6个bit:

![Base64]({{ "/static/images/base64.png"  | prepend: site.baseurl }} "Base64")

这样我们得到4个数字作为索引, 然后查表, 获得相应的4个字符, 就是编码后的字符串。  
`Base64`编码会把3字节的二进制数据编码为4字节的文本数据, 长度增加33%, 好处是编码后的文本数据可以在邮件正文、网页等直接显示。

* 另外, 如果要编码的二进制数据不是3的倍数, 最后会剩下1个或2个字节, `Base64`会先用`\x00`字节在末尾补足后, 再在编码的末尾加上1个或2个`=`, 表示补了多少字节, 解码的时候, 会自动去掉。

由于`=`在`URL、Cookie`里面会造成歧义, 所以, 很多`Base64`编码后会把`=`去掉。因为`Base64`是把3个字节变为4个字节, 所以, `Base64`编码的长度永远是4的倍数, 因此, 加上`=`把Base64字符串的长度变为4的倍数，就可以正常解码了。

### URL safe的Base64编码

由于标准的`Base64`编码后可能出现字符`+`和`/`, 在URL中就不能直接作为参数, 所以又有一种`url safe`的`base64`编码, 其实就是把字符`+`和`/`分别变成`-`和`_`

~~~java
        // 下面这段代码来自于JDK1.8中的 java.util.Base64
        /**
         * This array is a lookup table that translates 6-bit positive integer
         * index values into their "Base64 Alphabet" equivalents as specified
         * in "Table 1: The Base64 Alphabet" of RFC 2045 (and RFC 4648).
         */
        private static final char[] toBase64 = {
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
        };

        /**
         * It's the lookup table for "URL and Filename safe Base64" as specified
         * in Table 2 of the RFC 4648, with the '+' and '/' changed to '-' and
         * '_'. This table is used when BASE64_URL is specified.
         */
        private static final char[] toBase64URL = {
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'
        };
~~~

### Base64工具类

* 在`Guava`中有`BaseEncoding`类
* 在`JDK8`中有专门的工具类`java.util.Base64`
* 在`JDK7中`也有`sun.misc.BASE64Encoder`和`sun.misc.BASE64Decoder`两个类
* 在`Spring`中, 也提供了一个`Base64Utils`, 它自动根据反射来决定是使用`Java 8`的 `java.util.Base64`还是`Apache Commons Codec`的`org.apache.commons.codec.binary.Base64`
* 除了`JDK7`, 其他的工具类中都有`url safe`的`Base64`编码方法

~~~java
    // guava 工具类的使用
    public void testBase64() {
        // 原串
        String origin = "abc";
        // encode
        String encodeString = BaseEncoding.base64().encode(origin.getBytes());
        // decode
        String result = new String(BaseEncoding.base64().decode(encodeString));
        // result = origin
        Assert.assertEquals(origin, result);
    }
    // Spring 工具类的使用
    public void testBase64() {
        // 原串
        String origin = "abc";
        // encode
        String encodeString = Base64Utils.encodeToString(origin.getBytes());
        // decode
        String result = new String(Base64Utils.decodeFromString(encodeString));
        // result = origin
        Assert.assertEquals(origin, result);
    }
    // JDK8 工具类的使用
    public void testBase64() {
        // 原串
        String origin = "abc";
        // encode
        String encodeString = Base64.getEncoder().encodeToString(origin.getBytes());
        // decode
        String result = new String(Base64.getDecoder().decode(encodeString.getBytes()));
        // result = origin
        Assert.assertEquals(origin, result);
    }
    // JDK7 工具类的使用(解码时会抛出 IOException)
    public void testBase64() {
        // 原串
        String origin = "abc";
        // encode
        String encodeString = new BASE64Encoder().encodeBuffer(origin.getBytes());
        // decode
        String result = null;
        try {
            result = new String(new BASE64Decoder().decodeBuffer(encodeString));
        } catch (IOException e) {
            logger.error("Base64解码失败", e);
        }
        // result = origin
        Assert.assertEquals(origin, result);
    }
~~~

*****

## URLEncode简介

*****

*****

## 相关链接

* [关于MD5和SHA-1的简单的介绍](http://blog.csdn.net/woxinfeixiangliudan/article/details/50371932)
* [SHA1算法原理](https://www.cnblogs.com/scu-cjx/p/6878853.html)

*****
