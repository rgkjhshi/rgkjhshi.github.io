---
layout: blog
title:  SpringMVC之Controller控制器
date:   2015-12-25
category: 编程技术  
tag: Spring
---
SpringMVC中,每一个URL请求是通过`DispatcherServlet`负责转发给相应的`Handler`的,
处理器`Handler`是基于`@Controller`和`@RequestMapping`这两个注解的,
`@Controller`声明一个处理器类，`@RequestMapping`声明对应请求的映射关系



*****

* TOC
{:toc}

*****

## 简单URL映射规则
`@RequestMapping`可以标记在类上,也可以标记在方法上,通过例子说明(假设拦截`*.do`)

~~~java
@Controller
@RequestMapping("/test")  // 若类`TestController`上没有`@RequestMapping`注解, 则访问`/index1.do`即可调用`index1`方法
public class TestController {
    @RequestMapping("/index1")  // index后面加不加.do都可以,即这里写`/index1`等同于`/index1.do`
    @ResponseBody               // 这个注解是为了不经过`ModelAndView`直接返回字符串
    public String index1(Map<String, Object> map) {  // 这些参数在返回篇里面说
        return "index1";
    }
    @RequestMapping("/*/index2")  // 支持通配符, 如`/test/abc/index2.do`,但`/test/index2.do`不能访问
    @ResponseBody
    public String index2() {
        return "index2";
    }
}
~~~

*****

## RequestMapping
`@RequestMapping`还有很多高级应用, 它有如下属性:

* value : url映射路径,如`@RequestMapping({"/index1"})`、`@RequestMapping({"/index2", "/index3"})`
* path : 同value
* method : 指定请求的类型,如`@RequestMapping(method = {RequestMethod.GET})`
* params : 指定请求中必须包含某些参数值时，才让该方法处理
* headers : 指定请求中必须包含某些指定的header值，才能让该方法处理请求
* consumes : 指定处理请求的提交内容类型(Content-Type),例如application/json, text/html
* produces : 指定返回的内容类型，仅当request请求头中的(Accept)类型中包含该指定类型才返回

