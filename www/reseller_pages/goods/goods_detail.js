var Gid = ""; //商品ID
var List = "";
var sku; //商品属性规格
var usersObj;
var isCollect = false;
var DataJson;
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	DataGoodsBind();
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
	});

	// 减少数量
	$(".minus").on('click', function() {
		var textNum = $("#txtGoodsNum").val() * 1;
		if(textNum > 0)
			$("#txtGoodsNum").val((textNum - 1))
	});

	// 增加数量
	$(".add").on('click', function() {
		var textInventory = $("#Inventory").html() * 1;
		var textNum = $("#txtGoodsNum").val() * 1;

		if(textNum < textInventory || textInventory === -1) {
			$("#txtGoodsNum").val((textNum + 1))
		}

	});

	// 商品收藏
	$('#isCollect').on('click', function() {
		var type;
		// 判断当前收藏状态	
		if(isCollect) {
			// 取消收藏操作
			type = '0';
		} else {
			// 收藏操作
			type = '1';
		}

		var SetCollect = JSON.stringify({
			UserID: usersObj.UserID,
			ResellerID: usersObj.DisID,
			Type: type,
			GoodsID: List.ProductID,
		});

		post('SetCollect', SetCollect, function(response) {
			if(isCollect) {
				isCollect = false;
				$('#isCollect').text('加入收藏');
				$('#isCollect').removeClass('cur');
			} else {
				//收藏成功
				isCollect = true;
				$('#isCollect').text('取消收藏');
				$('#isCollect').addClass('cur');
			}
		});
	});
	
	$('#shoppingCart').click(function() {
		window.location.href = 'shopping_cart.html?' + Math.random();
	});

	// 加入购物车
	$('.join').on('click', function() {
		var textNum = $("#txtGoodsNum").val() * 1; //购买数量
		if(textNum === 0) {
			$.tips({
				content: '商品数量不能为0',
				stayTime: 1500,
				type: "warn"
			})
			return;
		}
		if(textNum > (sku.Inventory) * 1 && (sku.Inventory) * 1 !== -1) {
			$.tips({
				content: '商品库存不足',
				stayTime: 1500,
				type: "warn"
			});
			return;
		}
		// 计算商品总价
		var sumAmount = textNum * parseFloat(sku.TinkerPrice);
		// 当前选中的商品OrderDetail
		var OrderDetail = {
			ProductID: sku.ProductID,
			IsPro: sku.IsPro,
			SKUID: sku.SKUID,
			Num: textNum,
			Price: sku.TinkerPrice,
			SumAmount: sumAmount, //单价 x 数量
			Remark: '',
			proInfo: sku.ProInfo
		}

		var cartName = '$' + usersObj.UserID + usersObj.DisID;

		// 从本地保存购物车数据 ， 与当前加入购物车商品进行比较
		var CartDataList = JSON.parse(localStorage.getItem(cartName) || "[]");
		if(CartDataList.length !== 0) {
			var isSkuExists = false;
			var CompID = usersObj.CompID;
			var b = false;
			//			$.each(CartDataList, function(index, value) {
			for(var i = 0; i < CartDataList.length; i++) {

				if(CartDataList[i].CompID === CompID) {
					b = true;
					var orderDetailList = CartDataList[i].orderDetailList;
					// 判断当前商品是否存在购物车中
					for(var j = 0; j < orderDetailList.length; j++) {
						if(orderDetailList[j].SKUID === OrderDetail.SKUID) {
							isSkuExists = true;
							orderDetailList[j].Num += parseInt(OrderDetail.Num); // 更新数量
							orderDetailList[j].Price = OrderDetail.Price; // 更新价格
							orderDetailList[j].SumAmount = orderDetailList[j].Num * parseFloat(orderDetailList[j].Price); // 更新
						}
					}
					if(isSkuExists) {
						CartDataList[i].orderDetailList = orderDetailList;
					} else {
						CartDataList[i].orderDetailList.push(OrderDetail);
					}
				}
			}
			// 如果购物车中无加入购物车商品对应核心企业保存商品
			if(!b) {
				var orderDetailList = new Array();
				orderDetailList.push(OrderDetail);
				var CartData = {
					orderDetailList: orderDetailList,
					CompID: usersObj.CompID,
					CompName: usersObj.CompName
				}
				CartDataList.push(CartData);
			}

			//			});
		} else {
			// 初始化购物车
			var orderDetailList = new Array();
			orderDetailList.push(OrderDetail);
			var CartData = {
				orderDetailList: orderDetailList,
				CompID: usersObj.CompID,
				CompName: usersObj.CompName
			}
			CartDataList.push(CartData);
		}

		localStorage.setItem(cartName, JSON.stringify(CartDataList));
		$('#shoppingCart').append("<style>.i-t-shop:before{ color:#F7FE2E }</style>")
		$.tips({
			content: '购物车添加成功~',
			stayTime: 1500,
			type: "warn"
		});

	});
	initSCartIcon();
});

