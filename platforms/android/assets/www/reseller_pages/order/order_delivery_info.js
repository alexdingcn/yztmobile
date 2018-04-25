/**
 *  订单发货信息
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var orderDetail;
var usersObj;
var orderOutList;
var UnSendoutDetailList;
var orderDetailList;
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
	console.log(orderDetail)
	orderDetailList = orderDetail.OrderDetailList;
	orderOutList = orderDetail.OrderOutList;
	UnSendoutDetailList = orderDetail.UnSendoutDetailList;
	if(UnSendoutDetailList === null || UnSendoutDetailList.length === 0){
		$('#unSendoutDetailList').hide();
	}else{
		$('#unSendoutNum').text(UnSendoutDetailList.length + '种');
	}
//	if(orderDetailList.length == orderOutList.length) {
//		$('#unSendoutDetailList').hide();
//	} else {
//		var unSendLeng = orderDetailList.length - orderOutList.length;
//		$('#unSendoutNum').text(unSendLeng + '种');
//	}
	

	if(roleDetail === null || roleDetail === '')
		window.open('../../company_pages/login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#unSendoutDetailList').on('click', function() {
		window.location.href = 'order_unsendout_goods.html?' + Math.random();
	});
	//加载发货列表
	shipmentList();
}

/** 发货列表 */
function shipmentList() {
	var strbig = '';
	var itemTitle = '';
	var oState = '';
	var oBsolete = '';
	if(orderOutList !== null && orderOutList.length !== 0) {
		$.each(orderOutList, function(index, value) {
			//			oBsolete = '<div class="a2"><a class="o-btn" onclick="logisticsInfo(' + index + ')">物流信息</a></div>';
			oBsolete = '<div class="a2"><a ></a></div>';
			if(value.IsAudit === '3') {
				itemTitle = '<li class="li cancel">';
				oState = '已作废';
			} else if(value.IsSign === '0') {
				oState = '待收货';
				itemTitle = '<li class="li">';
				//				oBsolete = '<div class="a2"><a class="o-btn" onclick="logisticsInfo(' + index + ')">物流信息</a></div>';
				oBsolete = '<div class="a2"><a></a></div>';
			} else {
				itemTitle = '<li class="li">';
				oState = '已签收';
			}
			var ProductNum = '共' + value.Logistics.GoodsNum + '种商品';

			strbig += itemTitle +
				'<div class="title">' + value.OrderOutNo + '<i class="state">' + oState + '</i></div>' +
				'<div class="a1">' + ProductNum + '</div>' +
				'<div class="a1">' + value.SendDate + '</div></a>' +
				oBsolete +
				'</li>'

		});

		$('#orderOutList').append(strbig);
	}

}

/**
 * 物流信息
 */
function logisticsInfo(index) {
	window.location.href = 'order_logisticsInfo.html?' + Math.random();
}