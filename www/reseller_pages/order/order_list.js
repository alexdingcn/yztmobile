/*!
 * 订单列表，侧滑厂商切换
 * 
 * Copyright 2017, moreyou.cn
 */
loading = false; // 控制 infinite 事件
usersObj = '';
filterObj = '';
isInitialLoad = true;
$(function() {
	$("#CriticalOrderIDs").val('-1');
	FastClick.attach(document.body);
	document.addEventListener("jpush.openNotification", onOpenNotification, false);
	var tabs = $('#tabs a'),
		roleDetail = localStorage.getItem('$login_role') || "[]",
		filterCriteria = sessionStorage.getItem('$reseller_selectObj') || "", // 本地存储筛选条件
		filterObj; // 筛选条件对象

	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html');
	usersObj = JSON.parse(roleDetail),
		nextResellerToPage(tabs, '2');

	if(filterCriteria !== '') {
		filterObj = JSON.parse(filterCriteria);
		$("#OState").val(filterObj.OrderState);
		$("#PayStates").val(filterObj.PayState);
		$("#BeginDates").val(filterObj.CreateDate);
		$("#EndDates").val(filterObj.EndeDate);
	}
	initView();
	initData();
});

function initData() {
	loadOrderList();
	loadCompanyList();
}

function loadOrderList() {
	$("#CompName").html(usersObj.CompName); // 公司名称
	// 获取订单列表
	var CriticalOrderID = $("#CriticalOrderIDs").val(), // 当前列表最临界点订单ID
		SortType = $("#SortTypes").val(), // 排序类型（0：默认 1：日期xxxx-xx-xx 2：价格）
		Sort = $("#Sorts").val(), // 排序（0：顺序 1：倒序）
		State = $("#States").val(), // 订单状态（0：全部 1：待付款 2：待发货 3：待收货 4：已收货 5：退款/售后 6：已审核 7：未审核 8：已拒绝 9：已发货 10：已付款 11：部分付款 12：已取消）
		PayState = $("#PayStates").val(), // 支付状态：0：未支付  1：部分支付  2：已支付  4、申请退款 5、已退款（全部 -1）
		ResellerID = $("#ResellerIDs").val(), // 经销商ID
		OState = $("#OState").val(), // 订单状态 -1:退回 0：已生成  1：已提交  2：已审核 3、退货处理  4：已发货   5：已到货（完结） 6：已取消  7：已退货   8：预付款申请（全部 -2）
		BeginDates = $("#BeginDates").val(), // 搜索开始日期不填传-1
		EndDates = $("#EndDates").val(), // 搜索结束日期不填传-1
		ExpressNo = $("#ExpressNos").val(); // 产品名称/物流单号/订单编号

	var DataJson = {
		CompID: usersObj.CompID,
		UserID: usersObj.UserID,
		ResellerID: usersObj.DisID,
		CriticalOrderID: CriticalOrderID,
		GetType: "1",
		Rows: "10",
		OState: OState,
		SortType: SortType,
		Sort: Sort,
		State: State,
		PayState: PayState,
		Search: {
			BeginDate: BeginDates,
			EndDate: EndDates,
			ExpressNo: ExpressNo
		}
	}

	var GetResellerOrderList = JSON.stringify(DataJson);
	// 获取订单列表
	post('GetResellerOrderList', GetResellerOrderList, function(response) {
		if(response.Result == "T" && response.Description == "获取成功") {
			isInitialLoad = false;
			$("#CriticalOrderIDs").val(response.OrderList[response.OrderList.length - 1].OrderID);
			var html = "";
			//遍历订单  追加到列表
			$.each(response.OrderList, function(index, item) {
				var stateClass = ""; //单据状态
				var statetext = ""; //单据状态
				var statetitle = "" //单据状态
				var cancel = ""; //是否作废
				var deleteBtn = "none"; //删除订单
				var selectBtn = "none"; //查看物流
				switch(item.OState) {
					case '1':
						stateClass = "icon";
						statetext = "待审核";
						statetitle = "订";
						break;
					case '2':
						stateClass = "icon";
						statetext = "待发货";
						statetitle = "订";
						break;
					case '3':
						stateClass = "icon ora";
						statetext = "退货处理";
						statetitle = "退";
						selectBtn = "line-block";
						break;
					case '4':
						stateClass = "icon";
						statetext = "待收货";
						statetitle = "订";
						selectBtn = "line-block";
						break;
					case '5':
						stateClass = "icon";
						statetext = "已完成";
						statetitle = "订";
						selectBtn = "line-block";
						break;
					case '6':
						stateClass = "icon";
						statetext = "已作废";
						statetitle = "订";
						cancel = "cancel";
						break;
					case '7':
						stateClass = "icon ora";
						statetext = "已退货";
						statetitle = "退";
						break;
					case '8':
						break;
				}
				if(index == response.OrderList.length - 1) {
					$("#CriticalOrderIDs").val(item.OrderID); //记录当前列表最临界点订单ID
				}
				html += "<li class=\"li " + cancel + "\"><a href=\"order_detail.html?random=" + Math.random() + 'id=' + item.ReceiptNo + "\">" +
					"<i class=\"" + stateClass + "\">" + statetitle + "</i>" +
					"<div class=\"title\">" + item.ReceiptNo + "<i class=\"state\">" + statetext + "</i></div>" +
					"<div class=\"a1\">订单金额：¥" + item.TotalAmount + "（已付金额：¥" + item.PayedAmount + "） </div>" +
					"<div class=\"a1\">共" + item.OrderDetailList.length + "种商品</div>" +
					"<div class=\"a1\">" + item.CreateDate + "</div></a>" +
					"<div class=\"a2\"></div></li>"
			});
			$('.order-li').show();
			$(".order-li").append(html);
		} else if(response.Result == "T" && response.Description == "没有更多数据") {
			if(isInitialLoad){
				$('#tips').show();
			}
			$(document.body).destroyInfinite();
			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
				'</div>';
			$("#footer").html(footer);
			var blank = '<div class="blank90"></div>';
			$(".order-li").append(blank);
		} else {
			$(document.body).destroyInfinite();
			//			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
			//				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
			//				'</div>';
			//			$("#footer").html(footer);

		}
		setTimeout(function(){
			$('.weui-loadmore').hide();
		},500);
		
		loading = false;
	});
};

