var ClassifyList = ""; //经销商分类 数组
var ResellerAreaList = ""; //经销商 数组
var usersObj;
var Reseller;
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	Bind(); //绑定基础数据
	DataGtype("GetResellerClassifyList", 1); //绑定经销商分类
	DataGtype("GetResellerAreaList", 2); //绑定区域
	BindAdd(0, 1); //绑定省
	//修改分类
	$("#ResellerClassify").on('click', function() {
		$("#ResellerClassifyDiv").attr("style", "display:block;")
	});

	//修改区域
	$("#AreaName").on('click', function() {
		$("#ResellerAreaListDiv").attr("style", "display:block;")
	});

	//省市区修改
	$("#ResellerAddr").on('click', function() {
		$("#ResellerAddDiv").attr("style", "display:block;")
	});

	//关闭
	$(".pop-close").on('click', function() {
		$(this).parents(".cd-popup").attr("style", "display:none;")
	});

	//返回按钮
//	$("#returns").on('click', function() {
//		window.location = "disserbutor_info.html?id=" + Gid;
//	});

	//保存
	$('#save').click(function() {
		if($('#ResellerName').val() === '') {
			$.tips({
				content: '名称不能为空',
				stayTime: 3000,
				type: "warn"
			});
			return;
		}
		if($('#Address').val() === '') {
			$.tips({
				content: '详细地址不能为空',
				stayTime: 3000,
				type: "warn"
			});
			return;
		}
		Reseller.ResellerCode = $('#ResellerCode').val();
		Reseller.ResellerName = $('#ResellerName').val();
		Reseller.ResellerClassify = $('#ResellerClassify').val();
		Reseller.AreaName = $('#AreaName').val();
		Reseller.ResellerAddr = $('#ResellerAddr').val();
		Reseller.Zip = $('#Zip').val();
		Reseller.Tel = $('#Tel').val();
		Reseller.Fax = $('#Fax').val();
		Reseller.Principal = $('#Principal').val();
		Reseller.Phone = $('#Phone').val();
		Reseller.Address = $('#Address').val();

		var EditReseller = JSON.stringify({
			CompID: usersObj.CompID,
			Reseller: Reseller,
			UserID: usersObj.UserID

		});

		post('EditReseller', EditReseller, function(response) {
			if(response.Result === "T") {
				$.tips({
					content: response.Description,
					stayTime: 1000,
					type: "success"
				});
				setTimeout(function() {
					window.location.href = 'disserbutor_list.html?'+Math.random();
				}, '1000');
			} else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				});
			}

		});

	});

	//分类修改确定
	$("#BtnResellerClassify").on('click', function() {
		var id1 = $(".deep1 .cur").attr("id");
		var id2 = $(".deep2 .cur").attr("id");
		var id3 = $(".deep3 .cur").attr("id");
		var Value1 = $(".deep1 .cur").html();
		var Value2 = $(".deep2 .cur").html();
		var Value3 = $(".deep3 .cur").html();
		var ClassifyIDs = id1;
		var ClassifyValue = Value1;
		if(id2 != undefined) {
			ClassifyIDs = id2
			ClassifyValue = Value2;
		}

		if(id3 != undefined) {
			ClassifyIDs = id3
			ClassifyValue = Value3;
		}

		$("#ResellerClassify").html(ClassifyValue + "<i class=\"i-arrow\"></i>"); //分类 
		$("#ResellerClassifyID").val(ClassifyIDs)
		$(this).parents(".cd-popup").attr("style", "display:none;")
	})

	//区域修改确定
	$("#BtnResellerAreaList").on('click', function() {
		var id1 = $(".deep12 .cur").attr("id");
		var id2 = $(".deep22 .cur").attr("id");
		var id3 = $(".deep32 .cur").attr("id");
		var Value1 = $(".deep12 .cur").html();
		var Value2 = $(".deep22 .cur").html();
		var Value3 = $(".deep32 .cur").html();
		var AreaIDs = id1;
		var AreaValue = Value1;
		if(id2 != undefined) {
			AreaIDs = id2
			AreaValue = Value2;
		}
		if(id3 != undefined) {
			AreaIDs = id3
			AreaValue = Value3;
		}
		$("#AreaName").html(AreaValue + "<i class=\"i-arrow\"></i>"); //区域 
		$("#AreaID").val(AreaIDs)
		$(this).parents(".cd-popup").attr("style", "display:none;")
	})
	//地址修改确定事件
	$("#BtnResellerAdd").on('click', function() {
		var provinces = $("#provinces").text();
		var citys = $("#citys").text();
		var districts = $("#districts").text();

		if(provinces == "选择省") {
			alert("请选择省份")
			return false
		}
		if(citys == "选择市") {
			alert("请选择市")
			return false
		}
		if(districts == "选择区") {
			alert("请选择区")
			return false
		}
		var PCA = provinces + "-" + citys + "-" + districts
		$("#ResellerAddr").html(PCA + "<i class=\"i-arrow\"></i>"); //地址
		$("#ResellerProvince").val(provinces); //省
		$("#ResellerCity").val(citys); //市
		$("#ResellerArea").val(districts); //区
		$(this).parents(".cd-popup").attr("style", "display:none;")
	})
	//经销商分类单击事件
	$(document).on("click", ".Gtype", function() {
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
	//区域单机事件
	$(document).on("click", ".Gtype2", function() {
		$(this).siblings("li").removeClass("cur");
		$(this).addClass("cur")
		var IDs = $(this).attr("id"); //商品分类ID
		if($(this).parent().is(".deep12")) {
			//一级分类单击事件
			var ParentID2 = BindResellerAreaList(IDs, 2) //绑定二级
			BindResellerAreaList(ParentID2, 3) //绑定三级
		}
		if($(this).parent().is(".deep22")) {
			//二级分类单击事件
			BindResellerAreaList(IDs, 3) //绑定三级
		}
	})

	//省市级联  单机事件
	$(".deepAdd").on('click', function() {

		var deep = $(this).attr("deep")
		var code = $(this).attr("code")
		if(deep == "1") {
			BindAdd(0, 1); //绑定省
			$("#provinces").html("选择省")
			$("#provinces").removeClass("cur")
			$("#citys").attr("code", "0")
			$("#districts").html("选择区")
			$("#districts").attr("code", "0")
			$("#districts").removeClass("cur")

			$("#citys").html("选择市")
			$("#citys").removeClass("cur")
			$("#citys").attr("code", "0")
		} else if(deep == "2") {
			var no = code.substring(0, 2)
			BindAdd(no, 2); //绑定市
			$("#districts").html("选择区")
			$("#districts").removeClass("cur")
			$("#districts").attr("code", "0")
			$("#citys").html("选择市")
			$("#citys").removeClass("cur")

		} else if(deep == "3") {
			var no = code.substring(0, 4)
			BindAdd(no, 3); //绑定区
			$("#districts").html("选择区")
			$("#districts").removeClass("cur")
			$("#districts").attr("code", "0")
		}
	})

	//选择具体的 省市区
	$(document).on("click", ".deepli", function() {
		$("#div").scrollTop(0);
		var deep = $(this).attr("deep")
		var code = $(this).attr("id")
		var value = $(this).html()
		if(deep == "1") {

			$("#provinces").html(value)
			$("#provinces").addClass("cur")
			var no = code.substring(0, 2)
			$("#citys").attr("code", no)
			$("#citys").click();
		} else if(deep == "2") {
			$("#citys").html(value)
			$("#citys").addClass("cur")
			var no = code.substring(0, 4)
			$("#districts").attr("code", no)
			$("#districts").click();
		} else if(deep == "3") {
			$("#districts").html(value)
			$("#districts").addClass("cur")
			var no = code.substring(0, 4)
			$("#districts").attr("code", no)
		}
	})

})

