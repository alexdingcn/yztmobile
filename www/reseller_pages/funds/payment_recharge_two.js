/**
 *  经销商 - 预付款充值支付
 * 	@author hxbnzy
 *  @time 2017/08/14
 */
var rechargeAmount; //充值金额
var fee = ''; //手续费
var feeType = '';
var fastPaymentBankID = ''; //快捷支付银行卡id
var usersObj;
var bankCardList;
var bankName;

window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	var url = window.location.href; //URL地址
	rechargeAmount = url.split('=')[1] || ""; //商品ID
	$('#recharge_Amount').text('¥' + rechargeAmount);
	//快捷支付获取手续费
	var GetShouXuFei = JSON.stringify({
		CompID: usersObj.CompID,
		price: rechargeAmount
	});
	$('#confirm').on('click', function() {
		if(fastPaymentBankID === '') {

			weui.topTips('请选择快捷支付银行卡', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}
		if(fee === '') {
			weui.topTips('支付手续费获取失败', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			return;
		}
		confirm();
	});

	postPay('Getzfsxf', GetShouXuFei, function(response) {
		if(response.Result === "T") {
			fee = response.ShouXuFeiPrice;
			feeType = response.sxfsqf;
			$('#fee').text('¥' + fee);
			$('#amount_paid').text('¥' + (parseInt(rechargeAmount) + parseInt(fee)));
		} else {
			weui.topTips('手续费计算失败', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			//确认支付按钮设置无法点击
		}
	});

	//获取快捷支付 银行卡列表
	var GetFastpayBank = JSON.stringify({
		CompID: usersObj.CompID,
		ResellerID: usersObj.DisID,
		UserID: usersObj.UserID
	});
	postPay('GetFastpayBank', GetFastpayBank, function(response) {
		if(response.Result === "T") {
			var strbig = '';
			bankCardList = response.BankCardList;
			var i = 0;
			len = bankCardList.length;
			if(bankCardList === null || bankCardList.length === 0) {
				weui.topTips('未绑定快捷支付银行卡，请先绑定支付银行卡!', {
					duration: 3000,
					className: "custom-classname",
					callback: function() {
						console.log('close');
					}
				});
				return;
			}
			$.each(response.BankCardList, function(index, value) {
				var bankCard = value.BankName + '  尾号' + '(' + value.BankCode + ')'
				strbig += '<li class="li"><i class="i-circle" onclick="selectBank(this,' + index + ')"></i><i class="b1">快捷支付</i><i class="b2">' + bankCard + '</i><i class="i-arrow"></i></li>'
			})
			$('#bankCardList').append(strbig);
		} else {
			weui.topTips('快捷支付银行卡获取失败', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
			//确认支付按钮设置无法点击
		}
	});
}

function confirm() {

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
			var json = JSON.stringify({
				payid: response.payid,
				paypreid: response.prepayid,
				hidFastPay: response.hidFastPay,
				ShouXuFeiPrice: fee,
				price: rechargeAmount,
				bankName: bankName,

			});
			window.location.href = 'payment_sms.html?id=' + escape(json);
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

function selectBank(th, index) {
	fastPaymentBankID = bankCardList[index].FastPaymentBankID;
	bankName = bankCardList[index].BankName + '  尾号' + '(' + bankCardList[index].BankCode + ')'
	$('#bankCardList').find('i').removeClass('ok');
	$(th).addClass('ok');
}