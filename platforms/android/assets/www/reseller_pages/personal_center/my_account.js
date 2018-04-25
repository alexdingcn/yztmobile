/**
 *  经销商我的账号
 * 	@author hxbnzy
 *  @time 2017/08/11
 */
var usersObj;
window.onload = function(){
	init();
}


function init(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	
	//获取经销商账号信息
	var resellerInfoRequest = JSON.stringify({
		UserID: usersObj.UserID,
		ResellerID:usersObj.DisID,
	});

	post('GetResellerInfo', resellerInfoRequest, function(response) {
		
		if(response.Result === "T") {
			$('#disName').text(response.DisName);
			$('#disPrincipal').text(response.DisPrincipal);
			$('#disPhone').text(response.DisPhone);
			$('#userName').text(response.UserName);
			$('#isOrderAudit').text('不需要')
		} else {
			
		}
	});
}
