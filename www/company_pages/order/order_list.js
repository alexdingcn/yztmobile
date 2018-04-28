var listIsNull = true;
var CriticalOrderID;
$(function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	CriticalOrderID = '-1'
	var url = window.location.href; //URL地址
	var orderstate = url.split('=')[1] || ""; //订单分类
	if(orderstate !== '') {
		$("#States").val(orderstate);
	} else {
		//从本地临时数据获取筛选条件
		var Select = sessionStorage.getItem('$comp_selectObj') || "";
		if(Select !== '') {
			var selectObj = JSON.parse(Select);
			if (selectObj.OrderState) {
				$("#States").val(selectObj.OrderState);
			}
			if (selectObj.PayState) {
				$("#PayStates").val(selectObj.PayState);
			}
			if (selectObj.ResellerID) {
				$("#ResellerIDs").val(selectObj.ResellerID);
			}
			$("#BeginDates").val(selectObj.CreateDate);
			$("#EndDates").val(selectObj.EndeDate);
			if (selectObj.ResellerName) {
				$("#ResellerText").val(selectObj.ResellerName);
			}
		}
	}

	$(window).bind("scroll", LoadData); //绑定下拉事件
	DataOrderBind(); //初次加载(订单列表)

	$("#order_select").click(function() {
		var States = $("#States").val()
		var Pay = $("#PayStates").val()
		var Reseller = $("#ResellerIDs").val()
		var txtCreateDate = $("#BeginDates").val()
		var txtEndeDate = $("#EndDates").val()
		var ResellerText = $("#ResellerText").val()
		window.location = "order_select.html?id=" + States + "," + Pay + "," + Reseller + "," + txtCreateDate + "," + txtEndeDate + "," + ResellerText + '&tmp=' + Math.random();
	})

	//搜索按钮单机
	$("#selectbtn").click(function() {
		var text = $("#selectvalue").val();
		if(text != "订单号/名称") {
			$("#ExpressNos").val(text);
			$(".order-li").html("");
			$("#CriticalOrderIDs").val('-1');
			DataOrderBind();
		}
	})
	$("#selectvalue").click(function() {
		return false;
	})

	var tabs = $('#tabs a');
	nextCompToPage(tabs, '1');
})

