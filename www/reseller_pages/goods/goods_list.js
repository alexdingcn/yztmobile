var ClassifyList = null; // 商品分类
var provisionalList = null;
var selectClassifiID = '-1';
var usersObj;
var CompanyList = null;
var isInitialLoad = true;
window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$("#CriticalProductIDs").val("-1"); //清空
	$(window).bind("scroll", LoadData); // 绑定下拉事件
	DataGoodsBind(); // 初次加载(商品列表)
	DataGtype(); // 绑定商品分类
}

$(function() {
	var tabs = $('#tabs a');
	nextResellerToPage(tabs, '1');
	$('#shoppingCart').click(function() {
		window.location.href = 'shopping_cart.html?' + Math.random();
	});

	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	initData(); // 初始化厂商选择
	$("#Array").on('click', function() {
		// 侧边栏加载工厂列表
		$('#offCanvas').offCanvas('open');
	});

	// 头部条件页签单机事件
	$(".TabA").on('click', function() {
		$(".TabA").removeClass("active")
		$(this).addClass("active")

		if($(this).is(".a1")) {
			// 根据销量
			$("#Type").val("1")
			Delete()
		} else if($(this).is(".a2")) {
			// 根据最新
			$("#Type").val("0")
			Delete()
		} else if($(this).is(".a3")) {

			// 根据价格
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
		}
	});

	// 是否促销
	$("#promotion").on('click', function() {
		if($(this).is(".bule"))
			$(this).removeClass("bule")
		else
			$(this).addClass("bule")
	})

	// 状态 
	$(".stateLi li").on('click', function() {
		$(".stateLi li").removeClass("cur")
		$(this).addClass("cur")
	})

	// 筛选确定
	$("#BtnSelect").on('click', function() {
		isInitialLoad = true;
		$("#CriticalProductIDs").val("-1"); //清空

		if($("#promotion").is(".bule"))
			$("#IsSaless").val("1") //是否促销

		var ProductStatuss = $(".stateLi .cur").attr("id")
		$("#ProductStatuss").val(ProductStatuss) // 上下架
		$("#Classifs").val(selectClassifiID)
		$("#goodsLiBig").html("");
		//		var htm = '<div class="ui-loading-wrap">' +
		//			'<p>小陌正在努力加载中...</p>' +
		//			'<i class="ui-loading"></i>' +
		//			'</div>';
		var htm = '<div class="weui-loadmore">' +
			'<i class="weui-loading"></i>' +
			'<span class="weui-loadmore__tips">正在加载商品信息</span>' +
			'</div>';
		$("#goodsLiBig").append(htm);
		DataGoodsBind(); //重新绑定商品
		$(".cd-popup").removeClass("is-visible")
	})

	// 删选关闭按钮
	$(".pop-close").on('click', function() {
		$(".cd-popup").removeClass("is-visible")
	})

})

/** 页面下拉事件 */
function LoadData() {
	var scrollTop = parseInt($(document).scrollTop()); //页面滚动的高度
	var scrollHeight = parseInt($(document).height()); //整个页面的高度
	var windowHeight = parseInt($(window)[0].innerHeight); //当前窗口的高度
	if(scrollTop + windowHeight + 1 >= scrollHeight) {
		$(window).unbind("scroll"); //取消下拉绑定事件
		$("#footer").show().children("span:eq(0)").show().next().html("正在加载数据请稍候...");
		setTimeout(function() {
			DataGoodsBind(); //下拉加载
		}, 1000);
	}
}

