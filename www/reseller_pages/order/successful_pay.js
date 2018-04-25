/**
 * 支付成功页面
 */
$(function() {
	FastClick.attach(document.body);
	var url = window.location.href; //URL地址
	var orderReceiptNo = url.split('id=')[1] || ""; //商品ID
	$('#detailsJump').on('click', function() {
		if(orderReceiptNo === '') {
			window.location.href = 'order_list.html?random=' + Math.random();
		}else{
			window.location.href = 'order_detail.html?random=' + Math.random() + "id=" + orderReceiptNo;
		}
	});
});