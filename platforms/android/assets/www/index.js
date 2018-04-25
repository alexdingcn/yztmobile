/** 初始页 */
var usersObj = '';
$(function() {
	var setJumpPage = function() {
		//自动登陆
		if(usersObj.CType === 1) {
			window.location.href = 'company_pages/home/home.html?t=' + Math.random();
		} else if(usersObj.CType === 2) {
			window.location.href = 'reseller_pages/home/home.html?t=' + Math.random();
		} else {
			window.location.href = 'company_pages/login/login.html?t=' + Math.random();
		}
	};

	//判断微信浏览器
	if(!is_weixin()) {
		// 初始化JPush
		document.addEventListener("deviceready", onDeviceReady, false);
		// 注册下拉通知点击事件
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
		//		document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
		//		document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
		// 获取本地保存的登陆角色
		var roleDetail = localStorage.getItem('$login_role') || "";
		if(roleDetail === null || roleDetail === '') {
			window.location.href = 'company_pages/login/login.html?t=' + Math.random();
			return;
		}

		usersObj = JSON.parse(roleDetail);
		if(isDebug()) {
			setJumpPage(); //页面跳转
		} else {
			setTimeout(function() {
				// 获取JPuah 别名
				getAlias(function(response) {
					if(response.Result === "T") {
						
					} else {
//						Alias获取失败
					}
				});
				// 设置JPush 别名
				setAlias(md5(usersObj.CompUserID), function(response) {
					if(response.Result === "T") {
						// Alias设置成功
					} else {
						// 极光推送别名设置失败
						// 目前不知道改做什么操作 😢
						// Alias设置失败
//						console.log('Alias设置失败--------------------------' + response.Description.code);
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
			if(response.Result === 'T') {
				//保存微信openid
				localStorage.setItem('$wx_openid', response.OpenID);
				//保存用户登陆信息
				localStorage.setItem('$usersList', JSON.stringify(response.UserList));
				//跳转登陆页面
				$.each(response.UserList, function(index, value) {
					if(value.isLastTime === '1') {
						//将登陆角色保存到本地
						localStorage.setItem('$login_role', JSON.stringify(value));
						if(value.CType === 1) {
							window.location.href = 'company_pages/home/home.html?t=' + Math.random();
						} else if(value.CType === 2) {
							window.location.href = 'reseller_pages/home/home.html?t=' + Math.random();
						}
					}
				});
				//			window.location.href = 'company_pages/login/login.html?t=' + Math.random();
			} else if(response.Result === '1') {
				// 保存微信openid
				localStorage.setItem('$wx_openid', response.OpenID);
				if(enterpriseID === '' || enterpriseID === undefined) {
					window.location.href = 'company_pages/login/login.html?t=' + Math.random();
				} else {
					window.location.href = 'shop_page/mall_home.html?t=' + Math.random() + '&id=' + enterpriseID;
				}
			} else {
				if(enterpriseID === '' || enterpriseID === undefined) {
					window.location.href = 'company_pages/login/login.html?t=' + Math.random();
				} else {
					window.location.href = 'shop_page/mall_home.html?t=' + Math.random() + '&id=' + enterpriseID;
				}
			}
		});
	}

});