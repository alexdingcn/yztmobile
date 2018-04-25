/**
 *  经销商资金列表
 * 	@author hxbnzy
 *  @time 2017/08/14
 */
var usersObj;
var getType = '1'; //0 下拉刷新 1 加载更多
var PrepayList; //预付款列表\
var rows = '10';

$(function() {
	var tabs = $('#tabs a');
	nextResellerToPage(tabs, '3');
	FastClick.attach(document.body);
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$(window).bind("scroll", LoadPrepayData); //绑定下拉事件
	$('#rebate_ul').hide();
	$(document).on('click', '#advance_payment', function() {
			$('#rebate').find('div').removeClass('cur');
			$('#advance_payment').find('div').addClass('cur');
			$('#paymentRecharge').show();
			$('#prepay_ul').show();
			$('#rebate_ul').hide();

		})
		.on('click', '#rebate', function() {
			$('#advance_payment').find('div').removeClass('cur');
			$('#rebate').find('div').addClass('cur');
			$('#paymentRecharge').hide();
			$('#prepay_ul').hide();
			$('#rebate_ul').show();
		});
	DataPrepayBind();
	DataRebateBind();
});

function LoadPrepayData() {
	var scrollTop = parseInt($(document).scrollTop()); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		setTimeout(function() {
			DataPrepayBind(); //下拉加载
		}, 1000);
	}
}

function DataRebateBind() {
	var RebateCriticalOrderID = $("#RebateCriticalOrderID").val(); //当前列表最临界点订单ID
	var GetRebate = JSON.stringify({
		OrderID: '',
		ResellerID: usersObj.DisID
	});

	post('GetRebate', GetRebate, function(response) {
		if(response.Result == "T") {
			$('#Rebate').text('¥' + response.RebateSum);
			var str = '';
			$.each(response.RebateList, function(index, value) {
				if(index == response.RebateList.length - 1)
					$("#RebateCriticalOrderID").val(value.RebateNo) //记录当前列表最临界点订单ID
				var rebateType;
				switch(value.RebateType) {
					case '0':
						rebateType = '整单、分摊返利'
						break;
					case '1':
						rebateType = '整单返利'
						break;
					case '2':
						rebateType = '分摊返利'
						break;
				}
				str += '<li class="li"><div class="">' + rebateType + '</div><div class="">' + value.StartDate + '</div><div class="size">¥' + value.RebateMoney + '</div></li>'
			});

			$('#RebateList').append(str);
		} else if(response.Result == "F" && response.Description == "没有更多数据") {

		} else {

		}

	});

};

function DataPrepayBind() {
	var PrepayCriticalOrderID = $("#PrepayCriticalOrderID").val(); //当前列表最临界点订单ID
	//获取预付款列表
	var GetPrepay = JSON.stringify({
		CompID: usersObj.CompID,
		CriticalProductID: PrepayCriticalOrderID,
		ResellerID: usersObj.DisID,
		UserID: usersObj.UserID,
		getType: getType,
		rows: rows,
		sort: '0'
	});

	postPay('GetPrepay', GetPrepay, function(response) {
		if(response.Result == "T") {
			$('#advancePayment').text('¥' + response.Price);
			var html = "";
			//遍历经销商   追加到列表
			$.each(response.PrepayList, function(index, item) {
				if(index == response.PrepayList.length - 1)
					$("#PrepayCriticalOrderID").val(item.ID) // 记录当前列表最临界点订单ID

				html += '<li class="li"><div class="">' + item.PreType + '</div><div class="">' + item.CreatDate + '</div><div class="size">¥' + item.price + '</div></li>'

			})
			$("#PrepayList").append(html)
			$(window).bind("scroll", LoadPrepayData); // 重新绑定下拉事件
		} else if(response.Result == "F" && response.Description == "没有更多数据") {
			$("#footer").html("已经加载完毕");
		} else {
			$("#footer").children("span:eq(0)").hide().next().html("加载数据失败");
			setTimeout(function() {
				$("#footer").hide();
				setTimeout(function() {
					$(window).bind("scroll", LoadPrepayData);
				}, 15);
			}, 1500);
		}

	});

}