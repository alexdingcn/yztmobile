var ClassifyList = null; //商品分类
var listIsNull = true;
var provisionalList = null;
var selectClassifiID = '-1';
var logged = false;
window.onload = function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$(window).bind("scroll", LoadData); //绑定下拉事件
	DataGoodsBind(); //初次加载(商品列表)
	DataGtype(); //绑定商品分类
}

$(function() {
	$("#CriticalProductIDs").val("-1"); //清空
	FastClick.attach(document.body);
	//头部排列方式单机事件
	$("#Array").on('click', function() {
		if($(this).attr("class") == "per i-t-array") {
			$(this).addClass("cur");
			$("#goodsLiBig").removeClass("big");
		} else {
			$(this).removeClass("cur");
			$("#goodsLiBig").addClass("big");
		}
	})

	var tabs = $('#tabs a');
	nextCompToPage(tabs, '3');
	//头部条件页签单机事件
	$(".TabA").on('click', function() {
		$(".TabA").removeClass("active")
		$(this).addClass("active")

		if($(this).is(".a1")) {
			//根据销量
			$("#Type").val("1")
			Delete()
		} else if($(this).is(".a2")) {
			//根据最新
			$("#Type").val("0")
			Delete()
		} else if($(this).is(".a3")) {

			//根据价格
			if($(this).children("span").is(".down")) {
				//高到底
				$(this).children("span").removeClass("down")
				$(this).children("span").addClass("up")
				$("#Type").val("2")
			} else {
				//低到高
				$(this).children("span").removeClass("up")
				$(this).children("span").addClass("down")
				$("#Type").val("3")
			}
			Delete()
		} else {
			//筛选
			listIsNull = true;
		}

	})

	//	//商品分类单击事件
	//	$(document).on("click", ".Gtype", function() {
	//
	//		$(this).siblings("li").removeClass("cur");
	//		$(this).addClass("cur")
	//		var IDs = $(this).attr("id"); //商品分类ID
	//		if($(this).parent().is(".deep1")) {
	//			//一级分类单击事件
	//			var ParentID2 = BindClassifyList(IDs, 2) //绑定二级
	//			BindClassifyList(ParentID2, 3) //绑定三级
	//		}
	//		if($(this).parent().is(".deep2")) {
	//			//二级分类单击事件
	//			BindClassifyList(IDs, 3) //绑定三级
	//		}
	//
	//	})

	//是否促销
	$("#promotion").on('click', function() {
		if($(this).is(".bule"))
			$(this).removeClass("bule")
		else
			$(this).addClass("bule")

	})

	//状态 
	$(".stateLi li").on('click', function() {
		$(".stateLi li").removeClass("cur")
		$(this).addClass("cur")
	})

	//筛选确定
	$("#BtnSelect").on('click', function() {
		$("#CriticalProductIDs").val("-1"); //清空

		if($("#promotion").is(".bule"))
			$("#IsSaless").val("1") //是否促销

		var ProductStatuss = $(".stateLi .cur").attr("id")
		$("#ProductStatuss").val(ProductStatuss) //上下架

//		var id1 = $(".deep1 .cur").attr("id");
//		var id2 = $(".deep2 .cur").attr("id");
//		var id3 = $(".deep3 .cur").attr("id");
//		var Classifs = id1;
//		if(id2 != undefined)
//			Classifs = id2
//		if(id3 != undefined)
//			Classifs = id3
		$("#Classifs").val(selectClassifiID)
		$("#goodsLiBig").html("");
		var htm = '<div class="ui-loading-wrap">' +
			'<p>正在努力加载中...</p>' +
			'<i class="ui-loading"></i>' +
			'</div>';

		$("#goodsLiBig").append(htm);
		DataGoodsBind(); //重新绑定商品
		$(".cd-popup").removeClass("is-visible")
	})

	//删选关闭按钮
	$(".pop-close").on('click', function() {
		$(".cd-popup").removeClass("is-visible")
		//	  	$("#Classifs").val("-1")
		//      $("#IsSaless").val("")
		//      $("#MaxPrices").val("")
		//      $("#MinPrices").val("")
		//      $("#ProductStatuss").val("0")
	})

})