//绑定数据
function Bind() {
	var url = window.location.href; //URL地址
	Gid = url.split('id=')[1] //商品ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		CompID: usersObj.CompID, //usersObj.CompID"",//核心企业ID
		ResellerID: Gid, //经销商ID
		UserID: usersObj.UserID // usersObj.UserID//用户ID
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerDetail', datastr, function(response) {
		if(response.Result == "T") {
			Reseller = response.Reseller;
			var PCA = response.Reseller.ResellerProvince + "-" + response.Reseller.ResellerCity + "-" + response.Reseller.ResellerArea
			//基本信息
			$("#ResellerCode").val(response.Reseller.ResellerCode);
			$("#ResellerName").val(response.Reseller.ResellerName); //名称
			$("#ResellerClassify").html(response.Reseller.ResellerClassify + "<i class=\"i-arrow\"></i>"); //分类
			$("#AreaName").html(response.Reseller.AreaName + "<i class=\"i-arrow\"></i>"); //区域
			$("#ResellerAddr").html(PCA + "<i class=\"i-arrow\"></i>"); //地址
			$("#Zip").val(response.Reseller.Zip); //邮编
			$("#Tel").val(response.Reseller.Tel); //电话
			$("#Fax").val(response.Reseller.Fax); //传真
			$("#Principal").val(response.Reseller.Principal); //联系人
			$("#Phone").val(response.Reseller.Phone); //手机
			$("#ResellerClassifyID").val(response.Reseller.ResellerClassifyID); //分类ID
			$("#AreaID").val(response.Reseller.AreaID); //区域ID
			$("#ResellerProvince").val(response.Reseller.ResellerProvince); //省
			$("#ResellerCity").val(response.Reseller.ResellerCity); //市
			$("#ResellerArea").val(response.Reseller.ResellerArea); //区
			$("#Address").val(response.Reseller.Address); //详细地址
		}
	})
}
//绑定经销商分类
function DataGtype(name, type) {
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		UserID: usersObj.UserID,
		CompID: usersObj.CompID
	}
	var datastr = JSON.stringify(DataJson);
	post(name, datastr, function(response) {
		if(response.Result == "T") {
			if(type == 1) {
				ClassifyList = response.ResellerClassifyList;
				var ParentID1 = BindClassifyList("0", 1) //绑定一级
				var ParentID2 = BindClassifyList(ParentID1, 2) //绑定二级
				BindClassifyList(ParentID2, 3) //绑定三级
			} else {
				ResellerAreaList = response.AreaList;
				var ParentID1 = BindResellerAreaList("0", 1) //绑定一级
				var ParentID2 = BindResellerAreaList(ParentID1, 2) //绑定二级
				BindResellerAreaList(ParentID2, 3) //绑定三级
			}

		}

	})
}

