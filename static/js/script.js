/**
 * 页面ready方法
 */
$(document).ready(function() {
    backToTop();

    $("body").quietflow({
        theme : "starfield"
    });
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
