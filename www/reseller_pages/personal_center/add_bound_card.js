/**
 *  添加银行卡
 * 	@author hxbnzy
 *  @time 2017/08/11
 */

var usersObj;
window.onload = function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#confirm').on('click', function() {
		var userName = $('#userName').val();
		var bankID = $('#bankID').val();
		var ID = $('#ID').val();

		if(userName === '' || bankID === '' || ID === '') {
			weui.topTips('输入框内容不能为空', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}

		var GetVisiableBank = JSON.stringify({
			BankCode: bankID,
		});

		postPay('GetVisiableBankList', GetVisiableBank, function(response) {

			if(response.Result === "T") {

				var bank_info = {
					BankCode: bankID,
					BankID: response.BankID,
					BankCodeName: response.BankName,
					name: userName,
					IdentityCard: ID
				};
				//临时保存要绑定的银行卡信息
				sessionStorage.setItem('$bank_info', JSON.stringify(bank_info));
				window.location.href = 'add_bound_card_two.html?'+Math.random();
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
	});

}