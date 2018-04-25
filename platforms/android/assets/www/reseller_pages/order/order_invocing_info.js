/**
 *  经销商发票信息
 * 	@author wyf
 *  @time 2017/08/16
 */
window.onload=function(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var order_info=sessionStorage.getItem('$order_info');
	var order_invoice=JSON.parse(order_info).Invoice;
	showOrderInvoice(order_invoice);
}

//展示发票信息
function showOrderInvoice(data){
	if(data.IsOBill==1){
		$(".plain .w-box").eq(0).val(data.Rise);
		$(".plain .w-box").eq(1).val(data.Content);
		$('.o-billing .li').eq(1).addClass('none');
	}else if(data.IsOBill==2){
		$('.o-billing .li').eq(0).addClass('none');
		$('.vadd').removeClass('none');
		$('.plain').addClass('none');
		$('.vadd .w-box').eq(0).val(data.Rise);
		$('.vadd .w-box').eq(1).val(data.Content);
		$('.vadd .w-box').eq(2).val(data.OBank);
		$('.vadd .w-box').eq(3).val(data.OAccount);
		$('.vadd .w-box').eq(4).val(data.TRNumber);
		
	}
}


