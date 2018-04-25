/**
 *  经销商收货地址
 * 	@author hxbnzy
 *  @time 2017/08/11
 */
var usersObj;
window.onload = function() {
	init();
}

function init() {
	
if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	//获取地址列表
	var addressListRequest = JSON.stringify({
		UserID: usersObj.UserID,
		ResellerID: usersObj.DisID,
		CompanyID: '',
	});

	post('GetResellerShippingAddressList', addressListRequest, function(response) {
		if(response.Result === "T") {
			initAddressList(response.DisAddressList)
		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					console.log('close');
				}
			});
		}
	});
}

function initAddressList(disAddressList) {
	var strbig = '';
	$.each(disAddressList, function(index, value) {
		var Default = value.IsDefault === '1' ? '[默认]' : '';
		strbig += '<li class="li">' +
			'<div class="name">' + value.Principal + '<div class="fl">' + value.Phone + '</div></div>' +
			'<div class="addr"><i class="rcolor">' + Default + '</i>'+ value.Address +'</div>' +
			'</li>'
	});

	$('#address_list').append(strbig);
}