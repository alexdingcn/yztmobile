/**
 *  经销商预付款充值
 * 	@author hxbnzy
 *  @time 2017/08/14
 */
var usersObj;
var typePay = 0; //未选择支付方式 1:快捷支付 2:微信支付
var isWxPay = false;
var isquickPayment = false;
window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	init();
	// 设置金额输入框 输入类型
	$("#amount_paid").keydown(function(e) {
		this.value = /^\d+\.?\d{0,1}$/.test(this.value) ?
			this.value : this.value.split('.')[1].length == 1 ?
			this.value : this.value = this.value.split('.')[0] + '.' + this.value.split('.')[1].substr(0, 1)
	});
	// 快捷支付
	$('#quick_payment').on('click', function() {
		if(isquickPayment) {
			$('#quick_payment').removeClass('ok');
			isquickPayment = false;
		} else {
			$('#wxPay').removeClass('ok');
			isWxPay = false;

			$('#quick_payment').addClass('ok');
			isquickPayment = true;
		}

		setPaymentType();
	});

	// 微信支付
	$('#wxPay').on('click', function() {

		if(isWxPay) {
			$('#wxPay').removeClass('ok');
			isWxPay = false;
		} else {
			$('#quick_payment').removeClass('ok');
			isquickPayment = false;

			$('#wxPay').addClass('ok');
			isWxPay = true;
		}

		setPaymentType();
	});

	$('#confirm').on('click', function() {
		switch(typePay) {
			case 0:
				break;
			case 1:
				var sum = $('#sum').val();
				var remark = $('#remark').val();
				if(sum === '' || parseFloat(sum) === 0) {
					$.tips({
						content: '请输入充值金额',
						stayTime: 3000,
						type: "warn"
					});
					return;
				}
				// 跳转支付界面
				window.location.href = 'payment_recharge_two.html?num =' + sum;
				break;
			case 2:
				var sum = $('#sum').val();
				var remark = $('#remark').val();
				if(sum === '' || parseFloat(sum) === 0) {
					$.tips({
						content: '请输入充值金额',
						stayTime: 3000,
						type: "warn"
					});
					return;
				}
				// 调用微信支付
				//				if(is_weixin()) {
				var openID = localStorage.getItem('$wx_openid') || '';
				if(openID === '') {
					$.tips({
						content: '微信支付失败,Error code : 7001 请稍后重试，或联系客服',
						stayTime: 3000,
						type: "warn"
					});
				};
				var ReTxWxPay = JSON.stringify({
					CompID: usersObj.CompID,
					ResellerID: usersObj.DisID,
					UserID: usersObj.UserID,
					hidFastPay: '0',
					price: sum,
					remark: '',
					PreType: '1',
					ShouXuFeiPrice: '0', //快捷支付手续费（单位：元）无传0
					sxfsqf: '0', //手续费收取方（1，经销商，2，核心企业，0，平台）
					openid: openID // 微信识别id
				});

				postPay('ReTxWxPay', ReTxWxPay, function(response) {
					if(response.Result === "T") {
						callWxPay(response.WxResult[0]);
					} else {
						$.tips({
							content: response.Description,
							stayTime: 3000,
							type: "warn"
						});
					}
				});

				//				} else {
				//					$.tips({
				//						content: '微信支付正在开发中...',
				//						stayTime: 3000,
				//						type: "warn"
				//					});
				//					return;
				//				}
				break;
		}

	});

	/** 获取配置信息，设置当前支付显示隐藏 */
	function init() {
		var GetAccount = JSON.stringify({
			ResellerID: usersObj.DisID
		});

		postPay('GetAccount', GetAccount, function(response) {
			if(response.Result === "T") {
				if(response.ResultCode){
					$('#wechatPay').show();
				}else{
					$('#wechatPay').hide();
				}
				
			} else {
				$('#wechatPay').hide();
			}
		});
	}
	/** 	
	 * 支付方式 paymentType
	 * 0:钱包支付 1:快捷支付 2:钱包+快捷支付 3：微信支付 4:微信+钱包支付 
	 */
	function setPaymentType() {
		if(isquickPayment === false && isWxPay === false) {
			typePay = 0;
		} else if(isquickPayment === true && isWxPay === false) {
			typePay = 1;
		} else if(isquickPayment === false && isWxPay === true) {
			typePay = 2;
		} else {
			typePay = 0;
		}

	}

	/** 调用微信公众号支付 */
	var callWxPay = function(payment) {
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				'appId': payment.appId,
				'timeStamp': payment.timeStamp,
				'nonceStr': payment.nonceStr,
				'package': payment.package,
				'signType': payment.signType,
				'paySign': payment.paySign
			},
			function(res) {
				if(res.err_msg == "get_brand_wcpay_request:ok") {
					window.location.href = 'funds_list.html?random=' + Math.random();
				} else if(res.err_msg == "get_brand_wcpay_request:cancel") {
					// 取消 
					$.tips({
						content: '您当前取消了支付',
						stayTime: 3000,
						type: "warn"
					});
				} else {
					// 失败 
					$.tips({
						content: res.err_desc,
						stayTime: 3000,
						type: "warn"
					});
				}
			});
	}
}