/**
 *  核心企业修改密码
 * 	@author wyf
 *  @time 2017/08/10
 */
window.onload = function() {
	
if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
	var usersObj = JSON.parse(roleDetail);
	var oriPass;
	var newPass;
	var againPass;
	$('.psave').on("click", function() {
		oriPass = $('.oriPassword').val();
		newPass = $('.newPassw').val();
		againPass = $('.agaginPass').val();
		if(newPass == againPass) {
			initData(usersObj);
		}

	})

	/*获取登录账号信息*/
	function initData(usersObj) {
		/*发送数据请求*/
		var OrderPrompt = JSON.stringify({
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			OldPassword: oriPass,
			NewPassword: newPass
		});
		post('EditCompanyLoginPassword', OrderPrompt, function(response) {
			var el;
			$.tips({
                content:response.Description,
                stayTime:2000,
                type:response.Result==='T'?'success':'warn'
           })
		})
	}
}