//页面下拉事件
function LoadData() {
	var scrollTop = parseInt(document.body.scrollTop); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		//		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		//		setTimeout(function() {
		DataGoodsBind(); //下拉加载
		//		}, 1000);
	}
}

//绑定商品
function DataGoodsBind() {
	var datastr = getDate();
	post('CompanyProductSearch', datastr, function(response) {
		$('.ui-loading-wrap').hide();
		if(response.Result == "T" && response.Description == "返回成功") {
			$("#CompName").html(response.CompanyName); 
			$("#footer").hide(); //隐藏加载中
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
			var strbig = "";
			//遍历商品  追加到列表
			$.each(response.ProductSimpleList, function(n, value) {
				var imgurl = "../../images/pic.jpg";
				if(n == response.ProductSimpleList.length - 1)
					$("#CriticalProductIDs").val(value.ProductID) //记录当前列表最临界点订单ID

				if(value.ProductPicUrlList.length > 0)
					imgurl = value.ProductPicUrlList[0].PicUrl
				strbig += '<div class="li">' +
					'<a href="goods_detail.html?random=' + Math.random() + "&id=" + value.ProductID + "&compid=" + response.CompanyID + '">' +
					'<div class="pic"><img  src="' + imgurl + '"></div>' +
					' <div class="number">' + value.ProductCode + '</div>' +
					'<div class="title">' + value.ProductName + '</div>' +
					(logged ? '<div class="sum rcolor">¥' + value.SalePrice + '</div>' : '') +
					'</a>' +
					'<a href="goods_detail.html?random=' + Math.random() + "id=" + value.ProductID + '">' +
					' </div>'
			});

			$("#goodsLiBig").append(strbig)
			$('#tips').hide();
			listIsNull = false;
		} else if(response.Result == "T" && response.Description == "没有更多数据" && listIsNull === false) {
			$.tips({
				content: '商品列表全部加载完毕',
				stayTime: 3000,
				type: "warn"
			})
		} else if(listIsNull === false) {
			$.tips({
				content: '商品列表加载失败',
				stayTime: 3000,
				type: "warn"
			})

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
			$('#tips').show();
		}
	})
}

//获取查询参数
function getDate() {
	var Conditions = ""; //搜索条件: 订单号/经销商ID/经销商名称
	var CriticalProductIDs = $("#CriticalProductIDs").val(); //当前列表最临界点订单ID
	var Classifs = $("#Classifs").val(); //商品分类:”,”分隔ID
	var IsSaless = $("#IsSaless").val(); //是否促销 0：不促销 1:促销
	var MaxPrices = $("#MaxPrices").val(); //最高价格
	var MinPrices = $("#MinPrices").val(); //最低价格
	var ProductStatuss = $("#ProductStatuss").val(); //0:全部 1：上架 2:下架
	var Types = $("#Type").val(); //搜索类型0:最新1：销量 2:价格从高到低 3:价格从低到高
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	if (usersObj.CompName) {
		logged = true;
		if (getUrlParameter("compid") != usersObj.CompID) {
			$('#tabs').remove();
		} else {
			$("#CompName").html(usersObj.CompName) //公司名称
		}
	} else {
		logged = false;
		$('#tabs').remove();
	}
	
	var DataJson = {
		CompID: getUrlParameter("compid") || usersObj.CompID, //核心企业ID
		Condition: Conditions,
		CriticalProductID: CriticalProductIDs,
		Filter: {
			Classif: Classifs,
			IsSales: IsSaless,
			MaxPrice: MaxPrices,
			MinPrice: MinPrices,
			ProductStatus: ProductStatuss
		},
		GetType: "1", //获取方式
		ResellerID: "", //经销商ID
		Type: Types,
		UserID: usersObj.UserID //用户ID
	}
	return JSON.stringify(DataJson);
}

