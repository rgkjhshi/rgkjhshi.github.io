---
layout : blog
title  :  Intellij Idea快捷键forMac
date   :   2015-02-15
category : 快捷速查  
tag    : 快捷键
---


Intellij Idea 的常用快捷键




*****

## 本文结构

* [视图切换](#view)
* [搜索内容](#search)
* [编辑代码](#edit)
* [重构的快捷键](#reb)
* [查看代码](#navigate)
* [运行与Debug](#run)
* [其他快捷键](#other)


*****

<h2 id="view"> 视图切换 </h2>

| cmd + 数字        | 切换到数字对应的视图  |
| alt + maven      | 切换到maven的视图    |
| cmd + e          | 列出最近查看的文件列表 |
| shift + cmd + e  | 最近修改文件列表      |


*****

<h2 id="search"> 搜索内容 </h2>

| cmd + f              | 开始搜索  |
| cmd + r              | 搜索替换  |
| ctrl + shift + f     | (在project中使用)在当前目录下递归查找  |
| ctrl + shift + r     | (在project中使用)在当前目录下递归替换  |
| alt + a              | (在project中使用)上面的搜索出来后替换全部  |
| alt + F7             | 搜索对象被引用的地方  |
| cmd + F7             | 搜索对象在当前文件被引用的地方  |
| cmd + n              | 查找类    |
| shift + cmd + n      | 查找文件  |

*****

<h2 id="edit"> 编辑代码 </h2>

| cmd + j                |    调出live template |
| ctrl + n               |    各种自动生成代码,创建文件,生成setter getter override |
| alt + enter            |    调出IDEA对出错点的提示处理方法,熟练使用可使你写代码的速度提升5倍 |
| cmd + D                |    复制粘贴当前行到下一行 |
| cmd + c/v/x            |    复制/粘贴/剪切 |
| shift + cmd + v        |    调出IDEA寄存器中保存的最近复制的N份内容,可选择性粘贴 |
| cmd + /                |    注释或取消注释 |
| cmd + w                |    选中当前光标所在的字 |
| shift + cmd + enter    |    补全当前行,最常用的场景时补全当前行后的;号并将光标定位到下一行 |
| alt + cmd + L          |    格式化代码         |
| shift + cmd + O        |    static import    |
| shift + cmd + up/down  |    将当前代码段上/下移 |
| shift + alt + up/down  |    将当前行上/下移     |
| cmd + O                |    overide 方法      |
| cmd + I                |    implement 方法    |

其实上面两个快捷键很少用,因为有 alt + enter 可完全替换掉这两个快捷键的功能

<h2 id="reb"> 重构的快捷键 </h2>

| F6                     |    移动文件到其它地方
| F5                     |    拷贝文件到其它地方
| shift + F6             |    改名
| cmd + F6               |    修改方法签名
| shift + cmd + F6       |    修改参数的类型
| shift + cmd + v        |    引入一个局部变量
| shift + cmd + p        |    引入一个参数
| shift + cmd + f        |    引入一个类变量
| shift + cmd + m        |    引入一个方法
| shift + cmd + c        |    引入一个常量

*****

<h2 id="navigate"> 查看代码 </h2>

| cmd + p                |    查询某方法的参数信息 |
| cmd + b                |    跳到调用方法的定义处  |
| alt + cmd + b          |    跳到方法的实现处 |
| cmd + u                |    跳到方法在父类或接口的定义处 |
| ctrl + up/down         |    跳到上/下一方法 |
| alt + cmd + left/right |    跳到上/下一次光标查看处 |
| cmd + g                |    跳到指定行 |
| cmd + shift + h        |    显示方法的层级结构 |
| alt + cmd + h          |    调用层级结构 |

*****

<h2 id="run"> 运行与Debug </h2>

| shift + alt + F9       |    debug模式运行程序 |
| shift + alt + F10      |    运行程序 |
| F7                     |    单步进入 |
| F8                     |    单步跳过 |
| F9                     |    跳过本次debug |
| alt + F8               |    debug时执行选中的语句 |

*****

<h2 id="other"> 其他快捷键 </h2>

| cmd + ,                |    调出setting界面 |
| cmd + ;                |    调出项目setting界面 |
| cmd + F4               |    关闭当前界面 |




*****
