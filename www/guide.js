$(function() {
    $.ajax({
        type: "get",
        url: "https://www.yibanmed.com/api/v1/homeconf",
        dataType: "json",
        success: function(data) {
            $("#adlist").empty();
            var bannerContent = '';
            var banners = data.banners;
            for (var i = 0; i < banners.length; i++) {
                var url = banners[i].url;
                bannerContent += '<div class="swiper-slide aditem" data-url="' + banners[i].url + '">' +
                    '<img src="' + banners[i].imageUrl + '"/>' +
                    '</div>';
            }
            $("#adlist").append(bannerContent);

            $('#ad0').empty();
            var adContent = '';
            var ads = data.ads;
            if (ads) {
                for (var i = 0; i < ads.length; i++) {
                    var url = ads[i].url;
                    adContent += '<div class="aditem" data-url="' + ads[i].url + '">' +
                        '<img src="' + ads[i].imageUrl + '"/>' +
                        '</div>';
                }
            }
            $("#ad0").append(adContent);

            $('.aditem').click(function(event) {
                if ($(this).data('url')) {
                    var ref = window.open($(this).data('url'), '_blank', 'location=no, toolbar=no');
                    ref.addEventListener('loadstop', function(event) {
                        if (event.url.match('mobile/close')) {
                            ref.close();
                        }
                    })
                }
            });

            // 优品推荐
            var promotions = data.promotions;
            if (promotions) {
                $("#promotionTitle").html(promotions.title);
                for (var i = 0; i < promotions.list.length; i++) {
                    $("#promotion" + i + " .item_title").html(promotions.list[i].title);
                    $("#promotion" + i + " .subtitle").html(promotions.list[i].subtitle);
                    $("#promotion" + i + " .product_image").attr('src', promotions.list[i].imageUrl);
                    if (promotions.list[i].url) {
                        $("#promotion" + i).attr('data-url', promotions.list[i].url);
                        $("#promotion" + i).on('click', function(event) {
                            var ref = window.open($(this).data('url'), '_blank', 'location=no,toolbar=no');
                            ref.addEventListener('loadstop', function(event) {
                                if (event.url.match('mobile/close')) {
                                    ref.close();
                                }
                            })
                        });
                    }
                }
            }

            // 优惠促销
            promotions = data.promotions2;
            if (promotions) {
                $("#promTitle").html(promotions.title);
                for (var i = 0; i < promotions.list.length; i++) {
                    $("#prom" + i + " .item_title").html(promotions.list[i].title);
                    $("#prom" + i + " .subtitle").html(promotions.list[i].subtitle);
                    $("#prom" + i + " .product_image").attr('src', promotions.list[i].imageUrl);
           
                    if (promotions.list[i].url) {
                        $("#prom" + i).attr('data-url', promotions.list[i].url);
                        $("#prom" + i).on('click', function(event) {
                            var ref = window.open($(this).data('url'), '_blank', 'location=no, toolbar=no');
                            ref.addEventListener('loadstop', function(event) {
                                if (event.url.match('mobile/close')) {
                                    ref.close();
                                }
                            })
                        });
                    }
                }
            }

            var swiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                direction: "horizontal",
                loop: true,
                autoplay: 5000,
                autoplayStopOnLast: true,
                preloadImages: false,
                lazyLoading: true,
            });
            var swiper = document.getElementById("adlist");
            if (swiper) {
                swiper.style.height = window.screen.height * 0.2 + "px";
            }
        },
        error: function() {
            console.log("yes");
        }
    });

    $('#jumpLogin').click(function() {
      var ref = window.open('index.html?t=' + Math.random(), '_blank', 'location=no,closebuttoncaption=关闭,transitionstyle=crossdissolve,toolbarposition=top');
    });

    //判断微信浏览器
    if (!is_weixin()) {

        // 注册下拉通知点击事件
        document.addEventListener("jpush.openNotification", onOpenNotification, false);
        //        document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
        //        document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
        // 获取本地保存的登陆角色
        var roleDetail = localStorage.getItem('$login_role') || "";
        if (roleDetail === null || roleDetail === '') {
            window.location.href = loginPage;
            return;
        }

        usersObj = JSON.parse(roleDetail);
        if (isDebug()) {
            setJumpPage(); //页面跳转
        } else {
            setTimeout(function() {
                // 获取JPuah 别名
                getAlias(function(response) {
                    if (response.Result === "T") {

                    } else {
                        //                        Alias获取失败
                    }
                });
                // 设置JPush 别名
                setAlias(md5(usersObj.CompUserID), function(response) {
                    if (response.Result === "T") {
                        // Alias设置成功
                    } else {
                        // 极光推送别名设置失败
                        // 目前不知道改做什么操作 😢
                        // Alias设置失败
                        //                        console.log('Alias设置失败--------------------------' + response.Description.code);
                    }
                    setJumpPage(); //页面跳转
                });
            }, 1500);
        }

    } else {
        /**
         * oauth2.0 授权回调 ,获取当前微信登陆 对应的用户平台角色信息
         * wx_code : 微信code
         * wx_oa : 微信公众号 appid (公众号授权回调链接参数:state)
         * 😂公众号id不知道怎么获取了，所以用了这么蠢的办法
         */

        var wx_code = getQueryVariable('code');
        var state = getQueryVariable('state');
        var wx_oa = state.split("%3B")[0];
        var enterpriseID = '';
        enterpriseID = state.split("%3B")[1];
        var WXGetUserinfo = JSON.stringify({
            code: wx_code,
            wxoa: wx_oa,
        });
        post('WXGetUserinfo', WXGetUserinfo, function(response) {
            if (response.Result === 'T') {
                //保存微信openid
                localStorage.setItem('$wx_openid', response.OpenID);
                //保存用户登陆信息
                localStorage.setItem('$usersList', JSON.stringify(response.UserList));
                //跳转登陆页面
                $.each(response.UserList, function(index, value) {
                    if (value.isLastTime === '1') {
                        //将登陆角色保存到本地
                        localStorage.setItem('$login_role', JSON.stringify(value));
                        if (value.CType === 1) {
                            window.location.href = 'company_pages/home/home.html?t=' + Math.random();
                        } else if (value.CType === 2) {
                            window.location.href = 'reseller_pages/home/home.html?t=' + Math.random();
                        }
                    }
                });
                //            window.location.href = 'company_pages/login/login.html?t=' + Math.random();
            } else if (response.Result === '1') {
                // 保存微信openid
                localStorage.setItem('$wx_openid', response.OpenID);
                if (enterpriseID === '' || enterpriseID === undefined) {
                    window.location.href = loginPage;
                } else {
                    window.location.href = 'shop_page/mall_home.html?t=' + Math.random() + '&id=' + enterpriseID;
                }
            } else {
                if (enterpriseID === '' || enterpriseID === undefined) {
                    window.location.href = loginPage;
                } else {
                    window.location.href = 'shop_page/mall_home.html?t=' + Math.random() + '&id=' + enterpriseID;
                }
            }
        });
    }

})
