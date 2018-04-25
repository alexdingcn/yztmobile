var resellerID = '0'; //全部
var orderState = '-2'; //订单状态
var payState = '-1'; //支付状态
var selectObj = null;
$(function() {
	FastClick.attach(document.body);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	initSelect(); // 初始化筛选条件
	//	GetResellerList(); //初次加载(经销商列表)
	getDatatime();

	$('#pay_state').click(function() {
		weui.picker([{
			label: '全部',
			value: '-1'
		}, {
			label: '未支付',
			value: '0'
		}, {
			label: '部分支付',
			value: '1'
		}, {
			label: '已支付',
			value: '2'
		}
//		{
//			label: '申请退款',
//			value: '4'
//		}, 
//		{
//			label: '已退款',
//			value: '5'
//		}
		], {
			defaultValue: [selectObj == null ? '-1' : selectObj.PayState],
			className: 'custom-paystate',
			onChange: function(result) {

			},
			onConfirm: function(result) {
				$('#txtPayState').text(result[0].label);
				payState = result[0].value;
			},
			id: 'picker'
		});
	});

	$('#order_state').click(function() {
		weui.picker([{
				label: '全部',
				value: '-2'
			}, {
				label: '待审核',
				value: '1'
			},
			{
				label: '待发货',
				value: '2'
			},
			//		{
			//			label: '待退货',
			//			value: '3'
			//		}, 
			{
				label: '已完成',
				value: '5'
			}, {
				label: '已作废',
				value: '6'
			}
		], {
			//			defaultValue: [selectObj == null?'-2':selectObj.OrderState],
			defaultValue: [selectObj == null ? '-2' : selectObj.OrderState],
			className: 'custom-prderstate',
			onChange: function(result) {

			},
			onConfirm: function(result) {
				$('#txtOrderState').text(result[0].label);
				orderState = result[0].value;
			},
			id: 'picker'
		});

	});

	// 选择事件
	$(document).on("click", ".li-circle", function() {
		$(this).siblings().find("i").removeClass("ok")
		$(this).find("i").addClass("ok")
		var pid = $(this).parents(".goods-spec").attr("id")
		var id = pid.split('-')[0]
		var text = $(this).text();
		var value = $(this).attr("id").split('-')[1]
		$("#" + id + "").find(".info").text(text)
		$("#" + id + "").attr("value", value)
		$(this).parents(".goods-spec").prop("style", "display:none")
	});

	// 搜索条件单机事件
	$("#titlediv li").on('click', function() {
		var id = $(this).attr("id") + "-List";
		$("#" + id + "").prop("style", "display:block")
	});

	// 关闭事件
	$(".pop-close").on('click', function() {
		$(this).parents(".goods-spec").prop("style", "display:none")
	});

	// 确认按钮单机事件
	$(".zbtn").on('click', function() {
		// 保存到本地
		var selectObj = {
			OrderState: orderState,
			PayState: payState,
			ResellerID: resellerID,
			ResellerName: $('#txtreseller').text(),
			CreateDate: $("#txtCreateDate").text() == "" ? "-1" : $("#txtCreateDate").text(),
			EndeDate: $("#txtEndeDate").text() == "" ? "-1" : $("#txtEndeDate").text()
		}

		sessionStorage.setItem('$reseller_selectObj', JSON.stringify(selectObj));
		window.location.href = 'order_list.html?' + Math.random();

	});

})

// 页面下拉事件
function LoadData() {
	var scrollTop = parseInt($('#ResellerListscroll').scrollTop()); //页面滚动的高度
	var scrollHeight = parseInt($("#ResellerListscrollul").height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$("#ResellerListscroll").unbind("scroll"); //取消下拉绑定事件
		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		setTimeout(function() {
			GetResellerList(); //下拉加载
		}, 1000);
	}
}

