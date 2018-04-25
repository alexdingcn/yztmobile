/**
 *  订单详情页面
 * 	@author wyf
 *  @time 2017/08/15
 */
var orderDetail; //订单详情
var rebateInfo = null; //返利信息
var usersObj; //用户信息
var selectDateDom = $('#selectDate');
var yearData;
var monthData;
var dateData;
var orderReceiptNo;

window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var url = window.location.href; //URL地址
	orderReceiptNo = url.split('id=')[1] || ""; //商品ID
	if(orderReceiptNo === '') {
		orderReceiptNo = sessionStorage.getItem('$receiptNo');
	} else {
		sessionStorage.setItem('$receiptNo', orderReceiptNo);
	}
	var roleDetail = localStorage.getItem('$login_role') || "";
	usersObj = JSON.parse(roleDetail);
	initPageData();

	$('#back').click(function() {
		window.location.href = "order_list.html?" + Math.random();
	});

	$('#orderGoodsInfo').click(function() {
		window.location.href = "order_goods_info.html?" + Math.random();
	});
	//查看付款信息
	$('#payment_info').on('click', function() {
		window.location.href = "order_payment_info.html?" + Math.random();
	})
}

/**
 * 初始化页面数据
 */
function initPageData() {
	$('#pop_order_remark').hide();
	$('#pop_post_fee').hide();
	//	$('#pop_order_rebate').hide();
	$('#pop_order_disuse').hide();
	//	plus.nativeUI.closeWaiting();//关闭系统等待对话框
	//获取核心企业图标统计
	var CompySta = JSON.stringify({
		ResellerID: usersObj.DisID,
		CreateDate: '',
		Phone: '',
		ReceiptNo: orderReceiptNo,
		UserID: usersObj.UserID
	});

	post('GetResellerOrderDetail', CompySta, function(response) {
		if(response.Result === "T") {
			$('#good-li').show();
			orderDetail = response.Order;
			//			console.log(orderDetail.AuditTotalAmount,orderDetail.PayedAmount)
			if(orderDetail.AuditTotalAmount == orderDetail.PayedAmount) {
				$('#disuse_check').hide();
			}
			console.log(response.Order)
			//将当前订单临时保存
			sessionStorage.setItem('$order_info', JSON.stringify(response.Order));
			//获取可用最大返利
			getRebateSum();
			//设置数据
			setData(orderDetail);
			//根据Ostate设置显示页面
			setLayout(orderDetail.Ostate);
			//			orderEditorBindEvents();
			//			initPop();
		} else {

		}
	});

}

/** 获取订单可用返利 */
function getRebateSum() {
	//获取经销商可用返利
	var RebateRequest = JSON.stringify({
		ResellerID: orderDetail.DisID,
		OrderID: orderDetail.OrderID,
	});
	post('GetRebate', RebateRequest, function(response) {
		if(response.Result === "T") {
			rebateInfo = response;
			//设置返利弹出框 返利总金额
			$('#available_rebates').text('¥' + rebateInfo.RebateSum);

		} else {

		}
	});
}

/**
 * 修改返利、运费
 * 重新计算应付总额
 * 订单价格
 * 应付 = 总额 - 促销优惠 - 返利 + 运费
 */
function BuildPrice() {
	var discount_amount = orderDetail.ProInfo.OrderPrice === '' ? '0' : orderDetail.ProInfo.OrderPrice;
	orderDetail.AuditTotalAmount = parseFloat(orderDetail.TotalAmount) - parseFloat(discount_amount) - parseFloat(orderDetail.Rebate) + parseFloat(orderDetail.PostFee);
	//  console.log('价格为'+orderDetail.AuditTotalAmount);
	//刷新页面价格
	$('#total_amount').text('￥' + orderDetail.TotalAmount); //商品总额
	$('#discount_amount').text('￥' + discount_amount); //促销优惠
	//	$('#order_rebate').text('￥' + orderDetail.Rebate); //返利抵扣
	$('#post_fee').text('￥' + orderDetail.PostFee); //运费
	$('#audit_total_amount').text('￥' + orderDetail.AuditTotalAmount); //应付总额
	$('#postfee').text('￥' + orderDetail.PostFee); //弹窗运费
	$('#this_rebate').text('￥' + orderDetail.Rebate); //弹窗返利

	sessionStorage.setItem('$order_info', orderDetail); //更新本地保存订单内容

}

