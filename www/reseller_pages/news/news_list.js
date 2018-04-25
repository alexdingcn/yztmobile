$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$('#back').click(function() {
		window.location.href = "../home/home.html?" + Math.random();
	});
	DataNewsBind();
	$(window).bind("scroll", LoadData); //绑定下拉事件

})

//页面下拉事件
function LoadData() {
	var scrollTop = parseInt($(document).scrollTop()); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		setTimeout(function() {
			DataNewsBind(); //下拉加载
		}, 1000);
	}
}

function DataNewsBind() {
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var CriticalOrderID = $("#CriticalOrderIDs").val(); //当前列表最临界点订单ID
	var DataJson = {
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
		ResellerID: "0",
		IsEnabled: "1",
		CriticalOrderID: CriticalOrderID,
		GetType: "1",
		Rows: "10",
		SortType: "0",
		OrderType: "0",
		Sort: "0",
		Search: {
			Title: "-1",
			NewsID: "-1",
			IsEnable: "-1",
			IsTop: "-1",
			NewsType: "-1",
			ShowType: "-1"
		},
		Infotype: "-1"
	}

	var datastr = JSON.stringify(DataJson)
	post('CompNewsList', datastr, function(response) {
		//console.log(JSON.stringify(response));
		if(response.Result == "T" && response.Description == "获取成功") {
			//console.log(JSON.stringify(response));
			var html = "";
			//遍历经销商   追加到列表
			$.each(response.NewsList, function(index, item) {
				if(index == response.NewsList.length - 1)
					$("#CriticalOrderIDs").val(item.NewsID) //记录当前列表最临界点订单ID

				var Contents = item.NewsType == "1" ? "新闻资讯" : item.NewsType == "2" ? "最新通知" : item.NewsType == "3" ? "最新公告" : item.NewsType == "4" ? "最新促销" : "企业动态"
				var Title = item.Title == "" ? "无标题" : item.Title
				html += "<li class=\"li\"><a href=\"news_info.html?random=" + Math.random() + "id=" + item.NewsID + "\">" +
					"<h2 class=\"title\">" + Title + "<time class=\" gcolor9\">" + item.CreateTime + "</time></h2>" +
					"<div class=\"a1\"><div class=\"fl\">" + Contents + "</div><div class=\"fr\">店铺发布</div></div>" +
					"</a></li>"

			})
			$("#NewsList").append(html)
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
		} else if(response.Result == "F" && response.Description == "没有更多数据") {
			$("#footer").html("已经加载完毕");
		} else {
			$("#footer").children("span:eq(0)").hide().next().html("加载数据失败");
			setTimeout(function() {
				$("#footer").hide();
				setTimeout(function() {
					$(window).bind("scroll", LoadData);
				}, 15);
			}, 1500);
		}

	})

}