var ClassifyList = null; //经销商分类
var usersObj;
var listIsNull = true;

$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	usersObj = JSON.parse(roleDetail);
	$(window).bind("scroll", LoadData); //绑定下拉事件
	DataDisBind(); //初次加载(订单列表)
	DataGtype();
	//筛选条件单机事件
	$("#WhereBtn").on('click', function() {
		listIsNull = true;
		$("#CriticalOrderIDs").val('-1');
		$("#WherePage").attr("style", "display:block;")
	})

	var tabs = $('#tabs a');
	nextCompToPage(tabs, '2');

	//经销商分类单击事件
	$(document).on('click', ".Gtype", function() {
		$(this).siblings("li").removeClass("cur");
		$(this).addClass("cur")
		var IDs = $(this).attr("id"); //商品分类ID
		if($(this).parent().is(".deep1")) {
			//一级分类单击事件
			var ParentID2 = BindClassifyList(IDs, 2) //绑定二级
			BindClassifyList(ParentID2, 3) //绑定三级
		}
		if($(this).parent().is(".deep2")) {
			//二级分类单击事件
			BindClassifyList(IDs, 3) //绑定三级
		}
	})

	//状态 
	$(".stateLi li").on('click', function() {
		$(".stateLi li").removeClass("cur")
		$(this).addClass("cur")
	})

	//筛选确定
	$("#BtnSelect").on('click', function() {
		$("#CriticalOrderIDs").val("-1"); //清空

		var IsEnableds = $(".stateLi .cur").attr("id")
		$("#IsEnableds").val(IsEnableds) //是否启用

		var id1 = $(".deep1 .cur").attr("id");
		var id2 = $(".deep2 .cur").attr("id");
		var id3 = $(".deep3 .cur").attr("id");
		var ClassifyIDs = id1;
		if(id2 != undefined)
			ClassifyIDs = id2
		if(id3 != undefined)
			ClassifyIDs = id3
		$("#ClassifyIDs").val(ClassifyIDs)

		$("#ResellerListscrollul").html("");
		DataDisBind(); //重新绑定经销商
		$("#WherePage").attr("style", "display:none;")
	})

	//搜索按钮单机
	$("#selectBtn").on('click', function() {
		var text = $("#selectText").val();
		if(text != "输入名称") {
			$("#Searchs").val(text);
			$("#ResellerListscrollul").html("");
			DataDisBind(); //重新绑定经销商
		}
	})
	$("#selectText").on('click', function() {
		return false;
	})

})

//绑定经销商分类
function DataGtype() {

	var DataJson = {
		UserID: usersObj.UserID,
		CompID: usersObj.CompID
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerClassifyList', datastr, function(response) {
		if(response.Result == "T") {
			ClassifyList = response.ResellerClassifyList;
			var ParentID1 = BindClassifyList("0", 1) //绑定一级
			var ParentID2 = BindClassifyList(ParentID1, 2) //绑定二级
			BindClassifyList(ParentID2, 3) //绑定三级
		}
	});
}
//绑定一二三级分类
function BindClassifyList(ParentID, deep) {
	var html = ""; //分类列表
	var ClassifyID = ""; //分类ID
	var ClassifyName = ""; //分类名称
	var count = 0;
	$.each(ClassifyList, function(n, value) {

		if(value.ParentID == ParentID) {
			if(count == 0) {
				count++;
				ClassifyID = value.ClassifyID;

				html = "<li class=\"cur Gtype\" id=\"" + value.ClassifyID + "\">" + value.ClassifyName + "</li>"
			} else {
				html += "<li class=\"Gtype\" id=\"" + value.ClassifyID + "\">" + value.ClassifyName + "</li>"
			}
		}
		if(value.ClassifyID == ParentID)
			ClassifyName = value.ClassifyName;
	})
	if(deep == "1")
		$(".deep1").html(html + "<li class=\" Gtype\" id=\"-1\">全部分类</li>");
	if(deep == "2") {
		$(".deep2").html(html)
		if(html != "")
			$(".deep2title").html(ClassifyName)
		else
			$(".deep2title").html("")
	}
	if(deep == "3") {
		$(".deep3").html(html)
		if(html != "")
			$(".deep3title").html(ClassifyName)
		else
			$(".deep3title").html("")
	}

	return ClassifyID;
}

// 绑定事件
function DataDisBind() {
	var datastr = getDate();
	post('GetResellerList', datastr, function(response) {
		if(response.Result == "T" && response.Description == "返回成功" && response.ResellerList.length > 0) {
			var html = "";
			//遍历经销商   追加到列表
			$.each(response.ResellerList, function(index, item) {
				if(index == response.ResellerList.length - 1)
					$("#CriticalOrderIDs").val(item.ResellerID) //记录当前列表最临界点订单ID
				html += "<li class=\"li\" id=\"" + item.ResellerID + "\"><a href=\"disserbutor_info.html?random=" + Math.random() + "id=" + item.ResellerID + "\">" +
					"<div class=\"title\">" + item.ResellerName + "<i class=\"bcolor\">" + item.ResellerAddr + "</i></div>" +
					"<div class=\"a2\">联系人：" + item.Principal + "</div>" +
					"<div class=\"gcolor9\">电话：" + item.Phone + "</div>" +
					"<div class=\"pic\"></div>" +
					"</a></li>"
//					"<div class=\"pic\"><img src=\"\" style=\"border:0\"></div>" +
			})
			$("#ResellerListscrollul").append(html)
			listIsNull = false;
		
			$("#ResellerListscrollul").show();
			$('#tips').hide();
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
		} else if(response.Result == "T" && response.ResellerList.length != 10 &&listIsNull === false) {
			$.tips({
				content: '列表全部加载完毕',
				stayTime: 3000,
				type: "warn"
			});
		} else if(listIsNull === false){
			$.tips({
				content: '加载数据失败',
				stayTime: 3000,
				type: "warn"
			});

			setTimeout(function() {
				setTimeout(function() {
					$(window).bind("scroll", LoadData);
				}, 15);
			}, 1500);
		}
		
		if(listIsNull) {
			$("#ResellerListscrollul").hide();
			$('#tips').show();
		}
	})

}

//获取参数
function getDate() {
	var CriticalOrderID = $("#CriticalOrderIDs").val(); //当前列表最临界点订单ID
	var IsEnableds = $("#IsEnableds").val(); //是否禁用
	var ClassifyIDs = $("#ClassifyIDs").val(); //所选最末级分类
	var Searchs = $("#Searchs").val(); //经销商名称
	var DataJson = {
		UserID: usersObj.UserID,
		CompID: usersObj.CompID,
		Search: Searchs,
		ClassifyID: ClassifyIDs,
		IsEnabled: IsEnableds,
		CriticalOrderID: CriticalOrderID,
		GetType: "1",
		Rows: "10",
		SortType: "0",
		ResellerID: "0",
		Sort: "0"
	}
	var datastr = JSON.stringify(DataJson);
	return datastr;
}

//页面下拉事件
function LoadData() {
	var scrollTop = parseInt(document.body.scrollTop); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		DataDisBind(); //下拉加载
	}
}