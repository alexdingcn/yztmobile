/**
 *  核心企业收款账号信息
 * 	@author wyf
 *  @time 2017/08/09
 */
var usersObj;
var payAccountListt; //收款账号信息
window.onload = function() {
	FastClick.attach(document.body);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
	usersObj = JSON.parse(roleDetail);
	initData(usersObj);

	// 	$(".g-c-day li").on("click",function(){
	//		window.location.href='银行账户.html';
	//	})
}
/*获取系统设置信息*/
function initData(usersObj) {
	/*发送数据请求*/
	var OrderPrompt = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID
	});
	post('GetCompanyInfo', OrderPrompt, function(response) {
		if(response.Result === "T") {
			payAccountListt = response.PayAccountList;
			bankNames(payAccountListt);
		} else {

		}
	})
}
//展示收账银行名称
function bankNames(payAccountListt) {
	var html;
	for(var i = 0; i < payAccountListt.length; i++) {
		html = "<li class='li' sid=" + i + "><i class='title'>" + payAccountListt[i].BankName + "</i><div class='info'><i class='i-arrow'></i></div></li>";
		$(".g-c-day").append(html);
	}
	$(".g-c-day li").on("click", function() {
		var sId = $(this).attr("sid");
		localStorage.setItem("sid", sId);
		window.location.href = 'bank_account_info.html?' + Math.random();

	})
}