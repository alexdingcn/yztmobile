/**
 *  经销商购物车
 * 	@author hxbnzy
 *  @time 2017/08/16
 */
var usersObj;
var CartDataList; //本地购物车保存数据
var newOrderDetailList;
var IsAllChecked = false; //默认不全选
var cartName;
var Status = true; //true :购物车提交 false: 购物车删除
var CartData = null;
$(function() {
	FastClick.attach(document.body);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	cartName = '$' + usersObj.UserID + usersObj.DisID;
	CartDataList = JSON.parse(localStorage.getItem(cartName) || "[]");
	isShowCartTip(CartDataList.length);
	searchGoodsList(); // 获取购物车商品最新信息

	$('.ui-tooltips-cnt').on('click', function() {
		window.location = '../goods/goods_list.html';
	});

	// 编辑 保存
	$('#status').on('click', function() {
		if(Status) {
			// 购物车删除
			Status = false;
			$('#cartSub').text('删除');
			$('#status').text('完成');
			$('#total_amount').hide();
		} else {
			// 购物车提交
			Status = true;
			$('#status').text('编辑');
			$('#cartSub').text('去结算');
			$('#total_amount').show();
		}
	});

	//	// 全选
	//	$('#isAllChecked').on('click', function() {
	//		selectAll();
	//	});

	$('#cartSub').on('click', function() {
		if(Status) {
			var isCompanyPro = false;
			// 购物车提交
			var subSkuList = new Array();
			var CompID = null;
			if(CartDataList.length !== 0) {
				$.each(CartDataList, function(i, ivalue) {
					$.each(ivalue.orderDetailList, function(j, jvalue) {
						if(jvalue.isChecked === '1') {
							subSkuList.push(jvalue);
							if(CompID !== null && CompID !== CartDataList[i].CompID) {
								isCompanyPro = true;
							}
							CompID = CartDataList[i].CompID;
						}
					});
				});

				if(isCompanyPro) {
					el = $.tips({
						content: '多个企业商品不能同时提交～',
						stayTime: 3000,
						type: "warn"
					});
					return;
				}

				if(subSkuList.length !== 0) {
					// 跳转页面
					// 临时保存需要提交的商品
					sessionStorage.setItem('$order_sub_goods', JSON.stringify(subSkuList));
					window.location.href = 'submit_order.html?' + Math.random();
				} else {
					el = $.tips({
						content: '请选择要结算的购物车商品',
						stayTime: 3000,
						type: "warn"
					})
				}
			} else {
				el = $.tips({
					content: '购物车无商品',
					stayTime: 3000,
					type: "warn"
				})
			}

		} else {
			var isSelect = false;
			// 购物车删除
			for(var i = 0; i < CartDataList.length; i++) {
				var orderDetailList = CartDataList[i].orderDetailList;
				for(var j = 0; j < orderDetailList.length; j++) {
					if(orderDetailList[j].isChecked === '1') {
						// 删除该商品
						isSelect = true;
						orderDetailList.splice(j, 1);
						j--;
					} else {

					}
				}
			}

			// 清空购物车无数据核心企业
			$.each(CartDataList, function(index, value) {
				if(value.orderDetailList.length === 0 || value.orderDetailList === null) {
					CartDataList.splice(index, 1);
					index--;
				}
			});

			if(isSelect) {
				localStorage.setItem(cartName, JSON.stringify(CartDataList));
				$.tips({
					content: '购物车商品删除成功',
					stayTime: 3000,
					type: "warn"
				});
				setTimeout(function() {
					window.location.reload();
				}, '1000');
			} else {
				$.tips({
					content: '请选择要删除的商品',
					stayTime: 3000,
					type: "warn"
				});
			}

		}

	});

});

/**
 * 是否显示购物车空 tip
 * @param {Object} num 购物车数量
 */
var isShowCartTip = function(num) {
	if(num > 0) {
		$('.ui-tooltips').addClass('none');
	} else {
		$('.ui-tooltips').removeClass('none');
	}

};

/** 根据商品ID ,从服务器获取产品最新信息 */
function searchGoodsList() {
	var orderIDs = '';
	if(CartDataList.length === 0) {
		return;
	}

	$.each(CartDataList, function(i, value) {
		var orderDetailList = CartDataList[i].orderDetailList;
		$.each(orderDetailList, function(j, value) {
			if(orderDetailList.length - 1 === j && CartDataList.length - 1 === i) {
				orderIDs += value.ProductID;
			} else {
				orderIDs += value.ProductID + ',';
			}
		});

	});
	var count = 0;
	// 商品中出现多个核心企业，不能通过一个核心企业id获取所有商品信息
	$.each(CartDataList, function(index, value) {
		count ++;
		var GetSearchGoodsList = JSON.stringify({
			UserID: usersObj.UserID,
			GoodsID: orderIDs,
			ResellerID: usersObj.DisID,
			CompanyID: value.CompID
		});
		
		post('ResellerSearchGoodsList', GetSearchGoodsList, function(response) {
			if(response.Result === "T") {
				newOrderDetailList = response.ProductList;
				// 更新数据
				updateCartData();
				count --;
				initCartData(count);
			} else {
				
			}

		});

	});

}



