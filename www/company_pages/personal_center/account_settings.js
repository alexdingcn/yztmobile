/**
 *  核心企业获取个人中心
 * 	@author wyf
 *  @time 2017/08/09
 */
window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
	var usersObj = JSON.parse(roleDetail);
	$('.a1').text(usersObj.CompName);
	$('.tel').text(usersObj.Phone);
	$('.setHome .li').on('click', function() {
		if($(this).index() == 0) {
			window.location.href = 'my_account.html?' + Math.random();
		} else if($(this).index() == 1) {
			window.location.href = 'change_pws.html?' + Math.random();
		} else if($(this).index() == 2) {
			window.location.href = 'company_info.html?' + Math.random();
		} else if($(this).index() == 3) {
			window.location.href = 'bank_account.html?' + Math.random();
		} else {

		}
	})

	$(".exitLogin").on('click', function() {
		exitLogin();
	})
}
//退出登录
function exitLogin() {
	weui.actionSheet([{
		label: '退出后不会删除任何历史数据，下次登陆依然可以适用本账号。',
	}, {
		label: '退出登陆',
		onClick: function() {
			localStorage.setItem('$usersList', '[]');
			localStorage.setItem('$login_role', ''); //清空本地保存信息
			window.location.href = '../login/login.html';
		}
	}], [{
		label: '取消',
		onClick: function() {

		}
	}], {
		className: "custom-classname"
	});
}