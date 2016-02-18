/**
 * 页面ready方法
 */
$(document).ready(function() {
    backToTop();
    scrollToc();
    // 动态背景
    // $("body").quietflow({
    //     theme : "starfield"
    // });
});

// 回到顶部
function backToTop() {
    var st = $(".page-scrollTop");
    var $window = $(window);
    //滚页面才显示返回顶部
    $window.scroll(function() {
        var topOffset = $window.scrollTop();
        if (topOffset > 300) {
            st.fadeIn(500);
        } else {
            st.fadeOut(500);
        }
    });
    //点击回到顶部
    st.click(function() {
        $("body").animate({
            scrollTop: "0"
        }, 500);
    });
}

// 给toc添加滑动效果
function scrollToc() {
    var links = $("ul#markdown-toc a");
    for (var i=0; i<links.length; i++) {
        links[i].dataset.ukSmoothScroll="{offset: 50}";
        // links[i].attr("data-uk-smooth-scroll", "{offset: 50}");
    }
}
