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
		var downPaystate = '';
		if(value.PreType === '1'){
			if(value.vedf9!==''){
				downPaystate = value.vedf9 === '1' ? '已确认&nbsp;' : '已作废&nbsp;'
			}else{
				downPaystate = '未确认&nbsp;'
			}
			
		}
		strbig+= '<li class="li">'+
		'<div class="title">'+ value.CompName +'<i class="fr bcolor">'+ value.PayLogType +'</i></div>'+
		'<div class="time gcolor9">'+ value.PayDate +'<i class="per fr">'+ PayAmount +'</i><i class="per fr">'+ downPaystate +'</i></div>'+
		'</li>'
	});

	
	$('#orderPaymentInfo').append(strbig);
}
