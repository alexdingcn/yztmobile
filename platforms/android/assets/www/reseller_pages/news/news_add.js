$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	//信息种类单机
	$("#NewsTypeBtn").on('click', function() {
		$("#News-List").prop("style", "display:block")
	})

	//关闭事件
	$(".pop-close").on('click', function() {
		$(this).parents(".goods-spec").prop("style", "display:none")
	})
	//选择新闻种类
	$("#newsType li").on('click', function() {
		$("#newsType li .i-circle ").removeClass("ok")
		$(this).find(".i-circle ").addClass("ok")
		var id = $(this).attr("id")
		$("#NewsTypesHid").val(id)
		$("#NewsTypeBtn .info").html($(this).text() + "<i class=\"i-arrow\"></i>")
		$(this).parents(".goods-spec").prop("style", "display:none")
	})

	//置顶  发布
	$("#NewsIsTopBtn,#NewsIsFbBtn").on('click', function() {
		if($(this).find(".an").parent().is(".bule")) {
			$(this).find(".an").parent().removeClass("bule")
			$("#IsTopHid").val("0")
		} else {
			$(this).find(".an").parent().addClass("bule")
			$("#IsTopHid").val("1")
		}
	})

	//确定添加
	$("#AddBtn").on('click', function() {
		var roleDetail = localStorage.getItem('$login_role') || "[]";
		var usersObj = JSON.parse(roleDetail);
		if($("#Title").val() == "" || $("#Title").val() == "请输入") {
			alert("请输入信息标题")
			return false;
		}
		var Contents = $("#Contents").val();
		if($("#Contents").val() == "请填写信息内容")
			Contents = "";

		var DataJson = {
			UserID: usersObj.UserID,
			CompanyID: usersObj.CompID,
			Title: $("#Title").val(),
			Contents: Contents,
			IsEnable: "1",
			IsTop: $("#IsTopHid").val(),
			NewsType: $("#NewsTypesHid").val(),
			ShowType: "-1"
		}
		var datastr = JSON.stringify(DataJson)
		console.log(JSON.stringify(DataJson));
		post('CompNewsAdd', datastr, function(response) {
			console.log(JSON.stringify(response));
			if(response.Result == "T") {

				//window.location="news_info.html?id="+response.NewsID;
			} else {
				alert("修改失败")
			}
		})
	})

})