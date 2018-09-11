---
layout: blog
title:  SpringMVC实体对象绑定参数时自定义对应关系
date:   2018-09-11
category: 编程技术
tag:
---


*****

* TOC
{:toc}

*****

## 问题背景
通常情况下, 后端的变量命名方式都是`驼峰命名法(Camel Case)`, 而前端就不一定了, 有的用的是`Snake Case`(即多个单词之间用`_`隔开)。 在不改变命名的情况下, 如何把不同名字的参数进行绑定呢？比如`user_name`绑定到`userName`上。

* 可以通过`@RequestParam("user_name") String userName`这种形式, 但是当参数过多时也不优雅
* 通常情况我们会定义一个实体对象来接收参数, 但参数名不同无法自动绑定, 我们可以通过本文的方法实现非常简单的绑定

## 场景描述
如下一个`Controller`参数是通过一个实体`Test`接收的, 但是要接收的参数名称跟实体类的字段名称对应不上

~~~java
// Controller
@RestController
@RequestMapping(value = "/test/")
public class TestController {
    @RequestMapping(value = "index.htm")
    public String home(Test test) {
        return "It works!";
    }
}
// Test实体
public class Test {
    //  要接收参数 user_name
    private String userName;
    //  要接收参数 home_address
    private String address;
}
~~~

如上, `Test`中的字段分别叫`userName`和`address`, 但参数却为`user_name`和`home_address`. 接下来我们就要实现这种绑定关系

## 自定义注解
定义如下的注解, 注解只允许添加到字段上, 需要指明别名列表(即把参数中的别名绑定到实体字段上)

~~~java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValueFrom {
    /**
     * 参数名(别名)列表
     */
    String[] value();
}
~~~

然后我们的实体类加上相应的注解

~~~java
// Test实体加上注解后
public class Test {
    // 表明 userName 字段的值来自于参数中的 user_name
    @ValueFrom("user_name")
    private String userName;

    @ValueFrom("home_address")
    private String address;
}
~~~

## 定义`DataBinder`

~~~java
//
public class AliasDataBinder extends ExtendedServletRequestDataBinder {

    public AliasDataBinder(Object target, String objectName) {
        super(target, objectName);
    }

    /**
     * 复写addBindValues方法
     * @param mpvs 这里面存的就是请求参数的key-value对
     * @param request 请求本身, 这里没有用到
     */
    @Override
    protected void addBindValues(MutablePropertyValues mpvs, ServletRequest request) {
        super.addBindValues(mpvs, request);
        // 处理要绑定参数的对象
        Class<?> targetClass = getTarget().getClass();
        // 获取对象的所有字段(拿到Test类的字段)
        Field[] fields = targetClass.getDeclaredFields();
        // 处理所有字段
        for (Field field : fields) {
            // 原始字段上的注解
            ValueFrom valueFromAnnotation = field.getAnnotation(ValueFrom.class);
            // 若参数中包含原始字段或者字段没有别名注解, 则跳过该字段
            if (mpvs.contains(field.getName()) || valueFromAnnotation == null) {
                continue;
            }
            // 参数中没有原始字段且字段上有别名注解, 则依次取别名列表中的别名, 在参数中最先找到的别名的值赋值给原始字段
            for (String alias : valueFromAnnotation.value()) {
                // 若参数中包含该别名, 则把别名的值赋值给原始字段
                if (mpvs.contains(alias)) {
                    // 给原始字段赋值
                    mpvs.add(field.getName(), mpvs.getPropertyValue(alias).getValue());
                    // 跳出循环防止取其它别名
                    break;
                }
            }
        }
    }
}
~~~

* 自定义的数据绑定器(`AliasDataBinder`)要继承自`ExtendedServletRequestDataBinder`
* 复写`addBindValues`方法, 该方法的第一个参数`MutablePropertyValues`里面存的就是请求参数的`key-value`对, 第二个参数是`ServletRequest`, 这里没有用到
* `getTarget()`是继承自`DataBinder`的方法, 可以获取参数要绑定的实体类对象
* 遍历`targetClass`的所有字段, 字段上有注解则处理, 没有则不处理
* 从内层的循环可以看出, 注解其实可以添加多个别名参数, 这里会取出第一个有值的参数


## 定义`ModelAttributeMethodProcessor`

~~~java
public class AliasModelAttributeMethodProcessor extends ServletModelAttributeMethodProcessor implements ApplicationContextAware {
    private ApplicationContext applicationContext;

    public AliasModelAttributeMethodProcessor(boolean annotationNotRequired) {
        super(annotationNotRequired);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    @Override
    protected void bindRequestParameters(WebDataBinder binder, NativeWebRequest request) {
        AliasDataBinder aliasBinder = new AliasDataBinder(binder.getTarget(), binder.getObjectName());
        RequestMappingHandlerAdapter requestMappingHandlerAdapter = applicationContext.getBean(RequestMappingHandlerAdapter.class);
        requestMappingHandlerAdapter.getWebBindingInitializer().initBinder(aliasBinder);
        aliasBinder.bind(request.getNativeRequest(ServletRequest.class));
    }
}
~~~

* 自定义的属性处理器要继承自`ServletModelAttributeMethodProcessor`, 重写`bindRequestParameters`方法, 这个方法就是绑定数据对象的时候调用的方法。
* 实现`ApplicationContextAware`是为了获取`ApplicationContext`

使用`SpringMVC`时, 所有的请求都是最先经过`DispatcherServlet`的, 然后由`DispatcherServlet`选择合适的`HandlerMapping`和`HandlerAdapter`来处理请求, `HandlerMapping`的作用就是找到请求所对应的方, 而`HandlerAdapter`则来处理和请求相关的的各种事情。我们这里用的请求参数绑定也是通过`HandlerAdapter`来做的, 父类`ServletModelAttributeMethodProcessor`实际上实现了`HandlerMethodArgumentResolver`接口。该接口有两个方法如下:

~~~java
public interface HandlerMethodArgumentResolver {

    /**
     * 返回是否支持这种参数
    */
    boolean supportsParameter(MethodParameter parameter);
    /**
     * 是具体处理参数的方法
    */
    Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception;
}
~~~

之所以单独拿出来说, 是因为后面还会涉及到。`ServletModelAttributeMethodProcessor`是用来处理复杂对象的(非基本类型), 比如我们定义的`Test`。


## 添加到Spring中

我们定义好了属性处理器, 还要把它添加到Spring中才能生效

~~~java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Bean
    protected AliasModelAttributeMethodProcessor processor() {
        return new AliasModelAttributeMethodProcessor(true);
    }
}
~~~

构造器中传了一个参数`true`, 这是因为`ModelAttributeMethodProcessor`是否支持某种类型的参数，是这样判断的

~~~java
// ServletModelAttributeMethodProcessor的父类
public class ModelAttributeMethodProcessor implements HandlerMethodArgumentResolver, HandlerMethodReturnValueHandler {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return (parameter.hasParameterAnnotation(ModelAttribute.class) ||
                (this.annotationNotRequired && !BeanUtils.isSimpleProperty(parameter.getParameterType())));
    }
}
~~~

首先, 判断参数对象对象是否有`ModelAttribute`注解, 有则处理; 如果没有，则判断`annotationNotRequired`(注解 **不是** 必需的), 如果为`true`(表示非必需)并且参数对象不是简单对象, 则处理。这里参数对象`Test`是没有`ModelAttribute`注解的, 所以我们就需要传参为`true`, 表示不一定需要注解。

通过以上步骤, 则可以灵活控制参数的对应关系了。
