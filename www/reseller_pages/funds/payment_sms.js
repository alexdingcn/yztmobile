/**
 *  经销商 - 快捷支付验证
 * 	@author hxbnzy
 *  @time 2017/08/21
 */
var usersObj;
var reTx1375Response;
var InterValObj; //timer变量，控制时间  
var count = 60; //间隔函数，1秒执行  
var curCount; //当前剩余秒数  
var payid;
var paypreid;
var hidFastPay;

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
	reTx1375Response = JSON.parse(unescape(url.split('=')[1] || ""));
	payid = reTx1375Response.payid;
	paypreid = reTx1375Response.paypreid;
	hidFastPay = reTx1375Response.hidFastPay;
	$('#amount').text('¥'+(parseFloat(reTx1375Response.ShouXuFeiPrice)+parseFloat(reTx1375Response.price)));
	$('#bankName').text(reTx1375Response.bankName);
	//设置验证码倒计时

	//	var Tx1376Request = JSON.stringify({
	//		UserID:usersObj.,//用户ID
	//		CompID:,//核心企业ID
	//		ResellerID:,//经销商ID
	//		ReceiptNo:,//订单编号
	//		PayNumb:,//支付交易流水号
	//		MessageCode:,//短信验证码
	//		PayID:,//支付表ID
	//		PrepayID:,//预付款表ID
	//		FastPaymentBankID://快捷支付表ID
	//	});
	$("#sendSMS").attr("disabled", "true");
	$("#sendSMS").text(curCount + "秒后重新发送");
	InterValObj = window.setInterval(SetRemainTime, 1000);
	//提交支付
	$('#confirm').on('click',function(){
		var smsCode = $('#smsCode').val();
		if(smsCode ===''){
			$.tips({
					content: '验证码不能为空',
					stayTime: 3000,
					type: "warn"
				})
			return;
		}
		var ReTx1376 = JSON.stringify({
			CompID: usersObj.CompID,
			ResellerID: usersObj.DisID,
			UserID: usersObj.UserID,
			phoneCode:smsCode,
			payid:payid,
			hidFastPay:hidFastPay,
			prepayid:paypreid
			
		});
		
		postPay('ReTx1376', ReTx1376, function(response) {
			if(response.Result === "T") {
				window.location.href = 'funds_list.html'
			}
			else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});
		
	});

	$('#sendSMS').on('click', function() {
	
		var ReTx1375 = JSON.stringify({
			CompID: usersObj.CompID,
			ResellerID: usersObj.DisID,
			UserID: usersObj.UserID,
			hidFastPay: fastPaymentBankID,
			price: rechargeAmount,
			remark: '',
			PreType: '1',
			ShouXuFeiPrice: fee, //快捷支付手续费（单位：元）无传0
			sxfsqf: feeType //手续费收取方（1，经销商，2，核心企业，0，平台）
		});
		
		postPay('ReTx1375', ReTx1375, function(response) {
			if(response.Result === "T") {
				payid: response.payid;
				paypreid: response.prepayid;
				hidFastPay: response.hidFastPay;
				$("#sendSMS").attr("disabled", "true");
				$("#sendSMS").text(curCount + "秒后重新发送");
				InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次  
			}
			else {
				$.tips({
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