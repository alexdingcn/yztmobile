$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	var usersObj = JSON.parse(roleDetail);
//	//信息种类单机
//	$("#NewsTypeBtn").on('click', function() {
//		$("#News-List").prop("style", "display:block")
//	})

	//关闭事件
	$("#NewsTypeBtn").on('click', function() {
		//		$(this).parents(".goods-spec").prop("style", "display:none")
		weui.picker([{
			label: '新闻',
			value: '1'
		}, {
			label: '通知',
			value: '2'
		}, {
			label: '公告',
			value: '3'
		}, {
			label: '促销',
			value: '4'
		}, {
			label: '商户动态',
			value: '5'
		}], {
			defaultValue: [1],
			className: 'custom-classname',
			onChange: function(result) {

			},
			onConfirm: function(result) {
				$("#NewsTypeBtn .info").html(result[0].label + "<i class=\"i-arrow\"></i>")
				var id = result[0].value;
				$("#NewsTypesHid").val(id)
			},
			id: 'picker'
		});
	})
//	//选择新闻种类
//	$("#newsType li").on('click', function() {
//		$("#newsType li .i-circle ").removeClass("ok")
//		$(this).find(".i-circle ").addClass("ok")
//		var id = $(this).attr("id")
//		$("#NewsTypesHid").val(id)
//		$("#NewsTypeBtn .info").html($(this).text() + "<i class=\"i-arrow\"></i>")
//		$(this).parents(".goods-spec").prop("style", "display:none")
//	})

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
			$.tips({
				content: '请输入消息标题',
				stayTime: 3000,
				type: "warn"
			})
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
			if(response.Result == "T") {
				$.tips({
					content: '信息发布成功',
					stayTime: 1000,
					type: "warn"
				})
				setTimeout(function() {
					window.location.href = 'news_list.html?' + Math.random();
				}, '1000');
			} else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		})
	})

})