//绑定事件
function DataOrderBind() {
	$(window).unbind("scroll"); //取消下拉绑定事件
	var datastr = getDate();
	//console.log(datastr);
	post('GetCompanyOrderList', datastr, function(response) {
		if(response.Result == "T" && response.Description == "获取成功") {

			$("#footer").hide(); //隐藏加载中

			var html = "";
			//遍历订单  追加到列表
			$.each(response.OrderList, function(index, item) {
				console.log(item);
				if(index == response.OrderList.length - 1)
				CriticalOrderID = item.OrderID;
//					$("#CriticalOrderIDs").val(item.OrderID)
				var stateClass = ""; //单据状态
				var statetext = ""; //单据状态
				var statetitle = "" //单据状态
				var cancel = ""; //是否作废
				var deleteBtn = "none"; //删除订单
				var selectBtn = "none"; //查看物流
				if(item.OState == "1") {
					stateClass = "icon"
					statetext = "待审核"
					statetitle = "订"
				} else if(item.OState == "2") {
					stateClass = "icon"
					statetext = "待发货"
					statetitle = "订"
				} else if(item.OState == "3") {
					stateClass = "icon ora"
					statetext = "退货中"
					statetitle = "退"
					selectBtn = "line-block"
				} else if(item.OState == "4") {
					stateClass = "icon"
					statetext = "待收货"
					statetitle = "订"
					selectBtn = "line-block"
				} else if(item.OState == "5") {
					stateClass = "icon"
					statetext = "已完成"
					statetitle = "订"
					selectBtn = "line-block"
					deleteBtn = "line-block"
				} else if(item.OState == "6") {
					stateClass = "icon"
					statetext = "已作废"
					statetitle = "订"
					cancel = "cancel";
				} else if(item.OState == "7") {
					stateClass = "icon ora"
					statetext = "已退货"
					statetitle = "退"
				}

				if(index == response.OrderList.length - 1)
					$("#CriticalProductIDs").val(item.OrderID) //记录当前列表最临界点订单ID
				

				html += "<li class=\"ui-border-t " + cancel + "\" data-id=\"" + item.ReceiptNo + "\">" +
					"<div class=\"ui-list-info content\">" + 
					"<i class=\"" + stateClass + "\">" + statetitle + "</i>" + 
					"<div class=\"title\">" + item.DisName + "</div>" + 
					"<div class=\"a1\">订单号：" + item.ReceiptNo + "</div>" +
					"<div class=\"a1\">订单金额：¥" + item.TotalAmount;
				if (item.PayedAmount && item.PayedAmount > 0) {
					html += "（已付：¥" + item.PayedAmount + "）";
				} else {
					html += "（未支付）";
				}
				html += "</div>" +
					"<div class=\"a1\">共" + item.OrderDetailList.length + "种商品</div>" +
					"<div class=\"a1\">" + item.CreateDate + "</div>"+
					"</div>";
				if (cancel == "cancel") {
					html += '<div class="ui-badge-muted">';
				} else {
					html += '<div class="ui-badge">';
				}
				html += statetext + '</div></li>';
			});
			$(".order-li").append(html);
			$('.order-li').show();
			
			listIsNull = false;
			$(window).bind("scroll", LoadData); //重新绑定下拉事件

			$(".order-li li").unbind('click');
			$(".order-li li").on('click', function() {
				var orderId = $(this).data("id");
				window.location = "order_detail.html?random=" + Math.random() + "&id=" + orderId;
			})
		} else if(response.Result == "T" && response.OrderList === null){
			
			
		} else if(response.Result == "T" && response.OrderList.length != 10) {
			$.tips({
				content: '列表全部加载完毕',
				stayTime: 3000,
				type: "warn"
			});
		} else {
			$.tips({
				content: '加载数据失败',
				stayTime: 3000,
				type: "warn"
			});
			setTimeout(function() {
				$("#footer").hide();
				setTimeout(function() {
					$(window).bind("scroll", LoadData);
				}, 15);
			}, 1500);
		}
		setTimeout(function() {
			$('#loading').hide();
		}, '500');

		if(listIsNull) {
			$('.order-li').hide();
			$('#tips').show();

		}
	});
}

//获取查询参数
function getDate() {
//	var CriticalOrderID = $("#CriticalOrderIDs").val(); //当前列表最临界点订单ID
	var SortType = $("#SortTypes").val(); //排序类型（0：默认 1：日期xxxx-xx-xx 2：价格）
	var Sort = $("#Sorts").val(); //排序（0：顺序 1：倒序）
	var State = $("#States").val(); //订单状态: 0:全部 1:待审核 2:待发货 3：待退货 4：已完成 5:已作废 6已退货 7 已发货
	var PayState = $("#PayStates").val(); //支付状态：0：未支付  1：部分支付  2：已支付  4、申请退款 5、已退款（全部 -1）
	var ResellerID = $("#ResellerIDs").val(); //经销商ID

	var BeginDates = $("#BeginDates").val(); //搜索开始日期不填传-1
	var EndDates = $("#EndDates").val(); //搜索结束日期不填传-1
	var ExpressNo = $("#ExpressNos").val(); //产品名称/物流单号/订单编号/

	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);

	$("#CompName").html(usersObj.CompName) //公司名称
	var DataJson = {
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
		CriticalOrderID: CriticalOrderID,
		GetType: "1",
		Rows: "10",
		SortType: SortType,
		Sort: Sort,
		State: State,
		PayState: PayState,
		ResellerID: ResellerID,
		Search: {
			BeginDate: BeginDates,
			EndDate: EndDates,
			ExpressNo: ExpressNo
		}
	}

	return JSON.stringify(DataJson);
}

//页面下拉事件
function LoadData() {
	var scrollTop = parseInt(document.body.scrollTop); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		//		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		//		setTimeout(function() {
		DataOrderBind(); //下拉加载
		//		}, 1000);
	}
}