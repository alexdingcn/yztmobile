
/**
 *  待发货商品
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var OrderSendGoodsInfo;
var UnSendoutDetailList;
var IsAllChecked = false; //默认不全选

window.onload = function() {
	init();
}

function init() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	OrderSendGoodsInfo = JSON.parse(sessionStorage.getItem('$order_info'));
	UnSendoutDetailList = OrderSendGoodsInfo.UnSendoutDetailList;
	var len = UnSendoutDetailList.length;i = 0;
	for(; i < len;) {
		var obj = UnSendoutDetailList[i];
		obj["IsChecked"] = '0';
		obj["DeliverGoods"] = UnSendoutDetailList[i].UnOutNum;
		i++;
	}
	//待发货列表
	var strbig = '';
	$.each(UnSendoutDetailList, function(index, value) {
		strbig += '<div class="li">' +
			'<div class="opt"><i  onclick="select(this,' + index + ')"></i></div><a>' +
			'<div class="pic"><img src="images/pic.jpg"></div>' +
			'<div class="number">' + value.OrderOutDetailInfo.ProductCode + '</div>' +
			'<div class="title2">' + value.OrderOutDetailInfo.ProductName + '</div>' +
			'<div class="spec">' + value.OrderOutDetailInfo.Unit + '</div>' +
			'<div class="spec">待发货数量 ' + value.UnOutNum + '</div>' +
			'<div class="acolor"></div></a>' +
			'<div class="wait">' +
//			'<i class="a1">' + "待发货数量" + value.UnOutNum + '</i>' +
//			'<i class="a2">本次发货</i><div class="numbe small "><a class="minus" onclick ="minusEvent(this,' + index + ')"></a><input name="" type="text" class="box txtnum" value="' + value.UnOutNum + '" ><a  class="add" onclick="plusEvent(this,' + index + ')"></a></div>' +
			'</div>' +
			'</div>'
	});

	$('#unSendoutDetailList').append(strbig);
	//确定发货
//	$('#confirm').on('click', function() {
//		var isDelivery = false;
//		var i = 0;len<UnSendoutDetailList.length;
//		for(;i<len;){
//			if(UnSendoutDetailList[i].IsChecked==='1'){
//				
//				isDelivery = true;
//				break;
//			}
//			i++;
//		}
//		
//		if(isDelivery){
//			OrderSendGoodsInfo.UnSendoutDetailList = UnSendoutDetailList;
//			sessionStorage.setItem('$OrderSendGoodsInfo', JSON.stringify(OrderSendGoodsInfo));
//			window.location.href = 'order_logistics_editor.html';
//		}else{
//			
//		}
//		
//	});
	//全选
//	$('#isAllChecked').on('click',function(){
//		selectAll();
//	});
}
/**
 * 全选
 */
//function selectAll() {
//	if(IsAllChecked) {
//		IsAllChecked = false;
//		
//		$("#unSendoutDetailList").find(".opt i").removeClass("ok");
//		$('#isAllChecked').removeClass('ok');
//	} else {
//		IsAllChecked = true;
//		$("#unSendoutDetailList").find(".opt i").addClass("ok");
//		$('#isAllChecked').addClass('ok');
//	}
//	var i = 0; len = UnSendoutDetailList.length;
//	for(;i<len;){
//		UnSendoutDetailList[i].IsChecked = IsAllChecked ===true ? '1':'0';
//		i++;
//	}
//}

/**
 * 单选
 * @param {Object} th
 * @param {Object} index
 */
function select(th, index) {
	if(UnSendoutDetailList[index].IsChecked === '0') {
		$(th).addClass('ok');
		UnSendoutDetailList[index].IsChecked = '1';
	} else {
		$(th).removeClass('ok');
		UnSendoutDetailList[index].IsChecked = '0';
	}
}

function minusEvent(th,index) {
	var num= parseInt($(th).next(".txtnum").val());
	if(num===1){
		$(th).next(".txtnum").val(num);
	}else{
		$(th).next(".txtnum").val(num-1);
		
	}
	UnSendoutDetailList[index].DeliverGoods = num;
	
}

function plusEvent(th,index) {
	var num= parseInt($(th).prev(".txtnum").val()); 
	if(num>=UnSendoutDetailList[index].UnOutNum){
		$(th).prev(".txtnum").val(UnSendoutDetailList[index].UnOutNum);
	}else{
		$(th).prev(".txtnum").val(num+1);
	}
	UnSendoutDetailList[index].DeliverGoods = num;
}