function loadCompanyList() {
	var GetUserCompany = JSON.stringify({
		UserID: usersObj.UserID
	});

	post('GetUserCompany', GetUserCompany, function(response) {
		if(response.Result === 'T') {
			// 加载厂商列表
			CompanyList = response.CompanyList;
			$.each(CompanyList, function(index, item) {
				var isSelect = false;
				var items = null;
				if(item.CompanyID === usersObj.CompID)
					isSelect = true;
				if(isSelect) {
					items = '<li style="color:dodgerblue" class="firm-li"   onclick=firmclickListener(this,' + index + ')>' +
						'<a style="color: dodgerblue">' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				} else {
					items = '<li class="firm-li" onclick=firmclickListener(this,' + index + ')>' +
						'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				}
				$('#addList').append(items);
			});
		} else {

		}
	});
}

function initView() {
	// 侧边栏加载厂商列表
	$("#Array").on('click', function() {
		$('#offCanvas').offCanvas('open');
	});

	// 搜索框提示文字
	$("#selectvalue").focus(function() {
		if($(this).val() == '订单号/名称') {
			$(this).val("");
			inFocus = false;
		}
	});

	$("#selectvalue").blur(function() {
		if($(this).val().length == 0) {
			$(this).val('订单号/名称')
		}
	});

	// 搜索按钮单机
	$("#selectbtn").on('click', function() {
		var text = $("#selectvalue").val();
		if(text != "订单号/名称") {
			$("#ExpressNos").val(text);
			$(".order-li").html("");
			$("#CriticalOrderIDs").val('-1');
			loadOrderList();
		}
	});

	$("#selectvalue").on('click', function() {
		return false;
	});
	$(document.body).infinite();
	$(document.body).infinite().on("infinite", function() {
		if(loading) return;
		loading = true;
		loadOrderList();
	});

	$("#order_select").on('click', function() {
		var OState = $("#OState").val();
		var Pay = $("#PayStates").val();
		var Reseller = $("#ResellerIDs").val();
		var txtCreateDate = $("#BeginDates").val();
		var txtEndeDate = $("#EndDates").val();
		var ResellerText = $("#ResellerText").val();
		window.location = "order_select.html?id=" + OState + "," + Pay + "," + txtCreateDate + "," + txtEndeDate
	});
};

/** 厂商选择监听 */
var firmclickListener = function(th,index) {
	$('#offCanvas a').css("color","black");
	$(th).children('a').css("color","dodgerblue");
	if(CompanyList === null) {
		return;
	}
	// 替换默认保存的厂商ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	usersObj.CompID = CompanyList[index].CompanyID;
	usersObj.CompName = CompanyList[index].CompanyName;
	localStorage.setItem('$login_role', JSON.stringify(usersObj));
	// 根据选中的厂商 刷新商品列表 ，刷新筛选列表
	refreshview();
	$('#offCanvas').offCanvas('close');
}

/** 刷新界面 */
var refreshview = function() {
	$("#footer").html('');
	$(".order-li").html('');
	$("#CriticalOrderIDs").val("-1");
	loading = true;
	$('.weui-loadmore').show();
	loadOrderList();
};

//var listIsNull = true;
//var CriticalOrderID; //当前列表最临界点订单ID
//var usersObj;
//window.onload = function() {
//	$("#CriticalOrderIDs").val("-1");
//	FastClick.attach(document.body);
//	if(!is_weixin()) {
//		document.addEventListener("jpush.openNotification", onOpenNotification, false);
//	};
//	var tabs = $('#tabs a');
//	nextResellerToPage(tabs, '2');
//	var roleDetail = localStorage.getItem('$login_role') || "[]";
//	if(roleDetail === null || roleDetail === '')
//		window.open('../login/login.html')
//	usersObj = JSON.parse(roleDetail);
//	//从本地临时数据获取筛选条件
//	var Select = sessionStorage.getItem('$reseller_selectObj') || "";
//	if(Select !== '') {
//		var selectObj = JSON.parse(Select);
//		$("#OState").val(selectObj.OrderState);
//		$("#PayStates").val(selectObj.PayState);
//		//		$("#ResellerIDs").val(selectObj.ResellerID);
//		$("#BeginDates").val(selectObj.CreateDate);
//		$("#EndDates").val(selectObj.EndeDate);
//		//		$("#ResellerText").val(selectObj.ResellerName);
//	}
//	$(window).bind("scroll", LoadData); //绑定下拉事件
//	DataOrderBind(); //初次加载(订单列表)
//	initData(); // 初始化厂商选择
//
//	// 头部排列方式单机事件
//	$("#Array").on('click', function() {
//		// 侧边栏加载工厂列表
//		$('#offCanvas').offCanvas('open');
//	});
//
//	//搜索框提示文字
//	$("#selectvalue").focus(function() {
//		if($(this).val() == '订单号/名称') {
//			$(this).val("");
//			inFocus = false;
//		}
//
//	});
//
//	$("#selectvalue").blur(function() {
//		if($(this).val().length == 0) {
//			$(this).val('订单号/名称')
//		}
//	});
//
//}
//
//$(function() {
//
//	$("#order_select").on('click', function() {
//		var OState = $("#OState").val();
//		var Pay = $("#PayStates").val();
//		var Reseller = $("#ResellerIDs").val();
//		var txtCreateDate = $("#BeginDates").val();
//		var txtEndeDate = $("#EndDates").val();
//		var ResellerText = $("#ResellerText").val();
//		window.location = "order_select.html?id=" + OState + "," + Pay + "," + txtCreateDate + "," + txtEndeDate
//	})
//
//	//搜索按钮单机
//	$("#selectbtn").on('click', function() {
//		var text = $("#selectvalue").val();
//		if(text != "订单号/名称") {
//			$("#ExpressNos").val(text);
//			$(".order-li").html("");
//			$("#CriticalOrderIDs").val('-1');
//			DataOrderBind();
//		}
//	})
//	$("#selectvalue").on('click', function() {
//		return false;
//	})
//})
//
////绑定事件
//function DataOrderBind() {
//	$('#loadmore').show();
//	var datastr = getDate();
//	post('GetResellerOrderList', datastr, function(response) {
//		setTimeout(function() {
//			$('#loadmore').hide();
//		}, 500);
//		if(response.Result == "T" && response.Description == "获取成功") {
//			$("#CriticalOrderIDs").val(response.OrderList[response.OrderList.length - 1].OrderID);
//			//			$("#footer").hide(); //隐藏加载中
//			var html = "";
//			//遍历订单  追加到列表
//			$.each(response.OrderList, function(index, item) {
//				var stateClass = ""; //单据状态
//				var statetext = ""; //单据状态
//				var statetitle = "" //单据状态
//				var cancel = ""; //是否作废
//				var deleteBtn = "none"; //删除订单
//				var selectBtn = "none"; //查看物流
//				if(item.OState == "1") {
//					stateClass = "icon";
//					statetext = "待审核";
//					statetitle = "订";
//				} else if(item.OState == "2") {
//					stateClass = "icon";
//					statetext = "待发货";
//					statetitle = "订";
//				} else if(item.OState == "3") {
//					stateClass = "icon ora";
//					statetext = "退货处理";
//					statetitle = "退";
//					selectBtn = "line-block";
//				} else if(item.OState == "4") {
//					stateClass = "icon";
//					statetext = "待收货";
//					statetitle = "订";
//					selectBtn = "line-block";
//				} else if(item.OState == "5") {
//					stateClass = "icon";
//					statetext = "已完成";
//					statetitle = "订";
//					selectBtn = "line-block";
//					//             	deleteBtn="line-block"
//				} else if(item.OState == "6") {
//					stateClass = "icon";
//					statetext = "已作废";
//					statetitle = "订";
//					cancel = "cancel";
//				} else if(item.OState == "7") {
//					stateClass = "icon ora";
//					statetext = "已退货";
//					statetitle = "退";
//				}
//
//				//				if(index == response.OrderList.length - 1) {
//				//					$("#CriticalOrderIDs").val(item.OrderID) //记录当前列表最临界点订单ID
//				//				}
//				html += "<li class=\"li " + cancel + "\"><a href=\"order_detail.html?random=" + Math.random() + 'id=' + item.ReceiptNo + "\">" +
//					"<i class=\"" + stateClass + "\">" + statetitle + "</i>" +
//					"<div class=\"title\">" + item.ReceiptNo + "<i class=\"state\">" + statetext + "</i></div>" +
//					"<div class=\"a1\">订单金额：¥" + item.TotalAmount + "（已付金额：¥" + item.PayedAmount + "） </div>" +
//					"<div class=\"a1\">共" + item.OrderDetailList.length + "种商品</div>" +
//					"<div class=\"a1\">" + item.CreateDate + "</div></a>" +
//					"<div class=\"a2\"></div></li>"
//
//			});
//			$('.order-li').show();
//			$(".order-li").append(html);
//			listIsNull = false;
//			$(window).bind("scroll", LoadData); //重新绑定下拉事件
//		} else if(response.Result == "T" && response.Description == "没有更多数据") {
//			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
//				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
//				'</div>';
//			$("#footer").html(footer);
//		} else {
//			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
//				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
//				'</div>';
//			$("#footer").html(footer);
//
//		}
//
//		if(listIsNull) {
//			$('.order-li').hide();
//			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
//				'<span class="weui-loadmore__tips">' + "未查询到订单数据,快去下单把!" + '</span>' +
//				'</div>';
//			$("#footer").html(footer);
//			$("#footer").show();
//		}
//	})
//}
//
////获取查询参数
//function getDate() {
//	CriticalOrderID = $("#CriticalOrderIDs").val(); //当前列表最临界点订单ID
//	var SortType = $("#SortTypes").val(); //排序类型（0：默认 1：日期xxxx-xx-xx 2：价格）
//	var Sort = $("#Sorts").val(); //排序（0：顺序 1：倒序）
//	var State = $("#States").val(); //订单状态（0：全部 1：待付款 2：待发货 3：待收货 4：已收货 5：退款/售后 6：已审核 7：未审核 8：已拒绝 9：已发货 10：已付款 11：部分付款 12：已取消）
//	var PayState = $("#PayStates").val(); //支付状态：0：未支付  1：部分支付  2：已支付  4、申请退款 5、已退款（全部 -1）
//	var ResellerID = $("#ResellerIDs").val(); //经销商ID
//	var OState = $("#OState").val(); //订单状态 -1:退回 0：已生成  1：已提交  2：已审核 3、退货处理  4：已发货   5：已到货（完结） 6：已取消  7：已退货   8：预付款申请（全部 -2）
//	var BeginDates = $("#BeginDates").val(); //搜索开始日期不填传-1
//	var EndDates = $("#EndDates").val(); //搜索结束日期不填传-1
//	var ExpressNo = $("#ExpressNos").val(); //产品名称/物流单号/订单编号/
//
//	
//	var DataJson = {
//		CompID: usersObj.CompID,
//		UserID: usersObj.UserID,
//		ResellerID: usersObj.DisID,
//		CriticalOrderID: CriticalOrderID,
//		GetType: "1",
//		Rows: "10",
//		OState: OState,
//		SortType: SortType,
//		Sort: Sort,
//		State: State,
//		PayState: PayState,
//		Search: {
//			BeginDate: BeginDates,
//			EndDate: EndDates,
//			ExpressNo: ExpressNo
//		}
//	}
//	return JSON.stringify(DataJson);
//}
//
////页面下拉事件
//function LoadData() {
//	var scrollTop = parseInt($(document).scrollTop()); //页面滚动的高度
//	var scrollHeight = parseInt($(document).height()); //整个页面的高度
//	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
//	if(scrollTop + windowHeight + 1 >= scrollHeight) {
//		$(window).unbind("scroll"); //取消下拉绑定事件
//		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
//		setTimeout(function() {
//			DataOrderBind(); //下拉加载
//		}, 1000);
//	}
//}
//
///**
// * 获取经销商对应核心企业
// * 初始化厂商列表
// */
//var initData = function() {
//	var GetUserCompany = JSON.stringify({
//		UserID: usersObj.UserID
//	});
//
//	post('GetUserCompany', GetUserCompany, function(response) {
//		if(response.Result === 'T') {
//			// 加载厂商列表
//			CompanyList = response.CompanyList;
//			$.each(CompanyList, function(index, item) {
//				var items = '<li class="firm-li" onclick=firmclickListener(' + index + ')>' +
//					'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
//					'</li>';
//				$('#addList').append(items);
//			});
//		} else {
//
//		}
//	});
//}
//
///** 厂商选择监听 */
//var firmclickListener = function(index) {
//	if(CompanyList === null) {
//		return;
//	}
//	// 替换默认保存的厂商ID
//	var roleDetail = localStorage.getItem('$login_role') || "[]";
//	if(roleDetail === null || roleDetail === '')
//		window.open('../login/login.html')
//	usersObj = JSON.parse(roleDetail);
//	usersObj.CompID = CompanyList[index].CompanyID;
//	usersObj.CompName = CompanyList[index].CompanyName;
//	localStorage.setItem('$login_role', JSON.stringify(usersObj));
//	// 根据选中的厂商 刷新商品列表 ，刷新筛选列表
//	refreshview();
//	$('#offCanvas').offCanvas('close');
//}
//
///** 刷新界面 */
//var refreshview = function() {
//	$("#footer").html('');
//	$(".order-li").html('');
//	$("#CriticalOrderIDs").val("-1");
//	DataOrderBind();
//};