//绑定经销商
//function GetResellerList() {
//	var roleDetail = localStorage.getItem('$login_role') || "[]";
//	var usersObj = JSON.parse(roleDetail);
//	var CriticalOrderID = $("#CriticalOrderIDs").val(); //当前列表最临界点订单ID
//	var DataJson = {
//		UserID: usersObj.UserID,
//		CompID: "0",
//		Search: "",
//		ClassifyID: "-1",
//		IsEnabled: "1",
//		CriticalOrderID: CriticalOrderID,
//		GetType: "1",
//		Rows: "100",
//		SortType: "0",
//		ResellerID: usersObj.DisID,
//		Sort: "0"
//	}
//	var datastr = JSON.stringify(DataJson);
//	post('GetResellerList', datastr, function(response) {
//		if(response.Result == "T" && response.Description == "返回成功" && response.ResellerList.length > 0) {
//			//			var html = "";
//			var resellerList = new Array();
//			reseller = {
//				label: '全部',
//				value: '0'
//			};
//			resellerList.push(reseller);
//			$.each(response.ResellerList, function(index, item) {
//				reseller = {
//					label: item.ResellerName,
//					value: item.ResellerID
//				};
//				resellerList.push(reseller);
//			});
//			$('#reseller').click(function() {
//				weui.picker(resellerList, {
//					defaultValue: [response.ResellerList.length - 1],
//					className: 'custom-classname',
//					onChange: function(result) {
//
//					},
//					onConfirm: function(result) {
//						$('#txtreseller').text(result[0].label);
//						resellerID = result[0].value;
//					},
//					id: 'picker'
//				});
//
//			});
//		}
//
//	})
//}

function getDatatime() {
	var myDate = new Date();
	//获取当前年
	var year = myDate.getFullYear();
	//获取当前月
	var month = myDate.getMonth() + 1;
	//获取当前日
	var date = myDate.getDate();
	var now = year + '-' + p(month) + "-" + p(date)

	$("#create_date").click(function() {
		new DatePicker({
			"type": "3", //0年, 1年月, 2月日, 3年月日(默认为3)

			"title": '请选择交货日期', //标题（可选）

			"maxYear": "", //最大年份（可选）

			"minYear": "", //最小年份（可选）

			"separator": "-", //日期分割符(可选)(默认为'/')

			"defaultValue": now, //默认值：根据分隔符分隔开（可选）

			"callBack": function(val) {
				//回调函数（val为选中的日期）
				// 可在此处设置显示选中的值
				self.nowVal = val;
				$('#txtCreateDate').text(val);
			}
		});
	});

	$("#ende_date").click(function() {
//		weui.datePicker({
//			start: '2018-01-01',
//			end: '2050-12-29',
//			defaultValue: [year, month, date],
//			onChange: function(result) {
//
//			},
//			onConfirm: function(result) {
//				$('#txtEndeDate').text(result[0].value + '-' + result[1].value + '-' + result[2].value);
//			},
//			id: 'datePicker'
//		});
		new DatePicker({
			"type": "3", //0年, 1年月, 2月日, 3年月日(默认为3)

			"title": '请选择交货日期', //标题（可选）

			"maxYear": "", //最大年份（可选）

			"minYear": "", //最小年份（可选）

			"separator": "-", //日期分割符(可选)(默认为'/')

			"defaultValue": now, //默认值：根据分隔符分隔开（可选）

			"callBack": function(val) {
				//回调函数（val为选中的日期）
				// 可在此处设置显示选中的值
				self.nowVal = val;
				$('#txtEndeDate').text(val);
			}
		});
		

	});

}

function p(s) {
	return s < 10 ? '0' + s : s;
}

function initSelect() {
	var Select = sessionStorage.getItem('$reseller_selectObj') || "";
	if(Select !== '') {
		selectObj = JSON.parse(Select);
		orderState = selectObj.OrderState;
		payState = selectObj.PayState;
		//		resellerID = selectObj.ResellerID;
		$("#txtCreateDate").text(selectObj.CreateDate === '-1' ? '' : selectObj.CreateDate);
		$("#txtEndeDate").text(selectObj.EndeDate === '-1' ? '' : selectObj.EndeDate);
		//		$("#txtreseller").text(selectObj.ResellerName);
		switch(orderState) {
			case '-2':
				$('#txtOrderState').text('全部');
				break;
			case '1':
				$('#txtOrderState').text('待审核');
				break;
			case '2':
				$('#txtOrderState').text('待发货');
				break;
			case '3':
				$('#txtOrderState').text('待退货');
				break;
			case '5':
				$('#txtOrderState').text('已完成');
				break;
			case '6':
				$('#txtOrderState').text('已作废');
				break;
		}

		switch(payState) {
			case '-1':
				$('#txtPayState').text('全部');
				break;
			case '0':
				$('#txtPayState').text('未支付');
				break;
			case '1':
				$('#txtPayState').text('部分支付');
				break;
			case '2':
				$('#txtPayState').text('已支付');
				break;
			case '4':
				$('#txtPayState').text('申请退款');
				break;
			case '5':
				$('#txtPayState').text('已退款');
				break;

		}
	}
}