/** 订单未审核 绑定/取消 事件 */
function orderEditorBindEvents(isBindEditorEvents) {
	if(isBindEditorEvents) {

	} else {
		//		$("#order_rebate").unbind('click');
		$("#li_arriveDate").unbind('click');
		$('#invoice_modif').unbind('click');
	}

}

/** 设置数据 */
function setData(orderDetail) {
	$('#productNum').text(orderDetail.OrderDetailList.length + '种'); //设置商品种类数
	$('#receiptNo').text(orderDetail.ReceiptNo); //订单编号
	$('#compName').text(orderDetail.CompName); //公司信息
	$('#createDate').text(orderDetail.CreateDate); //订单创建日期
	$('#showDate').text(orderDetail.ArriveDate); //交货日期
	$('#giveMode').text(orderDetail.GiveMode); //配送方式
	$('#order_remark').text(orderDetail.OrderRemark); //订单备注
	$('#address').text(orderDetail.Address); //收货地址
	var isOrderOut = orderDetail.OrderOutList;
	var orderDetaLst = orderDetail.OrderDetailList;
	//	if(orderDetail.IsOutState){
	//		
	//	}
	switch(orderDetail.IsOutState) {
		case '1': //部分发货
			$('#delivery_info .i-arrow').html("部分发货");
			break;
		case '2': //部分到货
			$('#delivery_info .i-arrow').html("部分到货");
			break;
		case '3': //全部发货
			$('#delivery_info .i-arrow').html("全部发货");
			break;
		case '4': //全部到货
			$('#delivery_info .i-arrow').html("全部到货");
			break;
	}

	$('#delivery_info').on('click', function() {
		window.location.href = "order_delivery_info.html?" + Math.random();
	})
	//	if(isOrderOut==null || isOrderOut.length==0){
	//		$('#delivery_info .info').html("未发货");
	//		$('.infod').css({
	//				padding:0
	//			})
	//	}else{
	//		if(isOrderOut.length==orderDetaLst.length){
	//			$('#delivery_info .i-arrow').html("全部发货");
	//			
	//		}else{
	//			$('#delivery_info .i-arrow').html("部分发货");
	//		}
	//		$('#delivery_info').on('click',function(){
	//			window.location.href="order_delivery_info.html?"+Math.random();
	//		})
	//	}
	switch(orderDetail.Invoice.IsOBill) {
		case "0":
			$('#invoicing').text('不开发票')
			$('.jiantou').removeClass('i-arrow');
			$('.infop').css({
				padding: 0
			})
			break;
		case "1":
			$('#invoicing').text('普通发票');
			$('.infop').css({
				padding: 0
			})
			$('.invoiceinfo').css({
				'padding-right': '20px'
			})
			$('#li_invoicing').on('click', function() {
				window.location.href = 'order_billinfo.html?' + Math.random();
			});
			break;
		case "2":
			$('#invoicing').text('增值税发票');
			$('.infop').css({
				padding: 0
			})
			$('.invoiceinfo').css({
				'padding-right': '20px'
			})
			$('#li_invoicing').on('click', function() {
				window.location.href = 'order_billinfo.html?' + Math.random();
			});
			break;
	}

	if(orderDetail.Invoice.IsOBill === '0') { //未完成
		$('#invoice').text('是否已开完: 否');
	} else {
		$('#invoice').text('票号:' + orderDetail.Invoice.BillNo + "     是否已开完: 是");
	}
	$('#total_amount').text('￥' + orderDetail.TotalAmount); //商品总额
	var discount_amount = orderDetail.ProInfo.OrderPrice === '' ? '0.00' : orderDetail.ProInfo.OrderPrice;
	$('#discount_amount').text('￥' + discount_amount); //促销优惠
	//	$('#order_rebate').text('￥' + orderDetail.Rebate); //返利抵扣
	$('#this_rebate').text('￥' + orderDetail.Rebate); //弹窗返利
	$('#post_fee').text('￥' + orderDetail.PostFee); //运费
	$('#postfee').text('￥' + orderDetail.PostFee); //弹窗运费
	$('#audit_total_amount').text('￥' + orderDetail.AuditTotalAmount); //应付总额
	$('#order_remark').text(orderDetail.OrderRemark); //订单备注
	$('#order_remark_content').text(orderDetail.OrderRemark); //输入框订单备注
	// 设置商品列表
	var strbig = "";
	//	var value=orderDetail.OrderDetailList;
	//	$("#goods_list").html("");
	// 遍历商品  追加到列表
	$.each(orderDetail.OrderDetailList, function(n, value) {
		var imgurl = "../../images/pic.jpg";
		if(value.ProductPicUrlList.length > 0)
			imgurl = value.ProductPicUrlList[0].PicUrl
		strbig += '<div class="li">' +
			'<div class="opt"><i class="i-circle ok"></i></div>' +
			'<div class=pic><a><img src=' + imgurl + '></a></div>' +
			'<div class=number>' + value.BarCode + '<i class=mon></i></div>' +
			//'<div class=number>' + value.BarCode + '<i class=mon>' + value.Inventory + '</i></div>' +
			'<div class=title2>' + value.SKUName + '</div>' +
			'<div class=spec>' + value.ValueInfo + '<i class=size>X' + value.Num + '</i></div>' +
			'<div class=spec acolor>备注:' + value.Remark + '</div>' +
			'</div>'
	});
	//	for(var i=0;i<value.length;i++){
	//		var imgurl = value[i].ProductPicUrlList.length > 0?value[i].ProductPicUrlList[0].PicUrl:"../../images/pic.jpg";
	//		if(value[i].ProductPicUrlList.length > 0){
	//			imgurl = value[i].ProductPicUrlList[0].PicUrl
	//		strbig += '<div class="li">' +
	//			'<div class="opt"><i class="i-circle ok"></i></div>' +
	//			'<div class=pic><a><img src=' + imgurl + '></a></div>' +
	//			'<div class=number>' + value[i].BarCode + '<i class=mon>' + value[i].Inventory + '</i></div>' +
	//			'<div class=title2>' + value[i].SKUName + '</div>' +
	//			'<div class=spec>' + value[i].ValueInfo + '<i class=size>X' + value[i].Num + '</i></div>' +
	//			'<div class=spec acolor>备注:' + value[i].Remark + '</div>' +
	//			'</div>'
	//		}
	//		if(i==1){
	//			break;
	//		}
	//	}
	$("#goods_list").append(strbig);
	$('#order_check').click(function() {
		var paymentInfo = {
			UnpaidAmount: (parseFloat(orderDetail.AuditTotalAmount) * 100000 - parseFloat(orderDetail.PayedAmount) * 100000) / 100000, //未支付金额
			TotalAmount: orderDetail.AuditTotalAmount, //订单总金额
			PaidAmount: orderDetail.PayedAmount, //已支付金额
			ReceiptNo: orderDetail.ReceiptNo, //订单号

		}
		window.location.href = 'order_pay.html?random=' + Math.random() + "payment_info=" + escape(JSON.stringify(paymentInfo));
	});
}

/** Ostate 设置当前页面 */
function setLayout(Ostate) {
	switch(Ostate) {
		case '1':
			$("#ostate").text('待审核');
			$("#ui_delivery").hide();
			$("#ui_payment").hide();
			$('#disuse_check').hide();
			break;
		case '2': //已审核
			$('#ostate').text('待发货');
			$("#ui_delivery").hide();
			//			$("#ui_payment").hide();
			break;
		case '3': //退货处理
			$("#ostate").text('退货处理');
			break;
		case '4':
			$('#ostate').text('已发货');
			break;
		case '5':
			$('#ostate').text('已完成');
			break;
		case '6':
			$('#ostate').text('已作废');
			$("#disuse_check").hide();
			break;
		case '7': //已退货
			$('#ostate').text('已退货');
			$("#disuse_check").hide();
			break;
	}
}