window.onload = function(){
	initPage();
	initData();
}

/**
 * 页面初始化
 */
function initPage(){
	$('#employ').hide();
	$('#o_v_btn_one').hide();
	$('#pop-btn').hide();
}

/**
 * 初始化数据
 */
function initData(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	console.log(orderDetail)
	//加载商品列表
	var strbig = '';
	$.each(orderDetail.OrderDetailList, function(index,value) {
		var imgurl = "../../images/pic.jpg";
		if(value.ProductPicUrlList.length > 0)
			imgurl = value.ProductPicUrlList[0].PicUrl
		strbig+= '<div class="li">' +
		'<div class="opt"><i class="i-circle ok"></i></div>'+
		'<div class="pic"><a href="商品详细.html"><img src='+ imgurl +'></a></div>'+
		'<div class="number">'+value.BarCode+ '<i class="mon">¥'+value.TinkerPrice+'</i></div>'+
		'<div class="title2">' + value.SKUName + '</div>'+
		'<div class="spec">' + value.ValueInfo + '<i class="size">X' + value.Num + '</i></div>'+
		'<div class="spec acolor">备注：' + value.Remark + '</div>'+
		'</div>'
			
	});
	$('#goods_list').append(strbig);
}