~~~java
@Controller
@RequestMapping("/test")
public class TestController {
    // 请求参数中必须包含`key1`和`key2`两个参数才会执行该方法, 如`/index1.do?key1=1&key2=2`
    @RequestMapping(value = "/index1", params = {"key1", "key2"})
    @ResponseBody
    public String index1() {
        return "index1";
    }
    // 请求参数中必须包含参数`key`且值必须为`value`才会执行该方法, 如`/index2.do?key=value`
    @RequestMapping(value = "/index2", params = "key=value")
    @ResponseBody
    public String index2() {
        return "index2";
    }
    // 请求头中`Accept`必须包含`text/html`才会执行该方法
    @RequestMapping(value = {"/index3"}, headers = "Accept=text/html")
    @ResponseBody
    public String index3() {
        return "index3";
    }
    // 该方法仅处理请求中Content-Type为`application/json`类型的请求
    @RequestMapping(value = {"/index4"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String index4() {
        return "index4";
    }
    // 该方法仅处理请求中Accept包含`text/html`的请求,同时暗示了返回的内容类型为`text/html`
    @RequestMapping(value = {"/index5"}, produces = "text/html;charset=UTF-8")
    @ResponseBody
    public String index5() {
        return "index5";
    }
}
~~~

*****

## PathVariable
在`@RequestMapping`注解标注的方法上可以使用URI模板  
URI模板就是在URI中给定一个变量, 然后在映射的时候动态的给该变量赋值, 通过注解`@PathVariable`获取URI模板中的值

~~~java
@Controller
//@RequestMapping(value = "/{testName}")  // 类上的模板变量可以赋值给所有成员方法的参数
public class TestController {
    // URI: `/index1/id5.do`, 则 id = id5
    @RequestMapping(value = "/index1/{indexId}")
    @ResponseBody
    public String index1(@PathVariable("indexId") String id) {  // 可以指定取自哪个URI模板变量, 不指定则默认找跟参数名相同的变量, 最好都指定
        return id;
    }
    // 支持正则, 如 URI: `/index2/test-10.do`, 则 indexName=test, v=10
    @RequestMapping(value = "/index2/{indexName:[a-z]+}-{version:[\d]+}")
    @ResponseBody
    public String index2(@PathVariable String indexName, @PathVariable("version") int v) { // 简单类型Spring直接转, 复杂类型后面说怎么转
        return indexName + "-" + v;
    }
}
~~~

*****

## RequestParam
使用`@RequestParam`可以绑定`HttpServletRequest`请求参数到Controller的方法参数  
它有几个属性:

* value : 绑定的请求中的参数名字
* name : 同value
* required : 是否必传, 默认为`true`
* defaultValue : 默认值, 不传时相当于默认传了该值

~~~java
@Controller
public class TestController {
    // URI: `/index1.do?id=5`, 则 id = 5
    @RequestMapping("/index1")
    @ResponseBody
    public String index1(@RequestParam String id) {  // 默认绑定同名参数
        return id;
    }
}
~~~

*****

## CookieValue
使用`@CookieValue`可以绑定 cookie 的值到Controller的方法参数, 它的属性和用法同`RequestParam`

*****

## RequestHeader
使用`@RequestHeader`可以绑定`HttpServletRequest`头信息到Controller的方法参数, 属性和用法同`RequestParam`

~~~java
@Controller
public class TestController {
    @RequestMapping("/index")
    @ResponseBody
    public String index(@RequestHeader String Host, @RequestHeader String host) {
        return Host + ";" + host;  // 两个值是一样的, 即RequestHeader是大小写不敏感的, 这是与RequestParam的不同
    }
}
~~~

*****

## ModelAttribute 和 SessionAttributes
`@ModelAttribute`和`@SessionAttributes`可在不同的模型和控制器之间共享数据  
`@ModelAttribute`主要有两种使用方式，一种是标注在方法上，一种是标注在Controller的方法参数上:

* 标注在方法上时,该方法将在处理器方法(即有`@RequestMapping`注解的方法)执行之前执行,
然后把返回的对象存放在session或模型属性中,属性名可以使用`@ModelAttribute("attributeName")` 在指定,
若未指定,则用返回类型的类名(首字母小写)作为属性名称  
* 标注在Controller的方法参数上时, 即将属性值从session或模型属性中取出来注入到参数中去

`@SessionAttributes`一般是标记在Controller类上,用来从Session中存取数据, 可以通过`value(names)`、`types`属性来指定哪些是需要存放在session中的:

* 使用`value`或`names`属性的时候, 使用的Session属性名称应为对应的名称
* 使用`types`属性的时候,则使用的Session属性名称为对应类型的名称(首字母小写)
* 当`value`和`types`两个属性同时使用时,取的是它们的 *并集*, 而不是交集

如何使用看下面例子

~~~java
// OneController没有使用`@SessionAttributes`标注, 属性值存放在模型属性中
@RestController
public class OneController {
    @ModelAttribute    // ModelAttribute标注的方法，每次请求控制器方法时都会执行
    public String getName() {
        System.out.println("不设置属性名则默认为string");
        return "Tom";
    }
    @ModelAttribute("name")
    public String getAge() {
        System.out.println("属性名为name");
        return "Bob";
    }
    @RequestMapping("/one")
    public String index(@ModelAttribute("string") String name, @ModelAttribute("name") String name2, HttpSession session) {
        System.out.println("请求／one.do时, 该控制器方法执行之前,上面那两个方法就已经执行了");
        Enumeration names = session.getAttributeNames();
        while (names.hasMoreElements()) {
            System.out.println(names.nextElement());  // 这里什么也没输出
        }
        return name + "," + name2;
    }
}
// TwoController使用`@SessionAttributes`标注, 某些属性值存放在session中
@RestController
@SessionAttributes(names = {"v1"}, types = {String.class})
public class TwoController {
    @ModelAttribute("v1")  // 通过names注入到session, 属性名为v1
    public Integer value1() {
        System.out.println("model:v1");
        return 1;
    }
    @ModelAttribute("s1")  // 通过types保存到session, 属性名为s1
    public String string1() {
        System.out.println("model:s1");
        return "s1";
    }
    @ModelAttribute        // 通过types保存到session, 属性名为默认的string
    public String string2() {
        System.out.println("model:s2");
        return "s2";
    }
    @ModelAttribute        // 只能保存到模型属性中, 属性名为默认的date, 每次仍会执行
    public Date date1() {
        System.out.println("model:d1");
        return new Date();
    }
    @RequestMapping("/two")
    public String index(@ModelAttribute("v1") Integer v1, @ModelAttribute("date") Date d1,
                        @ModelAttribute("s1") String s1, @ModelAttribute("string") String s2, HttpSession session) {
        Enumeration names = session.getAttributeNames();
        while (names.hasMoreElements()) {
            System.out.println("session:" + names.nextElement());
        }
        return v1 + "," + s1 + "," + s2 + "," + d1;
    }
}
~~~
对于`TwoController`的输出结果有必要说明下:

~~~java
// 第一遍请求/two.do输出的结果:
model:v1
model:s1
model:s2
model:d1
// 第二遍请求/two.do输出的结果:
model:s2
model:d1
session:v1
session:s1
session:string
~~~
第一遍请求时session中还没有属性，请求完建立session之后才有值

*****

## 自定义参数类型转换
处理器方法参数接收请求参数绑定数据的时候,对于一些简单的数据类型Spring会帮我们自动进行类型转换,而对于一些复杂的类型想要在接受参数时自动转换就必须向Spring注册一个对特定类型的识别转换器  
Spring允许我们提供两种类型的识别转换器，一种是注册在Controller中的，一种是注册在SpringMVC的配置中;  
定义在Controller中的是局部的，只在当前Controller中有效，而放在SpringMVC配置文件中的是全局的，所有Controller都可以拿来使用。

每一个使用`@RequestParam`,`@PathVariable``@RequestHeader``@CookieValue`和`@ModelAttribute`标记的参数绑定时都会触发`initBinder`方法的执行,包括全局和局部的(局部只包括当前类中有效的), 注意是每一个,即每次请求，有几个注解参数就会触发几次

### 使用`@InitBinder`注解定义局部的类型转换器
在控制器里定义一个用`@InitBinder`注解的方法并声明一个`WebDataBinder`参数, 当Controller在处理请求方法时,若发现有不能解析的对象, 就会看该类中是否有用`@InitBinder`标记的方法, 如果有就会执行该方法, 然后看里面定义的类型转换器是否与当前需要的类型匹配.如下:

~~~java
@Controller
public class TestController {
    @InitBinder
    public void dataBinder(WebDataBinder binder) {
        DateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
        PropertyEditor propertyEditor = new CustomDateEditor(dateFormat, true); // 第二个参数表示是否允许为空
        binder.registerCustomEditor(Date.class, propertyEditor);
    }
    @RequestMapping("test/{date}")   // URI: /test/20151218.do
    public void testDate(@PathVariable Date date, Writer writer) throws IOException {
        writer.write(String.valueOf(date.getTime()));  // 输出: 1450368000000
    }
}
~~~
类型转换器是通过`WebDataBinder`对象的`registerCustomEditor`方法来注册的,要实现自己的类型转换器就要实现自己的`PropertyEditor` 对象. Spring已经提供了一些常用的属性编辑器,如`CustomDateEditor`,`CustomBooleanEditor`等

### PropertyEditor属性编辑器
`PropertyEditor`是JDK的接口,它有个实现类:`PropertyEditorSupport`,所以要实现自己的`PropertyEditor`时只需继承`PropertyEditorSupport`类, 然后重写其中的一些方法即可,一般重写`setAsText`和`getAsText`方法就可以了.

`setAsText`方法用于把字符串类型的值转换为对应的对象,一般先把字符串类型的对象转为特定的对象，然后利用`PropertyEditor`的`setValue`方法设定转换后的值.  
`getAsText`方法用于把对象当做字符串来返回,一般先使用`getValue`方法获取当前的对象, 然后把它转换为字符串后再返回给`getAsText`方法

~~~java
@Controller
public class TestController {
    @InitBinder
    public void dataBinder(WebDataBinder binder) {
        // 定义一个 User 属性编辑器
        PropertyEditor userEditor = new PropertyEditorSupport() {
            @Override
            public void setAsText(String userStr) throws IllegalArgumentException {
                User user = new User(1, userStr);  // 先转成User对象
                setValue(user);                    // 在用setValue设置转换后的值
            }
            @Override
            public String getAsText() {
                User user = (User) getValue();     // 先获取当前对象
                return user.getUsername();         // 再返回对象的字符串形式
            }
        };
        // 使用 WebDataBinder 注册 User 类型的属性编辑器
        binder.registerCustomEditor(User.class , userEditor);
    }
}
~~~

### 实现WebBindingInitializer接口定义全局的类型转换器
定义全局的类型转换器需要实现自己的`WebBindingInitializer`对象,然后把该对象注入到`RequestMappingHandlerAdapter`中,这样Spring在遇到自己不能解析的对象的时候就会到全局的`WebBindingInitializer`的`initBinder`方法中去找,每次遇到不认识的对象时,`initBinder`方法都会被执行一遍.

~~~java
    @Bean
    public RequestMappingHandlerAdapter requestMappingHandlerAdapter() {
        RequestMappingHandlerAdapter adapter = super.requestMappingHandlerAdapter();
        // 匿名内部类定义自己的WebBindingInitializer, 并注入到RequestMappingHandlerAdapter中
        adapter.setWebBindingInitializer(new WebBindingInitializer() {
            public void initBinder(WebDataBinder binder, WebRequest request) {
                DateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
                PropertyEditor propertyEditor = new CustomDateEditor(dateFormat, true);
                binder.registerCustomEditor(Date.class, propertyEditor);
            }
        });
        return adapter;
    }
~~~

*****

## 控制器方法支持的方法参数
`@RequestMapping`标记的控制器方法,传入spring会自动帮我们赋值，我们直接在方法上声明参数即可。  
方法的传入参数归纳如下:

* HttpServlet对象: 包括`HttpServletRequest`, `HttpServletResponse`和`HttpSession`对象.  使用`HttpSession`时如果此时session还没建立起来就会有问题
* Spring自己的`WebRequest`对象: 该对象可以访问到存放在HttpServletRequest和HttpSession中的属性值
* 流对象: 包括`InputStream`, `OutputStream`, `Reader`和`Writer`.`InputStream`和`Reader`是针对HttpServletRequest 而言的,可以从里面取数据; `OutputStream`和`Writer`是针对HttpServletResponse而言的,可以往里面写数据,如下列子:

~~~java
@Controller
public class TestController {
    @RequestMapping("/index")  //  直接向客户端输出内容
    public void index(Writer writer) throws IOException{
        writer.write("Hello World");
        writer.write( "\r" );
        writer.write( "哈哈" );
        writer.write( "\r" );
    }
}
~~~

* 使用`@PathVariable`, `@RequestParam`, `@CookieValue`和`@RequestHeader`标记的参数
* 使用`@ModelAttribute`标记的参数: 取模型属性相当于`request.getAttribute("key")`;  使用`@SessionAttributes`注解控制器之后,从session中取数据相当于`session.getAttribute("key")`
* `Map`, `Model`和`ModelMap`: 这些都可以用来封装模型数据,用来给视图做展示.
* 实体类: 可以用来接收上传的参数
* Spring封装的`MultipartFile`: 用来接收上传文件
* Spring封装的`Errors`和`BindingResult`对象: 这两个对象参数必须紧接在需要验证的实体对象参数之后，它里面包含了实体对象的验证结果

*****

## 返回值的类型
处理器中`@RequestMapping`标记的处理器方法的返回值也有不同情况，大部分情况是返回一个`ModelAndView`, 这个过程中发挥作用的就是`ViewResolver`和`View`.
有下面这些情况:

* 返回`ModelAndView`对象: 包含模型和视图,模型是map的形式,可以通过`request.getAttribute("key")`取值;视图是字符串形式,表示视图的名字
* 返回模型: 包括`Map`, Spring的`Model`和`ModelMap`, 视图名称将由`RequestToViewNameTranslator`决定
* 返回视图对象`View`: 这种情况可以给处理器方法传入一个模型参数,比如上面传入的那个Map,可在方法体里面往模型中添加值,相当于`setAttribute`
* 返回字符串`String`: 这往往代表的是一个视图名称, 如果需要模型的话,跟上面一样,传入一个模型参数即可
* 返回`void`: 这种情况一般是我们直接把返回结果写到`HttpServletResponse`中了,比如上面的`Writer`那样;  如果没有写,则会利用`RequestToViewNameTranslator`来返回一个对应的视图名称
* 处理器方法被`@ResponseBody`标记: 被标记的方法任何返回值都不会像上面那样当作视图或模型来处理, 而是通过`HttpMessageConverters`转换之后写到`HttpServletResponse`中
* 除了上面情况之外的其它任何返回类型都会被当做模型中的一个属性来处理,属性名称可在该方法上用`@ModelAttribute("attributeName")` 来定义, 否则将使用返回类型的类名称的首字母小写形式来表示; 返回的视图还是由`RequestToViewNameTranslator`来决定.

*****
