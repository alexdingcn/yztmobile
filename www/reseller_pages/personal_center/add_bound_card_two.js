/**
 *  经销商添加银行卡
 * 	@author hxbnzy
 *  @time 2017/08/11
 */

var InterValObj; //timer变量，控制时间  
var count = 60; //间隔函数，1秒执行  
var curCount; //当前剩余秒数  
var usersObj;
var bank_info;
var fastPaymentBankID;
window.onload = function() {
	FastClick.attach(document.body);
	
if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	curCount = count;
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	bank_info = JSON.parse(sessionStorage.getItem('$bank_info'));
	$('#bankName').val(bank_info.BankCodeName);
	var reg = /^1[3|4|5|7|8][0-9]{9}$/;
	console.log(bank_info);
	$('#sendSMS').on('click', function() {
		var bankPhoneNum = $('#bankPhone').val();
		if(!reg.test(bankPhoneNum)) {
			weui.topTips('预留手机号码有误', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}

		//发送短信验证码
		var tx2531 = JSON.stringify({
			UserID: usersObj.UserID,
			ResellerID: usersObj.DisID,
			BankCode: bank_info.BankCode,
			Telephone: bankPhoneNum,
			BankID: bank_info.BankID,
			Name: bank_info.name,
			IdentityCard: bank_info.IdentityCard
		});
		//
		postPay('Tx2531', tx2531, function(response) {
			if(response.Result === "T") {
				$("#sendSMS").attr("disabled", "true");
				$("#sendSMS").text(curCount + "秒后重新发送");
				InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次  
				fastPaymentBankID = response.FastPaymentBankID + '';
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

	//添加银行卡 提交操作
	$('#addBankConfrim').on('click', function() {
		var smsCode = $('#smsCode').val();
		if(smsCode === '') {
			weui.topTips('短信验证码不能为空', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}

		var tx2532 = JSON.stringify({
			UserID: usersObj.UserID,
			ResellerID: usersObj.DisID,
			FastPaymentBankID: fastPaymentBankID,
			MessageCode: smsCode
		});
		//
		postPay('Tx2532', tx2532, function(response) {
			if(response.Result === "T") {
				window.location.href = 'bound_card.html?'+Math.random();

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

function SetRemainTime() {
	if(curCount == 0) {
		window.clearInterval(InterValObj); //停止计时器  
		$("#sendSMS").removeAttr("disabled"); //启用按钮  
		$("#sendSMS").text("重新发送");
		code = ""; //清除验证码。如果不清除，过时间后，输入收到的验证码依然有效      
	} else {
		curCount--;
		$("#sendSMS").text(curCount + "秒后重新发送");
	}
}