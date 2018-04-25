/**
 *  经销商绑定银行卡
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
	$('#addBoundCard').click(function(){
		window.location.href = 'add_bound_card.html?'+Math.random();
	});
	
	//获取用户输入银行卡号信息
	var GetFastpayBank = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		ResellerID: usersObj.DisID
	});

	postPay('GetFastpayBank', GetFastpayBank, function(response) {

		if(response.Result === "T") {
			if(response.BankCardList.length === 0){
				$('#tips').show();
			}else{
				$('#tips').hide();
				fastPayList(response.BankCardList);
			}
			
			
		} else {
			
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
		}
	});
}

function fastPayList(bankCardList) {
	var strbig = '';
	$.each(bankCardList, function(index, value) {
		strbig += '<li class="bule-bg"><div class="name">' + value.BankName + '</div><div class="type">储蓄卡</div><div class="num">****  ****  **' + value.BankCode + '</div></li>'
	});

	$('#bankCardList').append(strbig);
}