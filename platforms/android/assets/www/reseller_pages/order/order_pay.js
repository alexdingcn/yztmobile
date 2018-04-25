/**
 *  订单支付页面
 *  组合支付下 钱包支付优先级>快捷支付
 * 	快捷支付、微信支付 二选一 无法共同支付
 * 	@author hxbnzy
 *  @time 2017/08/21
 */
var usersObj; //用户信息
var paymentType = '-1'; // 支付类型 0:钱包支付 1:快捷支付 2:钱包+快捷支付 3:线下支付
var paymentInfo;
var avaAmount = 0; // 钱包可用余额
var fastPaymentBankID = ''; // 快捷支付银行ID
var isWalletPayment = false;
var isquickPayment = false;
var isDownPayment = false;
var isWxPay = false;
var unpaidAmount = 0;
var bankFee = '0';

$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	usersObj = JSON.parse(roleDetail);
	init();
	var url = window.location.href;
	paymentInfo = JSON.parse(unescape(url.split('payment_info=')[1] || "")); //付款信息
	unpaidAmount = paymentInfo.UnpaidAmount;
	$('#amount_paid').val(unpaidAmount); //设置默认支付金额
	$('#total_amount').text('￥' + paymentInfo.TotalAmount); //订单总金额
	$('#paid_amount').text('￥' + paymentInfo.PaidAmount); //已支付金额

	$('.pay-fillIn').hide();
	$("#amount_paid").keydown(function(e) {
		this.value = /^\d+\.?\d{0,1}$/.test(this.value) ?
			this.value : this.value.split('.')[1].length == 1 ?
			this.value : this.value = this.value.split('.')[0] + '.' + this.value.split('.')[1].substr(0, 1)
	});

	$('#amount_paid').on('input propertychange', function() {
		if($(this).val() > unpaidAmount) {
			$(this).val(unpaidAmount);
		}
		resetWA();

	});

	$('#wallet_pay_amount').on('input propertychange', function() {
		resetWA();
	});

	// 提交支付
	$('#subPayment').on('click', function() {
		if(paymentType === '-1') {
			$.tips({
				content: '请选择支付方式',
				stayTime: 3000,
				type: "warn"
			})
			return;
		} else if(paymentType === '0') {

			if($('#payment_password').val() === '') {
				$.tips({
					content: '未填写钱包支付密码',
					stayTime: 3000,
					type: "warn"
				})
				return;
			}

			if($('amount_paid').val() > $('#wallet_pay_amount').val()) {
				$.tips({
					content: '钱包余额不足,请选择快捷支付',
					stayTime: 3000,
					type: "warn"
				})
				return;
			}

			if(parseFloat($('#amount_paid').val()) !== parseFloat($('#wallet_pay_amount').val())) {
				$.tips({
					content: '钱包金额与本次支付金额不一致',
					stayTime: 3000,
					type: "warn"
				})
				return;
			}

			var tx1375 = JSON.stringify({
				CompID: usersObj.CompID,
				ResellerID: usersObj.DisID,
				UserID: usersObj.UserID,
				ReceiptNo: paymentInfo.ReceiptNo,
				FastPaymentBankID: '0',
				PrePrice: $('#amount_paid').val(),
				FastpayPrice: '0',
				Prepassword: $('#payment_password').val(),
				ShouXuFeiPrice: '0',
				sxfsqf: '-1'
			});

			postPay('Tx1375', tx1375, function(response) {
				if(response.Result === 'T') {
					window.location.href = 'order_detail.html?random=' + Math.random() + "id=" + paymentInfo.ReceiptNo;
				} else {
					$.tips({
						content: response.Description,
						stayTime: 3000,
						type: "warn"
					})
				}

			});
		} else if(paymentType === '1') {

			//快捷支付
			var tx1375 = JSON.stringify({
				CompID: usersObj.CompID,
				ResellerID: usersObj.DisID,
				UserID: usersObj.UserID,
				ReceiptNo: paymentInfo.ReceiptNo,
				FastPaymentBankID: fastPaymentBankID,
				PrePrice: '0',
				FastpayPrice: $('#amount_paid').val(),
				Prepassword: '',
				ShouXuFeiPrice: bankFee,
				sxfsqf: '-1'
			});

			postPay('Tx1375', tx1375, function(response) {
				if(response.Result === 'T') {
					//验证银行支付
					var json = JSON.stringify({
						PayNumb: response.PayNumb,
						PayID: response.PayID,
						PrepayID: response.PrepayID,
						FastPaymentBankID: response.FastPaymentBankID,
						ReceiptNo: paymentInfo.ReceiptNo,
						money: $('#amount_paid').val(),
						PrePrice: '0',
						BankPrice: $('#amount_paid').val(),
						shouxufeiPrice: bankFee,
						BankName: $('#bankName').text()
					});

					window.location.href = 'order_pay_sms.html?random=' + Math.random() + "id=" + escape(json);

				} else {
					$.tips({
						content: response.Description,
						stayTime: 3000,
						type: "warn"
					});
				}

			});

		} else if(paymentType === '2') {
			//快捷支付+钱包支付
			if($('#payment_password').val() === '') {
				$.tips({
					content: '未填写钱包支付密码',
					stayTime: 3000,
					type: "warn"
				});
				return;
			}

			var fastpayPrice = parseFloat(paymentInfo.UnpaidAmount) - parseFloat($('#wallet_pay_amount').val());

			var tx1375 = JSON.stringify({
				CompID: usersObj.CompID,
				ResellerID: usersObj.DisID,
				UserID: usersObj.UserID,
				FastPaymentBankID: fastPaymentBankID,
				FastpayPrice: fastpayPrice,
				PrePrice: $('#wallet_pay_amount').val(),
				Prepassword: $('#payment_password').val(),
				ReceiptNo: paymentInfo.ReceiptNo,
				ShouXuFeiPrice: bankFee,
				sxfsqf: "-1"
			});

			postPay('Tx1375', tx1375, function(response) {
				if(response.Result === 'T') {
					//验证银行支付
					var json = JSON.stringify({
						PayNumb: response.PayNumb,
						PayID: response.PayID,
						PrepayID: response.PrepayID,
						FastPaymentBankID: response.FastPaymentBankID,
						ReceiptNo: paymentInfo.ReceiptNo,
						money: $('#amount_paid').val(),
						PrePrice: $('#wallet_pay_amount').val(),
						BankPrice: fastpayPrice,
						shouxufeiPrice: bankFee,
						BankName: $('#bankName').text()
					});

					window.location.href = 'order_pay_sms.html?random=' + Math.random() + "id=" + escape(json);
				} else {
					$.tips({
						content: response.Description,
						stayTime: 3000,
						type: "warn"
					})

				}

			});
		} else if(paymentType === '3') { // 微信支付
			// 公众号中支付
			if(is_weixin()) {
				// 从服务器获取AppID、AppSecret 
				var openID = localStorage.getItem('$wx_openid');
				var wxAmountPaid = $('#amount_paid').val();
				$('#loading').addClass('show');
				// 公众号内微信支付
				var txWxPayOrder = JSON.stringify({
					CompID: usersObj.CompID, // 核心企业ID
					ResellerID: usersObj.DisID, // 经销商ID
					UserID: usersObj.UserID, // 用户ID
					ReceiptNo: paymentInfo.ReceiptNo, // 订单号
					FastPaymentBankID: '', // 快捷支付ID
					PrePrice: '0', // 钱包金额
					FastpayPrice: wxAmountPaid, //微信 支付金额
					Prepassword: '',
					ShouXuFeiPrice: '0',
					sxfsqf: '0',
					openid: openID // 微信识别id
				});

				postPay('TxWxPayOrder', txWxPayOrder, function(response) {
					setTimeout(function() {
						$('#loading').removeClass('show');
					}, 200);
					if(response.Result === 'T') {
						// 调用微信公众号支付
						callWxPay(response.WxResult[0]);
					} else {
						$.tips({
							content: response.Description,
							stayTime: 3000,
							type: "warn"
						});
					}

				});

			} else {
				// 微信h5浏览器支付
				var txWxH5PayOrder = JSON.stringify({
					CompID: usersObj.CompID, // 核心企业ID
					ResellerID: usersObj.DisID, // 经销商ID
					UserID: usersObj.UserID, // 用户ID
					ReceiptNo: paymentInfo.ReceiptNo, // 订单号
					FastPaymentBankID: '', // 快捷支付ID
					PrePrice: '0', // 钱包金额
					FastpayPrice: wxAmountPaid, //微信 支付金额
					Prepassword: '',
					ShouXuFeiPrice: '0',
					sxfsqf: '0',
					wxIP: '', //IP

				});

				postPay('txWxH5PayOrder', txWxPayOrder, function(response) {
					setTimeout(function() {
						$('#loading').removeClass('show');
					}, 200);
					if(response.Result === 'T') {
						// 调用微信h5支付
						//						callWxPay(response.WxResult[0]);

					} else {
						$.tips({
							content: response.Description,
							stayTime: 3000,
							type: "warn"
						});
					}
				});
			}

		} else if(paymentType === '4') { // 微信+企业钱包支付
			if(is_weixin()) {
				// 从服务器获取AppID、AppSecret 
				var openID = localStorage.getItem('$wx_openid');
				var wxAmountPaid = parseFloat(paymentInfo.UnpaidAmount) - parseFloat($('#wallet_pay_amount').val());
				if(is_weixin()) {
					$('#loading').addClass('show');
					// 公众号内微信支付
					var txWxPayOrder = JSON.stringify({
						CompID: usersObj.CompID, // 核心企业ID
						ResellerID: usersObj.DisID, // 经销商ID
						UserID: usersObj.UserID, // 用户ID
						ReceiptNo: paymentInfo.ReceiptNo, // 订单号
						FastPaymentBankID: '', // 快捷支付ID
						PrePrice: $('#wallet_pay_amount').val(), // 钱包金额
						FastpayPrice: wxAmountPaid.toFixed(2), //微信 支付金额
						Prepassword: $('#payment_password').val(),
						ShouXuFeiPrice: '0',
						sxfsqf: '0',
						openid: openID // 微信识别id
					});
					
					postPay('TxWxPayOrder', txWxPayOrder, function(response) {
						setTimeout(function() {
							$('#loading').removeClass('show');
						}, 200);
						if(response.Result === 'T') {
							// 调用微信公众号支付
							callWxPay(response.WxResult[0]);
						} else {
							$.tips({
								content: response.Description,
								stayTime: 3000,
								type: "warn"
							});
						}

					});
				} else {
					$.tips({
						content: '请在公众号内使用微信支付',
						stayTime: 3000,
						type: "warn"
					});
				}
			} else {

			}

		}else if(paymentType === '5'){// 支付宝支付
			// 获取支付宝配置信息
			
			// 支付宝创建订单 支付
			
			//公共请求参数：
			// app_id	   String 支付宝分配给开发者的应用ID
			// method      String 接口名称
			// charset  	   String 请求使用的编码格式，如utf-8,gbk,gb2312等
			// sign_type   String 商户生成签名字符串所使用的签名算法类型，目前支持RSA2和RSA，推荐使用RSA2
			// sign        String 商户请求参数的签名串，详见签名
			// timestamp   String 发送请求的时间，格式"yyyy-MM-dd HH:mm:ss"
			// version     String 调用的接口版本，固定为：1.0
			// notify_url  String 支付宝服务器主动通知商户服务器里指定的页面http/https路径。
			// biz_content String 业务请求参数的集合，最大长度不限，除公共参数外所有请求参数都必须放在这个参数中传递，具体参照各产品快速接入文档
			
			//请求参数
			//
			
			// 支付宝h5支付 需要创建应用
		}else if(paymentType === '6'){// 线下收款
			window.location.href = 'order_down_panment.html?random=' + Math.random() + "&id=" + paymentInfo.ReceiptNo +"&amount_paid=" + $('#amount_paid').val();
		}
	});

	// 钱包支付
	//	$('#wallet_payment').on('click', function() {
	//		// 判断余额
	//		if(avaAmount === 0) {
	//			$.tips({
	//				content: '钱包可用余额不足',
	//				stayTime: 3000,
	//				type: "warn"
	//			})
	//			return;
	//		}
	//
	//		if(isWalletPayment) {
	//			$('#wallet_payment').removeClass('ok');
	//			isWalletPayment = false;
	//			$('.pay-fillIn').hide();
	//		} else {
	//			// 选择钱包支付
	//			if($('#amount_paid').val() < avaAmount) {
	//				$('#wallet_pay_amount').val($('#amount_paid').val());
	//			} else {
	//				$('#wallet_pay_amount').val(avaAmount);
	//			}
	//
	//			$('#wallet_payment').addClass('ok');
	//			isWalletPayment = true;
	//			$('.pay-fillIn').show();
	//		}
	//		setPaymentType();
	//	});

	// 快捷支付
	$('#quick_payment').on('click', function() {

		if(fastPaymentBankID === '') {
			$.tips({
				content: '未绑定快捷支付银行卡',
				stayTime: 3000,
				type: "warn"
			})
			return;
		}

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
	
	// 线下付款
	$('#down_payment').on('click',function(){
		if(isDownPayment){
			$('#down_payment').removeClass('ok');
			isDownPayment = false;
		} else {
			$('#wxPay').removeClass('ok');
			isWxPay = false;
			$('#quick_payment').removeClass('ok');
			
			$('#down_payment').addClass('ok');
			isDownPayment = true;
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

	// 获取快捷支付银行卡
	var GetFastpayBank = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		ResellerID: usersObj.DisID
	});

	postPay('GetFastpayBank', GetFastpayBank, function(response) {
		if(response.Result === 'T') {
			avaAmount = parseFloat(response.PrepayPrice);
			$('#ava_amount').text('可用余额' + avaAmount + '元');
			if(response.BankCardList.length === 0) {
				return;
			}
			//设置默认支付银行卡
			$('#bankName').text(response.BankCardList[0].BankName + '(尾号' + response.BankCardList[0].BankCode + ')');
			fastPaymentBankID = response.BankCardList[0].FastPaymentBankID;
		}
	});
});

/** 快捷支付获取续费 */
function getShouXuFei() {
	var bankAmount = '0';
	if(paymentType === '1') {
		//快捷支付
		bankAmount = $('#amount_paid').val();
	} else if(paymentType === '2') {
		bankAmount = $('#amount_paid').val() - $('#wallet_pay_amount').val();
	}
	var Getzfsxf = JSON.stringify({
		CompID: usersObj.CompID,
		price: bankAmount
	});

	postPay('Getzfsxf', Getzfsxf, function(response) {
		if(response.Result === 'T') {
			bankFee = response.ShouXuFeiPrice;
			$('#fee').text('￥' + bankFee);
		} else {
			$.tips({
				content: response.Description,
				stayTime: 3000,
				type: "warn"
			})
		}

	});
}

/** 
 * 支付方式 paymentType
 * 0:钱包支付 1:快捷支付 2:钱包+快捷支付 3：微信支付 4:微信+钱包支付 
 */
function setPaymentType() {
	if(isWalletPayment === true && isWxPay === true) {
		paymentType = '4';
	} else if(isquickPayment === true && isWalletPayment === true) {
		paymentType = '2';
		getShouXuFei();
	} else if(isWxPay === true) {
		paymentType = '3';
	} else if(isquickPayment === true) {
		paymentType = '1';
		getShouXuFei();
	} else if(isWalletPayment === true) {
		paymentType = '0';
	} else if(isDownPayment === true){
		paymentType = '6';
	}else{
		paymentType = '-1';
	}
}

/** 获取配置信息，设置当前支付显示隐藏 */
function init() {
	var GetAccount = JSON.stringify({
		ResellerID: usersObj.DisID
	});

	postPay('GetAccount', GetAccount, function(response) {
		if(response.Result === "T") {
			if(response.ResultCode) {
				$('#wechatPay').show();
			} else {
				$('#wechatPay').hide();
			}
		} else {
			$('#wechatPay').hide();
		}
	});
}

/** 重置钱包金额 */
function resetWA() {
	if($('#wallet_pay_amount').val() > parseFloat(avaAmount) || $('#wallet_pay_amount').val() > parseFloat($('#amount_paid').val())) {
		if(avaAmount > parseFloat($('#amount_paid').val())) {
			$('#wallet_pay_amount').val(parseFloat($('#amount_paid').val()));
		} else {
			$('#wallet_pay_amount').val(avaAmount);
		}
	}
	getShouXuFei();
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
				window.location.href = 'successful_pay.html?random=' + Math.random() + "id=" + paymentInfo.ReceiptNo;
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

/** 微信h5支付 */
var callWxH5Pay = function() {

}