/**
 * Shop product details page
 * @author hxbnzy
 * @time 2017/09/06
 */
var Gid = ""; // 商品ID
var Product = "";
$(function() {
	$('#login').click(function() {
		JumpLoginPage();
	});

	// 属性模板点击事件
	$(document).on("click", ".skuul li", function() {
		$(this).siblings().removeClass("cur")
		$(this).addClass("cur")
		var ValueInfo = "";
		if($(".sku1").html() != "")
			ValueInfo = $(".sku1title").html() + ":" + $(".sku1 .cur").html() + "；";
		if($(".sku2").html() != "")
			ValueInfo += $(".sku2title").html() + ":" + $(".sku2 .cur").html() + "；";
		if($(".sku3").html() != "")
			ValueInfo += $(".sku3title").html() + ":" + $(".sku3 .cur").html() + "；";

		bingGoodsInfo(ValueInfo);
	})

	var compID = getQueryVariable('CompID');
	var goodID = getQueryVariable('GoodID');

	var WXGetProductInfo = JSON.stringify({
		CompID: compID,
		GoodsID: goodID
	});

	post('WXGetProductInfo', WXGetProductInfo, function(response) {
		if(response.Result === "T") {
			//console.log(JSON.stringify(response.ProductList[0]));
			Product = response.Product; //记录商品信息
			$("#GoodsName").html(Product.ProductName) //商品名称
			var imgurl = "../images/pic.jpg";
			if(Product.ProductPicUrlList.length > 0)
				imgurl = Product.ProductPicUrlList[0].PicUrl
			$("#GoodsImg").html("<img src=\"" + imgurl + "\">") //大图片路径
			//$("#CompName").html(usersObj.CompName) //公司名称
			$("#Details").html(Product.Details) //商品介绍

			if(Product.Details == "")
				$("#Details").html("<div style=\"width:100%;text-align: center;\">暂无商品介绍</div>") //商品介绍
			//绑定SKU值
			var html = ""; //
			var ValueInfo = ""; //用来取第一条商品
			$.each(Product.ProductAttributeList, function(index, item) {
				$.each(item.ProductAttValueList, function(indexs, items) {
					if(indexs == 0) { //每个属性的第一个值  显示选中
						html = "<li class=\"cur\">" + items.ProductAttValueName + "</li>";
						ValueInfo += item.ProductAttributeName + ":" + items.ProductAttValueName + "；";
					} else
						html += "<li>" + items.ProductAttValueName + "</li>";
					//属性一绑定
					if(index == 0) {
						$(".sku1title").html(item.ProductAttributeName)
						$(".sku1").append(html)

					}
					//属性二绑定
					if(index == 1) {
						$(".sku2title").html(item.ProductAttributeName)
						$(".sku2").append(html)
					}
					//属性三绑定
					if(index == 2) {
						$(".sku3title").html(item.ProductAttributeName)
						$(".sku3").append(html)
					}
					html = "";
				})

			})

			bingGoodsInfo(ValueInfo);
			setTimeout(function() {
				$('#loading').hide();
			}, '500');
		}
	});

	//绑定商品详情
	function bingGoodsInfo(ValueInfo) {
		$("#TinkerPrice").html('经销商可见')
		//		$.each(Product.SKUList, function(index, item) {
		//			if(item.ValueInfo == ValueInfo) {
		//				$("#BarCode").html("编码：" + item.BarCode)
		//				$("#TinkerPrice").html("¥" + item.TinkerPrice)
		//				$("#Inventory").html(item.Inventory.toString().split('.')[0]);
		//				$("#SKUID").val(item.SKUID)
		//			}
		//		})
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

});