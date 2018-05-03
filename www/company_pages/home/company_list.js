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
		UserID: usersObj.UserID
    }
    return JSON.stringify(DataJson);
}

//绑定事件
function DataOrderBind() {
	var datastr = getQuery();
	//console.log(datastr);
	post('GetCompanyList', datastr, function(response) {
		console.log(response);
		if(response.Result == "T" && response.Description == "获取成功") {
	
			$("#loading").hide(); //隐藏加载中

			var html = "";
			//遍历订单  追加到列表
			$.each(response.CompanyList, function(index, item) {
				html += "<li data-compid=\"" + item.CompanyID + "\">" + 
					"<div class=\"ui-avatar-s\">" + 
                    "<span style=\"background-image:url(https://www.yibanmed.com/CompImage/" + item.CompLogo + ")\"></span></div>" + 
					"<div class=\"ui-list-info ui-border-t\"><div class=\"title\">" + (item.CompanyName > 18 ? item.CompanyName.substr(0, 18) + '...' : item.CompanyName) + "</div>";
				html += "<div class=\"a1\">" + item.Contact + ' ' + item.ContactPhone + "</div>";
				html += "<div class=\"a1\">" + item.Address + "</div>";
				html += '</li>';
			});
			
			$(".company-li").append(html);
			$('.company-li').show();
			
			listIsNull = false;
			$(".company-li li").unbind('click');
			$(".company-li li").on('click', function() {
				var compId = $(this).data("compid");
				window.location = "../goods/goods_list.html?compid=" + compId;
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
			$('.company-li').hide();
			$('#tips').show();
		}
	});
}
