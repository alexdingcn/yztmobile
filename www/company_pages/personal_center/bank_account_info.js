/**
 *  核心企业收款账号详细信息
 * 	@author wyf
 *  @time 2017/08/11
 */
var usersObj;
var payAccID; //收款账户ID
window.onload = function() {

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
	usersObj = JSON.parse(roleDetail);
	initData(usersObj);
	$(".sys-wh .opt-circle").on("click", function() {
		var isEnab = $(this).attr("name");
		if(isEnab == 1) {
			$(this).attr("name", 0);
			//			$(this).removeClass("bule");
		} else {
			$(this).attr("name", 1);
			//			$(this).addClass("bule");
		}
		isEnabl(usersObj)
	})

}
/*获取系统设置信息*/
function initData(usersObj) {
	/*发送数据请求*/
	var payAccount = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID
	});
	post('GetCompanyInfo', payAccount, function(response) {
		if(response.Result === "T") {
			//					console.log(response.PayAccountList[0]);
			var sid = localStorage.getItem("sid");
			var payAcc = response.PayAccountList[sid];
			//					console.log(payAcc)
			showPayData(payAcc);
			payAccID = payAcc.PayAccountID;
		} else {

		}
	})
}
//把获取的收款账户数据展示到页面中
function showPayData(showData) {
	var isEna = showData.IsEnable;
	if(isEna == 1) {
		$(".sys-wh .opt-circle").addClass("bule").attr("name", 1);
	} else {
		$(".sys-wh .opt-circle").removeClass("bule").attr("name", 0);
	}
	$(".g-c-day .info2").eq(0).text(showData.AccountName);
	$(".g-c-day .info2").eq(1).text(showData.BankName);
	$(".g-c-day .info2").eq(2).text(showData.AccountCode);
	$(".g-c-day .info2").eq(3).text(showData.BankPrivate);
	$(".g-c-day .info2").eq(4).text(showData.AccountType);
	$(".g-c-day .info2").eq(5).text(showData.BankCity);
	$(".g-c-day .info2").eq(6).text(showData.BankAddress);
	$(".g-c-day .info2").eq(7).text(showData.CateType);
	$(".g-c-day .info2").eq(8).text(showData.CateCode);
}
//发送启动禁用请求
function isEnabl(usersObj) {
	isEnab = $(".sys-wh .opt-circle").attr("name");
	var isEna = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		PayAccountID: payAccID,
		Value: isEnab
	});
	post('EditCompanyPayAccount', isEna, function(response) {
		if(response.Result === "T") {
			if(isEnab === '1') {
				$('#isEnab').addClass('bule');
			} else {
				$('#isEnab').removeClass('bule');
			}
			el = $.tips({
				content: response.Description,
				stayTime: 3000,
				type: "success"
			})
		} else {
			if(isEnab === '1') {
				$('#isEnab').removeClass('bule');
				$(".sys-wh .opt-circle").attr("name", 0);
			} else {
				$(".sys-wh .opt-circle").attr("name", 1);
				$('#isEnab').addClass('bule');
			}

			el = $.tips({
				content: response.Description,
				stayTime: 3000,
				type: "warn"
			})
		}
	})
}