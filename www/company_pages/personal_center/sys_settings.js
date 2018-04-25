/**
 *  核心企业修改系统设置
 * 	@author wyf
 *  @time 2017/08/10
 */
var usersObj;
var payW; //支付方式
var resel; //是否启用经销商加盟审核
var rebate; //是否启用反利
var inv; //是否启用商品库存
window.onload = function() {
	
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
	usersObj = JSON.parse(roleDetail);
	initData(usersObj);

	$('.sys-pay li').on("click", function() {
		$(this).children(".i-circle").addClass('ok');
		$(this).siblings().children(".i-circle").removeClass('ok');
		payW = $(this).children(".i-circle").attr("name");
	})
	$(".sys-li .opt-circle").on("click", function() {
		var isname = $(this).attr("name");
		if(isname == 0) {
			$(this).attr("name", 1)
			$(this).addClass("bule");
		} else {
			$(this).attr("name", 0)
			$(this).removeClass("bule");
		}
	})
	//点击保存
	$(".back-ri").on("click", function() {
		resel = $(".isres").attr("name");
		rebate = $(".isreb").attr("name");
		inv = $(".isinv").attr("name");
		saveSet(usersObj);
	})
}
/*获取系统设置信息*/
function initData(usersObj) {
	/*发送数据请求*/
	var OrderPrompt = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID
	});
	post('GetCompanyInfo', OrderPrompt, function(response) {
		
		if(response.Result === "T") {
			console.log(response.SysSettings);
			var sysSet = response.SysSettings;
			showInfo(sysSet);
			payW = sysSet.PayWay;
		} else {

		}
	})
}
//把获取到的数据展示到页面中
function showInfo(sysSetting) {
	if(sysSetting.PayWay == 1) {
		$('.sys-pay .i-circle').eq(0).removeClass('ok');
		$('.sys-pay .i-circle').eq(1).addClass('ok');
	} else if(sysSetting.PayWay == 0) {
		$('.sys-pay .i-circle').eq(1).removeClass('ok');
		$('.sys-pay .i-circle').eq(0).addClass('ok');
	}
	if(sysSetting.IsRebate == 1) {
		$('.sys-li .isreb').addClass('bule');
		$('.sys-li .isreb').attr("name", 1);
	} else {
		$('.sys-li .isreb').removeClass('bule');
		$('.sys-li .isreb').attr("name", 0);
	}
	if(sysSetting.IsReseller == 1) {
		$('.sys-li .isres').addClass('bule');
		$('.sys-li .isres').attr("name", 1);
	} else {
		$('.sys-li .isres').removeClass('bule');
		$('.sys-li .isres').attr("name", 0);
	}
	if(sysSetting.IsInv == 1) {
		$('.sys-li .isinv').addClass('bule');
		$('.sys-li .isinv').attr("name", 1);

	} else {
		$('.sys-li .isinv').removeClass('bule');
		$('.sys-li .isinv').attr("name", 0);
	}
}

//保存设置
function saveSet(usersObj) {
	
	var saveSetSetting = JSON.stringify({
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		SysSettings: {
			IsInv: inv,
			IsReseller: resel,
			IsRebate: rebate,
			PayWay: payW
		}
	});
	post('EditCompanySysSettings', saveSetSetting, function(response) {
		var el;
		$.tips({
			content: response.Description,
			stayTime: 2000,
			type: response.Result === 'T' ? 'success' : 'warn'
		})
	})

}