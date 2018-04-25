/**
 *  经销商 - 快捷支付验证
 * 	@author hxbnzy
 *  @time 2017/08/21
 */
var usersObj;
var payInfo;
var InterValObj; //timer变量，控制时间  
var count = 60; //间隔函数，1秒执行  
var curCount; //当前剩余秒数  
var payid = '';
var paypreid;
var fastPaymentBankID;
var payNumb;

$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	curCount = count;
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	var url = window.location.href; //URL地址
	payInfo = JSON.parse(unescape(url.split('id=')[1] || ""));
	payNumb = payInfo.PayNumb;
	payid = payInfo.PayID;
	fastPaymentBankID = payInfo.FastPaymentBankID;
	console.log(payInfo);
	$('#amount').text('¥' + payInfo.BankPrice);
	$('#bankName').text(payInfo.BankName);
	$("#sendSMS").attr("disabled", "true");
	$("#sendSMS").text(curCount + "秒后重新发送");
	InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次  

	//提交支付
	$('#confirm').on('click', function() {

		var smsCode = $('#smsCode').val();
		if(payid === '') {
			el = $.tips({
				content: '验证码未发送',
				stayTime: 3000,
				type: "warn"
			})
			return;
		}
		if(smsCode === '') {
			el = $.tips({
				content: '验证码不能为空',
				stayTime: 3000,
				type: "warn"
			})
			return;
		}
		$('#loading').addClass('show');
		var Tx1376 = JSON.stringify({
			CompID: usersObj.CompID + '',
			ResellerID: usersObj.DisID + '',
			UserID: usersObj.UserID + '',
			FastPaymentBankID: fastPaymentBankID,
			MessageCode: smsCode,
			PayID: payid,
			PayNumb: payNumb,
			PrepayID: payid,
			ReceiptNo: payInfo.ReceiptNo,
		});

		postPay('Tx1376', Tx1376, function(response) {
			$('#loading').removeClass('show');
			if(response.Result === "T") {
				window.location.href = 'order_detail.html?id=' + payInfo.ReceiptNo;
			} else {
				el = $.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});

	});

	$('#sendSMS').on('click', function() {

		var Tx1375 = JSON.stringify({
			CompID: usersObj.CompID + '',
			UserID: usersObj.UserID + '',
			ResellerID: usersObj.DisID + '',
			FastPaymentBankID: payInfo.FastPaymentBankID,
			FastpayPrice: payInfo.money,
			PrePrice: "0",
			Prepassword: '',
			ReceiptNo: payInfo.ReceiptNo,
			ShouXuFeiPrice: payInfo.shouxufeiPrice,
			sxfsqf: "-1"
		});

		postPay('Tx1375', Tx1375, function(response) {
			if(response.Result === "T") {
				payNumb = response.PayNumb;
				payid = response.PayID;
				paypreid = response.PrepayID;
				fastPaymentBankID = response.FastPaymentBankID;

				$("#sendSMS").attr("disabled", "true");
				$("#sendSMS").text(curCount + "秒后重新发送");
				InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次  
			} else {
				el = $.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});

	});

});

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