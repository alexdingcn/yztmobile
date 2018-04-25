var orderDetail;
window.onload = function(){
	init();
}

/**
 * 初始化
 */
function init(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$('#employ').hide();
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	console.log(orderDetail);
	//设置发票信息
	setFPInfo(orderDetail.Invoice.IsBill);
	//设置开票信息
	setKPInfo(orderDetail.Invoice.IsOBill);
	$('#orderInvoicingInfo').click(function(){
		window.location.href = 'order_invoicing_info.html?'+Math.random();
	});
	
	$('#orderInvoiceInfo').click(function(){
		window.location.href = 'order_invoice_info.html?'+Math.random();
	});
	
}

/**
 * 设置发票信息
 */
function setFPInfo(type){
	$('#fpInfo').text(type==='0'?'是否已开完: 否':orderDetail.Invoice.BillNo);
}

/**
 * 设置开票信息
 */
function setKPInfo(type){
	switch(type){
		case '0':
			$('#kpInfo').text('不开发票');
		break
		case '1':
			$('#kpInfo').text('普通发票');
		break
		case '2':
			$('#kpInfo').text('增值税发票');
		break
	}
}
