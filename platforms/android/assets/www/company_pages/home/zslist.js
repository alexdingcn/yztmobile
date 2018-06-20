var listIsNull = true;

$(function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};

	DataOrderBind(); //初次加载(订单列表)

    var wto;
	$("#selectvalue").on("change", function(e) {
        clearTimeout(wto);
        wto = setTimeout(function() {
            var query = $("#selectvalue").val();
            if (query && query != '') {
                $('li').hide();
                $('li').filter(function(idx) { return $(this).text().indexOf(query) >= 0 }).show();
            } else {
                $('li').show();
            }
        }, 500);
    });
})

//获取查询参数
function getQuery() {
    var roleDetail = localStorage.getItem('$login_role') || "[]";
    var usersObj = JSON.parse(roleDetail);
    var DataJson = {
        UserID: usersObj.UserID,
        CompanyID: usersObj.CompID,
    }
    return JSON.stringify(DataJson);
}

//绑定事件
function DataOrderBind() {
	var datastr = getQuery();
	//console.log(datastr);
	post('GetZSList', datastr, function(response) {
        console.log(response);
		if(response.Result == "T" && response.Description == "获取成功") {

			$("#loading").hide(); //隐藏加载中

			var html = "";
			//遍历订单  追加到列表
			$.each(response.CampaignList, function(index, item) {
				html += "<li data-compid=\"" + item.CompID + "\" data-goodsid=\"" + item.GoodsID + "\">" +
					"<div class=\"ui-avatar-s\">" + 
                    "<span style=\"background-image:url(https://www.yibanmed.com/CompImage/" + item.CompLogoUrl + ")\"></span></div>" + 
                    "<div class=\"ui-list-info ui-border-t\"><div class=\"title\">" + item.CMName + "</div>" + 
					"<div class=\"a1\">" + item.CompanyName + "</div>" + 
					"<div class=\"a1\">商品名：" + item.GoodsName + "</div>" +
					"<div class=\"a1\">商品编码：" + item.GoodsCode + "</div>";

				html += "<div class=\"a1\">" + item.Remark + "</div>";
				html += '</li>';
			});
			$(".order-li").append(html);
			$('.order-li').show();
			
			listIsNull = false;

			$(".order-li li").unbind('click');
			$(".order-li li").on('click', function() {
                var compId = $(this).data("compid");
                var goodsId = $(this).data("goodsid");
				window.location = "../goods/goods_detail.html?compid=" + compId + "&id=" + goodsId;
			})
		} else {
            $("#loading").hide();
			$.tips({
				content: '加载数据失败',
				stayTime: 3000,
				type: "warn"
			});
		}

		if(listIsNull) {
			$('.order-li').hide();
			$('#tips').show();
		}
	});
}
