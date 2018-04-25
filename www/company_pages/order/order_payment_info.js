/**
 *  订单收款信息
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var orderDetail;
window.onload = function(){
	init();
}

function init(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	$('#offLineReceipt').hide();
	$('#totalAmount').text('¥'+orderDetail.AuditTotalAmount);
	$('#paid').text('已收款：¥'+orderDetail.PayedAmount);
	
	var strbig = '';
	$.each(orderDetail.PayLogList, function(index,value) {
		var PayAmount = '¥'+value.PayAmount;
		strbig+= '<li class="li">'+
		'<div class="title">'+ value.Guid +'<i class="fr bcolor">'+ value.PayLogType +'</i></div>'+
		'<div class="time gcolor9">'+ value.PayDate +'<i class="per fr">'+ PayAmount +'</i></div>'+
		'</li>'
	});

	
	$('#orderPaymentInfo').append(strbig);
}
