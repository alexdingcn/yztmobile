/**
 *  收货地址
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var orderDetail;
var DisAddressList;
var usersObj;
window.onload = function(){
	init();
}

function init(){
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	//获取订单列表
	var getShippingAddress = JSON.stringify({
			CompanyID: orderDetail.CompID,
			ResellerID:orderDetail.DisID,
			UserID:usersObj.UserID
		});
		
		post('GetResellerShippingAddressList', getShippingAddress, function(response) {
			if(response.Result === "T") {
				DisAddressList = response.DisAddressList;
				initAddressList();
			} else {

			}
		});
}

function initAddressList(){
	var strbig = '';
	$.each(DisAddressList, function(index,value) {
//		IsDefault = value.IsDefault==='1' ? '[默认]':'';
		strbig+= '<li class="li" onclick="selectaddr(this,'+index+')"><a href="javascript:;">'+
		'<div class="name">'+value.Principal+'<div class="fl">'+ value.Phone +'</div></div>'+
		'<div class="addr"><i class="selectAddr rcolor"></i>'+ value.Address +'</div>'+
		'</a></li>'
		
		
	});

	
	$('#address_list').append(strbig);
}

function selectaddr(th,val){
	$('#address_list').find("i.selectAddr").html("");//清空默认选中地址
	$(th).find("i.selectAddr").html("[选中]");
	orderDetail.	Address = DisAddressList[val].Address;
	sessionStorage.setItem('$order_info', JSON.stringify(orderDetail));
}