/** 绑定商品 */
function DataGoodsBind() {
	$('.weui-loadmore').show();
	var datastr = getDate();
	post('ResellerProductSearch', datastr, function(response) {
		$('.weui-loadmore').hide();
		if(response.Result == "T" && response.Description == "返回成功") {
			$('#tips').css('display','none');
			isInitialLoad = false;
			$("#footer").hide(); //隐藏加载中
			$(window).bind("scroll", LoadData); //重新绑定下拉事件
			var strbig = "";
			// 遍历商品  追加到列表
			$.each(response.ProductSimpleList, function(n, value) {
				var imgurl = "../../images/pic.jpg";
				if(n == response.ProductSimpleList.length - 1)
					$("#CriticalProductIDs").val(value.ProductID) //记录当前列表最临界点订单ID

				if(value.ProductPicUrlList.length > 0)
					imgurl = value.ProductPicUrlList[0].PicUrl

				strbig += '<div class="li">' +
					'<a href="goods_detail.html?random=' + Math.random() + "&gid=" + value.ProductID + '">' +
					'<div class="pic"><img  src="' + imgurl + '"></div>' +
					' <div class="number">' + value.ProductCode + '</div>' +
					'<div class="title">' + value.ProductName + '</div>' +
					'<div class="sum rcolor">¥' + value.SalePrice + '</div>' +
					'</a>' +
					'<a href="goods_detail.html?random=' + Math.random() + "&gid=" + value.ProductID + '">' +
					' </div>'
			});

			$("#goodsLiBig").append(strbig);
		} else if(response.Result == "T" && response.Description == "没有更多数据") {
			if(isInitialLoad){
				$('#tips').show();
			}
			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
				'</div>';
			$("#footer").html(footer);

		} else {
			var footer = '<div class="weui-loadmore weui-loadmore_line">' +
				'<span class="weui-loadmore__tips">' + response.Description + '</span>' +
				'</div>';
			$("#footer").html(footer);
		}

	});
}
/* 获取查询参数 */
function getDate() {
	var Conditions = ""; //搜索条件: 订单号/经销商ID/经销商名称
	var CriticalProductIDs = $("#CriticalProductIDs").val(); //当前列表最临界点订单ID
	var Classifs = $("#Classifs").val(); //商品分类:”,”分隔ID
	var IsSaless = $("#IsSaless").val(); //是否促销 0：不促销 1:促销
	var MaxPrices = $("#MaxPrices").val(); //最高价格
	var MinPrices = $("#MinPrices").val(); //最低价格
	var ProductStatuss = $("#ProductStatuss").val(); //0:全部 1：上架 2:下架
	var Types = $("#Type").val(); //搜索类型0:最新1：销量 2:价格从高到低 3:价格从低到高

	$("#CompName").html(usersObj.CompName) //公司名称
	var DataJson = {
		CompID: usersObj.CompID, //核心企业ID
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
		ResellerID: usersObj.DisID, //经销商ID
		Type: Types,
		UserID: usersObj.UserID //用户ID
	}
	return JSON.stringify(DataJson);
}
/* 绑定商品分类 */
function DataGtype() {
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		UserID: usersObj.UserID,
		ResellerID: usersObj.DisID,
		CompanyID: usersObj.CompID
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerProductClassifyList', datastr, function(response) {
		if(response.Result == "T") {
			ClassifyList = response.ProductClassifyList;
			initFilter(ClassifyList, null);
		}
	})
}
/* 清空搜索条件 */
function Delete() {
	$("#CriticalProductIDs").val("-1"); // 清空
	$("#Classifs").val("-1")
	$("#IsSaless").val("")
	$("#MaxPrices").val("")
	$("#MinPrices").val("")
	$("#ProductStatuss").val("0")
	$("#goodsLiBig").html("");
	var htm = '<div class="weui-loadmore">' +
		'<i class="weui-loading"></i>' +
		'<span class="weui-loadmore__tips">正在加载商品信息</span>' +
		'</div>';
	$("#goodsLiBig").append(htm);
	DataGoodsBind(); //重新绑定商品
}
/* 验证金额 */
function MoneyYZ(val) {
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
		// 加载分类列表
		//		if(value.ClassifyID == ParentID)
		child.Level = (Select.Level + 1);
	}
	if(ClassifyList.length === 0) {
		ClassifiClear(Select);
		return;
	}
	// 加载分类名称
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
		provisionalList = provisionalList.concat(ClassifyList);
	}

	$.each(ClassifyList, function(index, value) {
		if(index === 0) {
			ClassifiValue = '<li class="Gtype" id="' + value.ClassifyID + '" onclick="classifiClick(this,' + value.ClassifyID + ')">' + value.ClassifyName + '</li>'
		} else {
			ClassifiValue += '<li class="Gtype" id="' + value.ClassifyID + '" onclick="classifiClick(this,' + value.ClassifyID + ')">' + value.ClassifyName + '</li>'
		}

	});
	// 加载分类value
	$(".deep" + child.Level).append(ClassifiValue);
}

/** 标签点击事件 */
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
	// 加载下级分类
	initFilter(ClassifyList, selectClassifi);
}

/**
 * 清空该分类下的所有子分类
 * 确保分类列表数据不重复.
 */
function ClassifiClear(classify) {
	if(classify.ClassifyID === '-1') {
		$('#classifi' + 1).remove();
		$('#classifi' + 2).remove();
	}

	// 移除大于classify Level的view
	for(var i = 0; i < 3; i++) {
		if(classify.Level < i) {
			$('#classifi' + i).remove();
		}
	}
}

/** 初始化厂商列表 */
var initData = function() {
	var GetUserCompany = JSON.stringify({
		UserID: usersObj.UserID
	});
	post('GetUserCompany', GetUserCompany, function(response) {
		if(response.Result === 'T') {
			// 加载厂商列表
			CompanyList = response.CompanyList;
			$.each(CompanyList, function(index, item) {
				//				var items = '<li class="firm-li" onclick=firmclickListener(this,' + index + ')>' +
				//					'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
				//					'</li>';
				var isSelect = false;
				var items = null;
				if(item.CompanyID === usersObj.CompID)
					isSelect = true;

				if(isSelect) {
					items = '<li style="color:dodgerblue" class="firm-li"   onclick=firmclickListener(this,' + index + ')>' +
						'<a style="color: dodgerblue">' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				} else {
					items = '<li class="firm-li" onclick=firmclickListener(this,' + index + ')>' +
						'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				}
				$('#addList').append(items);
			});
		} else {
			
		}
	});
}

/** 厂商选择监听 */
var firmclickListener = function(th, index) {
	$('#offCanvas a').css("color", "black");
	$(th).children('a').css("color", "dodgerblue");
	if(CompanyList === null) {
		return;
	}
	// 替换默认保存的厂商ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	usersObj.CompID = CompanyList[index].CompanyID;
	usersObj.CompName = CompanyList[index].CompanyName;
	localStorage.setItem('$login_role', JSON.stringify(usersObj));
	// 根据选中的厂商 刷新商品列表 ，刷新筛选列表
	refreshview();
	$('#offCanvas').offCanvas('close');
}

/** 刷新界面 */
var refreshview = function() {
	$('#classifi0').remove(); // 删除一级分类
	$('#classifi' + 1).remove(); // ...
	$('#classifi' + 2).remove(); // ...
	$("#goodsLiBig").html('');
	$("#footer").html('');
	$("#CriticalProductIDs").val("-1"); //清空

	var htm = '<div class="weui-loadmore">' +
		'<i class="weui-loading"></i>' +
		'<span class="weui-loadmore__tips">正在加载商品信息</span>' +
		'</div>';
	$("#goodsLiBig").append(htm);
	DataGtype(); // 获取分类列表
	DataGoodsBind(); // 重新绑定商品
};