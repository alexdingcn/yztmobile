var orderReceiptNo;
$(function() {
	orderReceiptNo = url.split('id=')[1] || ""; //商品ID
	$('#return').on('click',function(){
		window.location.href = 'order_detail.html?random=' + Math.random() + "id=" + orderReceiptNo;
	});
});