// 初始化购物车图标
function initSCartIcon() {
	cartName = '$' + usersObj.UserID + usersObj.DisID;
	var CartDataList = [];
	CartDataList = JSON.parse(localStorage.getItem(cartName) || "[]");
	if(CartDataList.length !== 0) {
		$.each(CartDataList, function(i, ivalue) {
			if(ivalue.CompID === usersObj.CompID) {
				$.each(ivalue.orderDetailList, function(j, jvalue) {
					if(jvalue.ProductID === Gid) {
						$('#shoppingCart').append("<style>.i-t-shop:before{ color:#F7FE2E }</style>")
					}
				});
			}
			//			if(e.CompID === DataJson.CompanyID){
			//				console.log("里面有此公司商品")
			//				var ProductID = e.orderDetailList[0].ProductID
			//				if(ProductID === DataJson.GoodsID){
			//					console.log("购物车里有此商品")
			//					$('#shoppingCart').append("<style>.i-t-shop:before{ color:red }</style>")
			//				}else{
			//					$('#shoppingCart').append("<style>.i-t-shop:before{ color:#fff }</style>")
			//				}
			//			}
		})
	}
}

// 初次加载绑定事件
function DataGoodsBind() {
	var url = window.location.href; //URL地址
	Gid = url.split('gid=')[1] //商品ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	usersObj = JSON.parse(roleDetail);
	DataJson = {
		CompanyID: usersObj.CompID, //核心企业ID
		GoodsID: Gid,
		ResellerID: usersObj.DisID, //经销商ID
		UserID: usersObj.UserID //用户ID
	}
	//console.log(JSON.stringify(usersObj));
	var datastr = JSON.stringify(DataJson);
	post('ResellerSearchGoodsList', datastr, function(response) {
		if(response.ProductList[0].IsCollect === '1') {
			$('#isCollect').text('取消收藏');
			$('#isCollect').addClass('ok');
			isCollect = true;
		}

		//console.log(JSON.stringify(response.ProductList[0]));
		List = response.ProductList[0]; //记录商品信息
		$("#GoodsName").html(List.ProductName) //商品名称
		var imgurl = "../../images/pic.jpg";
		if(List.ProductPicUrlList.length > 0)
			imgurl = List.ProductPicUrlList[0].PicUrl
		$("#GoodsImg").html("<img src=\"" + imgurl + "\">") //大图片路径
		$("#CompName").html(usersObj.CompName) //公司名称
		$("#Details").html(List.Details) //商品介绍
		if(List.Details == "")
			$("#Details").html("<div style=\"width:100%;text-align: center;\">暂无商品介绍</div>") //商品介绍
		// 绑定SKU值
		var html = ""; //
		var ValueInfo = ""; //用来取第一条商品
		$.each(List.ProductAttributeList, function(index, item) {
			$.each(item.ProductAttValueList, function(indexs, items) {
				if(indexs == 0) { //每个属性的第一个值  显示选中
					html = "<li class=\"cur\">" + items.ProductAttValueName + "</li>";
					ValueInfo += item.ProductAttributeName + ":" + items.ProductAttValueName + "；";
				} else
					html += "<li>" + items.ProductAttValueName + "</li>";
				// 属性一绑定
				if(index == 0) {
					$(".sku1title").html(item.ProductAttributeName)
					$(".sku1").append(html)

				}
				// 属性二绑定
				if(index == 1) {
					$(".sku2title").html(item.ProductAttributeName)
					$(".sku2").append(html)
				}
				// 属性三绑定
				if(index == 2) {
					$(".sku3title").html(item.ProductAttributeName)
					$(".sku3").append(html)
				}
				html = "";
			});

		});

		bingGoodsInfo(ValueInfo);
	});

}


// 绑定商品详情
function bingGoodsInfo(ValueInfo) {
	var valueInfo = replaceValueInfo(ValueInfo);
	$.each(List.SKUList, function(index, item) {
		if(item.ValueInfo == valueInfo) {
			//			$("#BarCode").html("编码：" + item.BarCode)
			//			$("#TinkerPrice").html("¥" + item.TinkerPrice)
			//			$("#Inventory").html(item.Inventory.toString().split('.')[0]);
			//			$("#SKUID").val(item.SKUID)
			//			sku = item;
			if(item.InStock === '0') {
				$("#TinkerPrice").html("¥" + item.TinkerPrice);
			} else {
				$("#TinkerPrice").html("¥" + item.TinkerPrice);
			}
			$("#BarCode").html("编码：" + item.BarCode);
			$("#Inventory").html(item.Inventory.toString().split('.')[0]);
			$("#SKUID").val(item.SKUID)
			sku = item;
		}
	});
}

// 验证整数
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