//绑定分类
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
		$("#ResellerClassifyDiv .deep1").html(html);
	if(deep == "2") {
		$("#ResellerClassifyDiv .deep2").html(html)
		if(html != "")
			$(".deep2title").html(ClassifyName)
		else
			$(".deep2title").html("")
	}
	if(deep == "3") {
		$("#ResellerClassifyDiv .deep3").html(html)
		if(html != "")
			$(".deep3title").html(ClassifyName)
		else
			$(".deep3title").html("")
	}

	return ClassifyID;
}

//绑定区域
function BindResellerAreaList(ParentID, deep) {
	var html = ""; //分类列表
	var AreaID = ""; //分类ID
	var AreaName = ""; //分类名称
	var count = 0;
	$.each(ResellerAreaList, function(n, value) {

		if(value.ParentID == ParentID) {
			if(count == 0) {
				count++;
				AreaID = value.AreaID;

				html = "<li class=\"cur Gtype2\" id=\"" + value.AreaID + "\">" + value.AreaName + "</li>"
			} else {
				html += "<li class=\"Gtype2\" id=\"" + value.AreaID + "\">" + value.AreaName + "</li>"
			}
		}
		if(value.AreaID == ParentID)
			AreaName = value.AreaName;
	})
	if(deep == "1")
		$(".deep12").html(html);
	if(deep == "2") {
		$(".deep22").html(html)
		if(html != "")
			$(".deep2title2").html(AreaName)
		else
			$(".deep2title2").html("")
	}
	if(deep == "3") {
		$(".deep32").html(html)
		if(html != "")
			$(".deep3title2").html(AreaName)
		else
			$(".deep3title2").html("")
	}

	return AreaID;
}

//绑定地址
function BindAdd(no, deep) {
	var date = "";
	if(deep == 1)
		date = provinces
	else if(deep == 2)
		date = citys
	else if(deep == 3)
		date = districts
	else
		return false;
	var htmladd = "";
	$.each(date, function(index, value) {
		if(deep == 1)
			htmladd += "<li class=\"deepli\" deep=\"1\" id=\"" + value.code + "\"><a>" + value.name + "</a><i class=\"i-arrow\"></i></li>"
		else if(deep == 2) {
			var no2 = value.code.substring(0, 2)
			if(no2 == no)
				htmladd += "<li class=\"deepli\" deep=\"2\" id=\"" + value.code + "\"><a>" + value.name + "</a><i class=\"i-arrow\"></i></li>"
		} else if(deep == 3) {
			var no3 = value.code.substring(0, 4)
			if(no3 == no)
				htmladd += "<li class=\"deepli\" deep=\"3\" id=\"" + value.code + "\"><a>" + value.name + "</a><i class=\"i-arrow\"></i></li>"
		}
	})
	$("#AddList").html(htmladd);
}