// 初始化购物车
function initCartData(count) {
	if(count !== 0){
		return;
	}
	
	$.each(CartDataList, function(i, ivalue) {
		var title = '<ul class="ui-list ui-border-tb">' +
			'<li class="ui-border-t">' +
			'<div style="width: 35px;">' +
			'<img src="../../images/icon-gs-gray.png" style="width: 0.35rem;margin-top: 0.2rem;" />' +
			'</div>' +
			'<div class="ui-list-info">' +
			'<h4 class="ui-nowrap">' + ivalue.CompName + '</h4>' +
			'</div>' +
			'</li>' +
			'</ul>'

		var shopping_list = '<div class="goods-li s-cart wait-li" id="shopping_list' + i + '">' +
			'</div>'
		// 添加头部
		$('#comp_list').append(title);
		// 添加列表
		$('#comp_list').append(shopping_list);

		$.each(ivalue.orderDetailList, function(j, jvalue) {
			var strbig = '';
			strbig += '<div class="li">' +
				'<div class="opt"><i class="i-circle" onclick="select(this,' + i + ',' + j + ')"></i></div><a>' +
				'<div class="pic"><img src=' + jvalue.imgeUrl + '></div>' +
				'<div class="number">' + jvalue.BarCode + '</div>' +
				'<div class="title2"><label>' + jvalue.SKUName + '</label></div>' +
				'<div class="sum rcolor">¥' + jvalue.Price + '</div></a>' +
				'<div class="acolor"></div></a>' +
				'<div class="wait">' +
				'<i class="a2">本次购买</i><div class="numbe small "><a class="minus" onclick ="minusEvent(this,' + i + ',' + j + ')"></a><input name="" type="text" class="box txtnum" value="' + jvalue.Num + '" ><a  class="add" onclick="plusEvent(this,' + i + ',' + j + ')"></a></div>' +
				'</div>' +
				'</div>'
			$('#shopping_list' + i).append(strbig);
		});
	});
}

/** 更新数据 */
function updateCartData() {
	$.each(CartDataList, function(i, ivalue) {
		var i = 0;
		$.each(ivalue.orderDetailList, function(j, jvalue) {
			$.each(newOrderDetailList, function(k, kvalue) {
				if(jvalue.ProductID === kvalue.ProductID) {
					// 设置显示图片
					if(kvalue.ProductPicUrlList.length !== 0) {
						jvalue['imgeUrl'] = kvalue.ProductPicUrlList[0].PicUrl;
					} else {
						jvalue['imgeUrl'] = '../../images/pic.jpg';
					}
					// 更新sku
					$.each(kvalue.SKUList, function(m, mvalue) {
						if(jvalue.SKUID === mvalue.SKUID) {
							jvalue.Price = mvalue.TinkerPrice; //更新价格
							jvalue['ProductName'] = mvalue.ProductName;
							jvalue['isChecked'] = '0';
							jvalue['isSxChecked'] = '0';
							jvalue['IsDeleteChecked'] = '0';
							jvalue.proInfo = {};
							jvalue['SKUName'] = mvalue.SKUName; //新增商品name
							jvalue['BarCode'] = mvalue.BarCode; //新增商品编号
							jvalue['Inventory'] = mvalue.Inventory; //库存
							jvalue.ValueInfo = mvalue.ValueInfo; //新增属性规格
						}
					});
				}
			});

		});
	});

}

function minusEvent(th, i, j) {
	var num = parseInt($(th).next(".txtnum").val());
	if(num === 1) {
		$(th).next(".txtnum").val(num);
	} else if(num === 0) {
		$(th).next(".txtnum").val(1);
	} else {
		$(th).next(".txtnum").val(num - 1);

	}
	CartDataList[i].orderDetailList[j].Num = parseInt($(th).next(".txtnum").val());
	// 重新计算价格
	calculateAllPrice();
	localStorage.setItem(cartName, JSON.stringify(CartDataList));
}

function plusEvent(th, i, j) {
	var num = parseInt($(th).prev(".txtnum").val());
	if(num >= CartDataList[i].orderDetailList[j].Inventory) {
		$(th).prev(".txtnum").val(parseInt(CartDataList[i].orderDetailList[j].Inventory));
	} else {
		$(th).prev(".txtnum").val(num + 1);
	}
	CartDataList[i].orderDetailList[j].Num = $(th).prev(".txtnum").val() + '';
	// 重新计算价格
	calculateAllPrice();
	localStorage.setItem(cartName, JSON.stringify(CartDataList));
}

/**
 * 单选
 * @param {Object} th
 * @param {Object} index
 */
function select(th, i, j) {
	//设置按钮显示
	if(CartDataList[i].orderDetailList[j].isChecked === '0') {
		$(th).addClass('ok');
		CartDataList[i].orderDetailList[j].isChecked = '1';
	} else {
		$(th).removeClass('ok');
		CartDataList[i].orderDetailList[j].isChecked = '0';
	}
	calculateAllPrice();
}

///** 全选 */
//function selectAll() {
//	if(IsAllChecked) {
//		IsAllChecked = false;
//		$("#shopping_list").find(".opt i").removeClass("ok");
//		$('#isAllChecked').removeClass('ok');
//		// 全不选
//		$('#totalPrice').text('¥0.00')
//	} else {
//		IsAllChecked = true;
//		$("#shopping_list").find(".opt i").addClass("ok");
//		$('#isAllChecked').addClass('ok');
//	}
//	var i = 0;
//	len = CartDataList.length;
//	for(; i < len;) {
//		CartDataList[i].isChecked = IsAllChecked === true ? '1' : '0';
//		i++;
//	}
//	calculateAllPrice();
//}

/** 计算总价 */
function calculateAllPrice() {
	var AllPrice = 0;
	var skunum = 0;
	$.each(CartDataList, function(i, ivalue) {
		$.each(ivalue.orderDetailList, function(j, jvalue) {
			if(jvalue.isChecked === '1') {
				skunum += 1;
				AllPrice += ((parseFloat(jvalue.Num)*10000) * parseFloat(jvalue.Price))/10000;
			}
		});
	});

	// 设置总价
	$('#totalPrice').text('¥' + AllPrice);
	// 设置结算数量
	if(Status) {
		$('#cartSub').text('去结算(' + skunum + ')');
	}
}