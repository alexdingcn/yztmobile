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
		NewsID: getQueryVariable("id") || ""
    }
    return JSON.stringify(DataJson);
}

//绑定事件
function DataOrderBind() {
	var datastr = getQuery();
	//console.log(datastr);
	post('GetSysNotice', datastr, function(response) {
		if(response.Result == "T" && response.Description == "成功") {

			$("#loading").hide(); //隐藏加载中

			var html = "";
			//遍历订单  追加到列表
			$.each(response.ListInfo, function(index, item) {
				html += "<li data-newsid=\"" + item.ID + "\">" + 
                    "<div class=\"ui-list-info ui-border-t\"><div class=\"title\">" + (item.Title.length > 18 ? item.Title.substr(0, 18) + '...' : item.Title) + "</div>" + 
					"<div class=\"a1\">" + item.Contents.substr(0, 100) + "...</div>";
				html += "<div class=\"a1\">" + item.CreateDate + "</div>";
				html += '</li>';

				$("#title").html(item.Title);
				$("#datetime").html(item.CreateDate);
				$("#newsContent").html(item.Contents);
			});
			
			$(".news-li").append(html);
			$('.news-li').show();
			
			listIsNull = false;

			$(".news-li li").unbind('click');
			$(".news-li li").on('click', function() {
                var newsId = $(this).data("newsid");
				window.location = "./news_detail.html?id=" + newsId;
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
			$('.news-li').hide();
			$('#tips').show();
		}
	});
}
