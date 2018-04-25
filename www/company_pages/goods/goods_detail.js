(function(doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			docEl.style.fontSize = 50 * (clientWidth / 320) + 'px';
		};

	if(!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
//点击弹窗
$(document).ready(function($) {
	//open popup
	$('.cd-popup-trigger').on('click', function(event) {
		event.preventDefault();
		$('.cd-popup').addClass('is-visible');
	});

	//close popup
	$('.cd-popup').on('click', function(event) {
		if($(event.target).is('.popup-close') || $(event.target).is('.cd-popup')) {
			event.preventDefault();
			$(this).removeClass('is-visible');
		}
	});
	//close popup when clicking the esc keyboard button
	$(document).keyup(function(event) {
		if(event.which == '27') {
			$('.cd-popup').removeClass('is-visible');
		}
	});
});

var Gid = ""; //商品ID
var List = "";
var isInStock = '1';//0:下架 1:上架
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	DataGoodsBind();

	//属性模板点击事件
	$(document).on("click", ".skuul li", function() {
		$(this).siblings().removeClass("cur");
		$(this).addClass("cur");
		var ValueInfo = "";
		if($(".sku1").html() != "")
			ValueInfo = $(".sku1title").html() + ":" + $(".sku1 .cur").html() + "；";
		if($(".sku2").html() != "")
			ValueInfo += $(".sku2title").html() + ":" + $(".sku2 .cur").html() + "；";
		if($(".sku3").html() != "")
			ValueInfo += $(".sku3title").html() + ":" + $(".sku3 .cur").html() + "；";

		bingGoodsInfo(ValueInfo);
	});

	//减少数量
	$(".minus").on('click', function() {
		var textNum = $("#txtGoodsNum").val() * 1;
		if(textNum > 0)
			$("#txtGoodsNum").val((textNum - 1))
	});

	//增加数量
	$(".add").on('click', function() {
		var textInventory = $("#Inventory").html() * 1;
		var textNum = $("#txtGoodsNum").val() * 1;

		if(textNum < textInventory)
			$("#txtGoodsNum").val((textNum + 1))
	});

});

//初次加载绑定事件
function DataGoodsBind() {
	var url = window.location.href; //URL地址
	Gid = url.split('id=')[1];//商品ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		CompanyID: usersObj.CompID, //核心企业ID
		GoodsID: Gid,
		ResellerID: "", //经销商ID
		UserID: usersObj.UserID //用户ID
	};
	var datastr = JSON.stringify(DataJson);
	post('SearchGoodsList', datastr, function(response) {
        isInStock = response.ProductList[0].InStock;
		List = response.ProductList[0]; //记录商品信息
		$("#GoodsName").html(List.ProductName); //商品名称
		var imgurl = "../../images/pic.jpg";
		if(List.ProductPicUrlList.length > 0)
			imgurl = List.ProductPicUrlList[0].PicUrl
		$("#GoodsImg").html("<img src=\"" + imgurl + "\">"); //大图片路径
		$("#CompName").html(usersObj.CompName); //公司名称
		$("#Details").html(List.Details); //商品介绍

		if(List.Details == "")
			$("#Details").html("<div style=\"width:100%;text-align: center;\">暂无商品介绍</div>"); //商品介绍
		//绑定SKU值
		var html = ""; //
		var ValueInfo = ""; //用来取第一条商品
		$.each(List.ProductAttributeList, function(index, item) {
			$.each(item.ProductAttValueList, function(indexs, items) {
				if(indexs == 0) { //每个属性的第一个值  显示选中
					html = "<li class=\"cur\">" + items.ProductAttValueName + "</li>";
					ValueInfo += item.ProductAttributeName + ":" + items.ProductAttValueName + "；";
				} else
					html += "<li>" + items.ProductAttValueName + "</li>";
				//属性一绑定
				if(index == 0) {
					$(".sku1title").html(item.ProductAttributeName);
					$(".sku1").append(html)

				}
				//属性二绑定
				if(index == 1) {
					$(".sku2title").html(item.ProductAttributeName);
					$(".sku2").append(html)
				}
				//属性三绑定
				if(index == 2) {
					$(".sku3title").html(item.ProductAttributeName);
					$(".sku3").append(html)
				}
				html = "";
			})

		});

		bingGoodsInfo(ValueInfo);
		setTimeout(function() {
			$('#loading').hide();
		}, '500');
	})

}

function html_encode(str) {
    if (!str) {
        return "";
    }
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\n/g, "<br>");
    s = s.replace('²','&#178');
    return s;
}

//绑定商品详情
function bingGoodsInfo(ValueInfo) {
   	var valueInfo =  replaceValueInfo(ValueInfo);
	$.each(List.SKUList, function(index, item) {
		if(item.ValueInfo == valueInfo) {
			if(item.InStock ==='0'){
                $("#TinkerPrice").html("该商品已下架");
			}else{
                $("#TinkerPrice").html("¥" + item.TinkerPrice);
			}
			$("#BarCode").html("编码：" + item.BarCode);
			$("#Inventory").html(item.Inventory.toString().split('.')[0]);
			$("#SKUID").val(item.SKUID)
		}
	});
}

//验证整数
function IntYZ(val) //val=this
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
	var str = new RegExp("[1234567890]")
	var s = $("#" + id + "").val();
	var rs = "";
	for(var i = 0; i < s.length; i++) {
		if(str.test(s.substr(i, 1))) {
			rs = rs + s.substr(i, 1)
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