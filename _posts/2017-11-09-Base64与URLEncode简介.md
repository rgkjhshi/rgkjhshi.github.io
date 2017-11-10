---
layout: blog
title:  Base64与URLEncode简介
date:   2017-11-09
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

由于`=`在`URL、Cookie`里面会造成歧义, 所以, 很多`Base64`编码后会把`=`去掉。因为`Base64`是把3个字节变为4个字节, 所以, `Base64`编码的长度永远是4的倍数, 因此, 加上=把Base64字符串的长度变为4的倍数，就可以正常解码了。

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
在java中有很多MD5实现, 其中`Guava`和`JDK`都有, 下面是一些例子

* 利用`Guava`中的工具

~~~java
public class MD5Util {

    /**
     * 对source按UTF_8编码进行md5签名
     *
     * @param source 待签名的原串
     * @return md5签名值（(32位小写16进制字符串）
     */
    public static String encode(String source) {
        return Hashing.md5().newHasher().putString(source, Charsets.UTF_8).hash().toString();
    }
}
~~~

* 使用`JDK`的工具

下面这个工具完全是通过`JDK`实现的, 没有使用第三方工具包

~~~java
public class MD5Util
}
~~~

*****

*****

## MD5与SHA-1的比较
`MD5`与`SHA-1`都属于哈希散列算法, 都是从`MD4`发展而来，它们的结构和强度等特性有很多相似之处, 他们的区别主要有下面这些:

* 安全性: `MD5`摘要长度128位(16字节), `SHA-1`摘要长度160位(20字节)
* 速度: `SHA1`的运算步骤(80步)比`MD5`(64步)多了16步, 而且SHA1记录单元的长度比MD5多了32位, `SHA1`速度大约比`MD5`慢了`25％`
* 简易性: 两种方法都是相当的简单，在实现上不需要很复杂的程序或是大量存储空间。总体上来讲, `SHA1`对每一步骤的操作描述比`MD5`简单

*****

## 相关链接

* [关于MD5和SHA-1的简单的介绍](http://blog.csdn.net/woxinfeixiangliudan/article/details/50371932)
* [SHA1算法原理](https://www.cnblogs.com/scu-cjx/p/6878853.html)

*****
