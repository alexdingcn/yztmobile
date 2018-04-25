/**
 *  经销商修改密码
 * 	@author hxbnzy
 *  @time 2017/08/11
 */
var usersObj;
window.onload = function() {
	init();
}

function init() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);

	$('#employ').on('click', function() {
		var originalPassword;
		var newPassword;
		var confirmPassword;
		originalPassword = $(original_password).val();
		newPassword = $(new_password).val();
		confirmPassword = $(confirm_password).val();

		if(originalPassword === '' || newPassword === '' || confirmPassword === '') {

			weui.topTips('请填写正确的字段', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}
		if(newPassword !== confirmPassword) {
			weui.topTips('新密码输入不一致', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}

		//修改密码
		var EditResellerLoginPasswordRequest = JSON.stringify({
			UserID: usersObj.UserID,
			ResellerID: usersObj.DisID,
			OldPassword: originalPassword,
			NewPassword: newPassword
		});

		post('EditResellerLoginPassword', EditResellerLoginPasswordRequest, function(response) {

			if(response.Result === "T") {

				localStorage.setItem('$users', '[]');
				localStorage.setItem('$login_role', ''); //清空本地保存信息

				window.location.href = '../../company_pages/login/login.html';
			} else {
				el = $.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});
	});
}