/**
 * 初始化商品分类列表 默认加载第一级分类
 * @param {Object} classifyArrayList  分类列表
 * @param {Object} Select 选中分类级别 null: 父分类节点
 */
function initFilter(classifyArrayList, Select) {
	var ClassifyName; //分类名称
	var ClassifyList = new Array(); //需要加载的分类列表
	var child;
	var FilterList = new Array(); //存放分类级别list

	if(Select === null) {
		$.each(classifyArrayList, function(index, value) {
			child = classifyArrayList[index];
			if(child.ParentID === '0') {
				child.Level = 0;
				ClassifyList.push(child);
			}
			if(index === classifyArrayList.length - 1)
//				ClassifyName = value.ClassifyName;
				ClassifyName = '商品分类';	
			child.Level = 0;
		});
	} else {
		$.each(classifyArrayList, function(index, value) {
			child = classifyArrayList[index];
			if(child.ParentID === Select.ClassifyID) {
				child.Level = (Select.Level + 1);
				ClassifyList.push(child);
				ClassifyName = Select.ClassifyName;
			}

		});
		//加载分类列表
		//		if(value.ClassifyID == ParentID)
		child.Level = (Select.Level + 1);
	}
	if(ClassifyList.length === 0) {
		
		ClassifiClear(Select);
		return;
	}
	//加载分类名称
	var Classifi = '<div class="cd-screen" id ="classifi' + child.Level + '">' +
		'<div class="title">' + ClassifyName + '</div>' +
		'<ul class="state deep' + child.Level + '">' +
		'</ul>' +
		'</div>'
	$(".pop-con").append(Classifi);

	var ClassifiValue;
	if(provisionalList === null) {
		provisionalList = ClassifyList;
	} else {
		//		provisionalList.concat(provisionalList,ClassifyList);
		provisionalList = provisionalList.concat(ClassifyList);
	}

	$.each(ClassifyList, function(index, value) {
		if(index === 0) {
			ClassifiValue = '<li class="Gtype" id="' + value.ClassifyID + '" onclick="classifiClick(this,' + value.ClassifyID + ')">' + value.ClassifyName + '</li>'
		} else {
			ClassifiValue += '<li class="Gtype" id="' + value.ClassifyID + '" onclick="classifiClick(this,' + value.ClassifyID + ')">' + value.ClassifyName + '</li>'
		}

	});
	//加载分类value
	$(".deep" + child.Level).append(ClassifiValue);
}

/**
 * 标签点击事件
 */
function classifiClick(th, classifyID) {
	$(th).siblings("li").removeClass("cur");
	$(th).addClass("cur");
	var i = 0;
	len = provisionalList.length;
	var selectClassifi;
	for(; i < len;) {
		if(classifyID === parseInt(provisionalList[i].ClassifyID)) {
			selectClassifi = provisionalList[i];
			break;
		}
		i++;
	}
	selectClassifiID = selectClassifi.ClassifyID;
	ClassifiClear(selectClassifi);
	//加载下级分类
	initFilter(ClassifyList, selectClassifi);

}

/**
 * 清空该分类下的所有子分类
 * 确保分类列表数据不重复.
 */
function ClassifiClear(classify) {
	if(classify.ClassifyID === '-1'){
		$('#classifi' + 1).remove();
		$('#classifi' + 2).remove();
	}
	
	//移除大于classify Level的view
	for(var i = 0; i < 3; i++) {
		if(classify.Level < i) {
			$('#classifi' + i).remove();
		}
	}
}

