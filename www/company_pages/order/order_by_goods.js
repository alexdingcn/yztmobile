$(function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$("#BeginDates").val(moment().format('YYYY-MM-DD'));
	$("#EndDates").val(moment().format('YYYY-MM-DD'));
	$(".weui-navbar__item").on('click', function() {
		$('.weui-navbar__item').removeClass('weui-bar__item_on');
		$(this).addClass('weui-bar__item_on');
		var dateOffset = $(this).data("date-offset");
		if (dateOffset > 0) {
			$("#BeginDates").val(moment().add(-dateOffset, 'days').format('YYYY-MM-DD'));
			$("#EndDates").val(moment().format('YYYY-MM-DD'));
		} else {
			$("#BeginDates").val('-1');
			$("#EndDates").val('-1');
		}
		
		DataDisOrderBind();
	});
	DataDisOrderBind(); //初次加载(订单列表)
})

//绑定事件
function DataDisOrderBind() {
	var datastr = getDate();
	$("#loading-hint").show();
	$("#no-data-hint").hide();
	$("#loading-result").hide();
	post('GetGoodsSaleReport', datastr, function(response) {
		console.log(response);
		$("#loading-hint").hide();
		if(response.Result == "T" && response.Description == "获取成功") {
			var html = "";
			
			if (!response.GoodsSaleList || response.GoodsSaleList.length === 0) {
				$("#no-data-hint").show();
				return;
			}
			//遍历订单  追加到列表
			$.each(response.GoodsSaleList, function(index, item) {
				html += "<div class=\"weui-cell weui-cell_access\" data-reseller-id=\"" + item.GoodsID + "\">" + 
					"<div class=\"weui-cell__hd\" style=\"position: relative;margin-right: 10px;\">" + 
                    "<img src=\"" + item.GoodsPicUrl + "\" style=\"width: 50px;display: block\">" + 
					"</div><div class=\"weui-cell__bd\">" + 
					"<span style=\"vertical-align: middle;font-size:14px;\">" + item.GoodsName + "</span>" + 
					"<p style=\"color:#888;font-size:13px\">订单数：" + item.OrderCount + "</p>" +
					"<p style=\"color:#888;font-size:13px\">下单商品数：" + item.GoodsCount + "</p>" +
					"<p style=\"color:#888;font-size:13px\">最低单价：¥" + item.MinPrice + "</p>" +
					"<p style=\"color:#888;font-size:13px\">最高单价：¥" + item.MaxPrice + "</p>";

				html += "</div><div class=\"weui-cell__ft\">¥" + item.TotalAmount + '</div>';
				html += '</div>';
			});
			$("#loading-result").html(html);
			$('#loading-result').show();
		} else {
			$("#no-data-hint").show();
		}
	});
}

//获取查询参数
function getDate() {

	var SortType = $("#SortTypes").val(); //排序类型（0：默认 1：日期xxxx-xx-xx 2：价格）
	var State = $("#States").val(); //订单状态: 0:全部 1:待审核 2:待发货 3：待退货 4：已完成 5:已作废 6已退货 7 已发货
	var PayState = $("#PayStates").val(); //支付状态：0：未支付  1：部分支付  2：已支付  4、申请退款 5、已退款（全部 -1）
	var ResellerID = $("#ResellerIDs").val(); //经销商ID

	var BeginDates = $("#BeginDates").val(); //搜索开始日期不填传-1
	var EndDates = $("#EndDates").val(); //搜索结束日期不填传-1

	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);

	$("#CompName").html(usersObj.CompName) //公司名称
	var DataJson = {
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
		State: State,
		PayState: PayState,
		ResellerID: ResellerID,
		Search: {
			BeginDate: BeginDates,
			EndDate: EndDates
		}
	}

	return JSON.stringify(DataJson);
}
