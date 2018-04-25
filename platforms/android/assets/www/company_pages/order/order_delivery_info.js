/**
 *  订单发货信息
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var orderDetail;
var usersObj;
var orderOutList;
var UnSendoutDetailList;
window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	init();
}

function init() {
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#pop_invoice_void').hide();
//	$('#unSendoutDetailList').on('click',function(){
//		window.location.href = 'order_unsendout_goods.html?'+Math.random();
//	});
	$('#back').on('click',function(){
		window.location.href = 'order_detail.html?random=' + Math.random() + "&id=" + orderDetail.ReceiptNo;
	});
	//获取发货列表
	var SendGoodsInfo = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: orderDetail.CompID,
		OrderID: orderDetail.OrderID
	});

	post('GetOrderSendGoodsInfo', SendGoodsInfo, function(response) {
		if(response.Result === "T") {
			sessionStorage.setItem('$OrderSendGoodsInfo', JSON.stringify(response));
			orderOutList = response.OrderOutList;
			//加载发货列表
			shipmentList();
		} else {

		}
	});
}

/**
 * 发货列表
 */
function shipmentList() {
	var strbig = '';
	var itemTitle = '';
	var oState = '';
	var oBsolete = '';
	if(orderOutList !== null && orderOutList.length !== 0){
		$('#tips').css('display','none');
		$.each(orderOutList, function(index, value) {
//		oBsolete = '<div class="a2"><a class="o-btn" onclick="logisticsInfo(' + index + ')">物流信息</a></div>';
		oBsolete = '<div class="a2"></div>';
		if(value.IsAudit === '3') {
			itemTitle = '<li class="li cancel">';
			oState = '已作废';
		} else if(value.IsSign === '0') {
			oState = '待收货';
			itemTitle = '<li class="li">';
			oBsolete = '<div class="a2"><a class="g-btn" onclick="logisticsAside(' + index + ')">作废</a></div>';
//			oBsolete = '<div class="a2"><a class="g-btn" onclick="logisticsAside(' + index + ')">作废</a><a class="o-btn" onclick="logisticsInfo(' + index + ')">物流信息</a></div>';
		} else {
			itemTitle = '<li class="li">';
			oState = '已签收';
		}
		//	
		var ProductNum = '共' + value.Logistics.GoodsNum + '种商品';

		strbig += itemTitle +
			'<div class="title">' + value.OrderOutNo + '<i class="state">' + oState + '</i></div>' +
			'<div class="a1">' + ProductNum + '</div>' +
			'<div class="a1">' + value.SendDate + '</div></a>' +
			oBsolete +
			'</li>'

		});
	
		$('#orderOutList').append(strbig);
	}else{
		$('#tips').show();
	}
	
}

/**
 * 物流作废
 */
function logisticsAside(index) {
	$('#pop_invoice_void').show();
	$('#cancel').on('click', function() {
		$('#pop_invoice_void').hide();
	});

	$('#confirm').on('click', function() {
		var CancelOrderOut = JSON.stringify({
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			OrderID: orderOutList[index].OrderID,
			OrderOutID: orderOutList[index].OrderOutID,
			ts: orderOutList[index].ts
		});

		post('CancelOrderOut', CancelOrderOut, function(response) {
			if(response.Result === "T") {
				$('#pop_invoice_void').hide();
				window.location.reload();
			} else {

			}
		});

	});
}

/**
 * 物流信息
 */
function logisticsInfo(index) {
	window.location.href = 'order_logisticsInfo.html?'+Math.random();
}