//获取分类列表
function DataGtype() {
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		UserID: usersObj.UserID,
		ResellerID: "0",
		CompanyID: usersObj.CompID || getUrlParameter("compid")
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerProductClassifyList', datastr, function(response) {
		if(response.Result == "T") {
			ClassifyList = response.ProductClassifyList;
			//			var ParentID1 = BindClassifyList("0", 1) //绑定一级
			//			var ParentID2 = BindClassifyList(ParentID1, 2) //绑定二级
			//			BindClassifyList(ParentID2, 3) //绑定三级
			initFilter(ClassifyList, null);
		}

	})
}

////绑定一二三级分类
//function BindClassifyList(ParentID, deep) {
//	var html = ""; //分类列表
//	var ClassifyID = ""; //分类ID
//	var ClassifyName = ""; //分类名称
//	var count = 0;
//	$.each(ClassifyList, function(n, value) {
//
//		if(value.ParentID == ParentID) {
//			if(count == 0) {
//				count++;
//				ClassifyID = value.ClassifyID;
//
//				html = "<li class=\"cur Gtype\" id=\"" + value.ClassifyID + "\">" + value.ClassifyName + "</li>"
//			} else {
//				html += "<li class=\"Gtype\" id=\"" + value.ClassifyID + "\">" + value.ClassifyName + "</li>"
//			}
//		}
//		if(value.ClassifyID == ParentID)
//			ClassifyName = value.ClassifyName;
//	})
//	if(deep == "1")
//		$(".deep1").html(html);
//	if(deep == "2") {
//		$(".deep2").html(html)
//		if(html != "")
//			$(".deep2title").html(ClassifyName)
//		else
//			$(".deep2title").html("")
//	}
//	if(deep == "3") {
//		$(".deep3").html(html)
//		if(html != "")
//			$(".deep3title").html(ClassifyName)
//		else
//			$(".deep3title").html("")
//	}
//
//	return ClassifyID;
//}

//清空搜索条件
function Delete() {
	$("#CriticalProductIDs").val("-1"); //清空
	$("#Classifs").val("-1")
	$("#IsSaless").val("")
	$("#MaxPrices").val("")
	$("#MinPrices").val("")
	$("#ProductStatuss").val("0")
	$("#goodsLiBig").html("");
	var htm = '<div class="ui-loading-wrap">' +
			'<p>小陌正在努力加载中...</p>' +
			'<i class="ui-loading"></i>' +
			'</div>';

	$("#goodsLiBig").append(htm);
	DataGoodsBind(); //重新绑定商品
}

//验证金额
function MoneyYZ(val) //val=this
{
	var id = $(val).attr("id");
	var el = $("#" + id + "").get(0);
	var pos = 0;
	if('selectionStart' in el) {
		pos = el.selectionStart;
	} else if('selection' in document) {
		el.focus();
		var Sel = document.selection.createRange();
		var SelLength = document.selection.createRange().text.length;
		Sel.moveStart('character', -el.value.length);
		pos = Sel.text.length - SelLength;
	}
	var str = new RegExp("[1234567890.]")
	var d = new RegExp("[.]")
	var s = $("#" + id + "").val();
	var rs = "";
	for(var i = 0; i < s.length; i++) {
		if(str.test(s.substr(i, 1))) {
			if(d.test(s.substr(i, 1))) {
				if(rs.indexOf('.') < 0 && rs.length > 0) {
					rs = rs + s.substr(i, 1);
				}
			} else {
				var index = rs.indexOf('.');
				if(index > 0) {
					var strs = rs.substring(index, rs.length)
					if(strs.length < 3) {
						rs = rs + s.substr(i, 1);
					}
				} else {
					rs = rs + s.substr(i, 1)
				}
			}
		}
	}
	if(s != rs) {
		$("#" + id + "").val(rs);
		if(val.setSelectionRange) {
			val.focus();
			val.setSelectionRange(pos - 1, pos - 1);
		} else if(input.createTextRange) {
			var range = val.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos - 1);
			range.moveStart('character', pos - 1);
			range.select();
		}
	}

}