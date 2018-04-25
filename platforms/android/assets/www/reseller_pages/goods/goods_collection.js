/**
 *  经销商收藏列表
 * 	@author hxbnzy
 *  @time 2017/08/15
 */
var usersObj;
var ProductList;
var criticalID = '-1';

$(function() {
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#shoppingCart').click(function(){
		window.location.href = 'shopping_cart.html?'+Math.random();
	});

	//获取商品收藏列表
	$('#content').dropload({
		scrollArea: window,
		domUp: {
			domClass: 'dropload-up',
			domRefresh: '<div class="dropload-refresh">下拉刷新</div>',
			domUpdate: '<div class="dropload-update">释放更新</div>',
			domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
		},
		domDown: {
			domClass: 'dropload-down',
			domRefresh: '<div class="dropload-refresh">上拉加载更多</div>',
			domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
			domNoData: '<div class="dropload-noData">小陌没有查询到更多数据哦~</div>'
		},
		loadUpFn : function(me){
			
		},

		loadDownFn: function(me) {
			var result = '';
			if(typeof(ProductList) !== "undefined") {
				criticalID = ProductList[ProductList.length - 1].ProductID;
			}
			var GetCollectList = JSON.stringify({
				CriticalProductID: criticalID,
				ResellerID: usersObj.DisID,
				UserID: usersObj.UserID,
				GetType: '1',
				Rows: '10',
				Sort: '0'
			});

			//设置加载动画显示时间
			setTimeout(function() {
				post('GetCollectList', GetCollectList, function(response) {
					if(response.Result === "T") {
						var list = response.ProductList;
						if(list !== null && list.length > 0) {
							if(typeof(ProductList) !== "undefined") {
								ProductList = mergerArrayList(ProductList, list);
							} else {
								ProductList = list;
							}
						} else {
							me.resetload(); //dropload 重置
							return;
						}

						var str = '';
						$.each(list, function(index, value) {
							var imgurl = "../../images/pic.jpg";
							if(value.ProductPicUrlList.length > 0)
								imgurl = value.ProductPicUrlList[0].PicUrl
							str += '<div class="li">' +
								"<a href=\"goods_detail.html?random="+Math.random()+ "gid=" + value.ProductID + "\">" +
								'<div class="pic"><img src=' + imgurl + '></div>' +
								'<div class="number">' + value.ProductID + '</div>' +
								'<div class="title">' + value.ProductName + '</div>' +
								'<div class="sum rcolor">¥' + value.SalePrice + '</div>' +
								'</a>' +
								'<i class="i-delete" onclick="collectProductDel(this,' + index + ')">删除</i>' +
								'</div>'

						});
						$('#productList').append(str);
						if(list.length !== 10) {
							// 锁定
							me.lock();
							// 无数据
							me.noData();
							me.resetload(); //dropload 重置
						} else {
							me.resetload(); //dropload 重置
						}
					} else {
						me.resetload();
					}
				});
			}, 500);
		},
		threshold: 50
	});

});

/**
 * 加载列表
 * @param {Object} type 加载类型
 */
function loadingList(type, me) {

	if(typeof(ProductList) !== "undefined") {
		if(type === '1') {
			criticalID = ProductList[ProductList.length - 1].ProductID;
		} else {
			criticalID = ProductList[0].ProductID;
		}
	}
	var GetCollectList = JSON.stringify({
		CriticalProductID: criticalID,
		ResellerID: usersObj.DisID,
		UserID: usersObj.UserID,
		GetType: type,
		Rows: rows,
		Sort: '0'
	});

	//设置加载动画显示时间
	setTimeout(function() {
		post('GetCollectList', GetCollectList, function(response) {
			if(response.Result === "T") {
				if(type === '1') {
					//列表首次加载 无数据返回
					if(criticalID === '-1' && response.ProductList.length === 0) {
						// 锁定
						me.lock();
						// 无数据
						me.noData();
						me.resetload();
						return;
					}
					updateData(response.ProductList, me);
				} else {
					updateData(response.ProductList, me);
				}
			} else {
				me.resetload();
			}
		});
	}, 500);
}

/**
 * 更新数据，刷新预付款列表
 * @param {Object} list 列表数据
 * @param {Object} me dropload回调
 */
function updateData(list, me) {
	if(list !== null && list.length > 0) {
		if(typeof(ProductList) !== "undefined") {
			if(getType === '0') {
				ProductList = mergerArrayList(list, ProductList);
				//				list.concat(ProductList);
				//				ProductList = list;

			} else if(getType === '1') {
				ProductList = mergerArrayList(ProductList, list);
				//				ProductList.concat(list);
			} else {
				ProductList = list;
			}
		} else {
			ProductList = list;
		}

	} else {
		me.resetload(); //dropload 重置
		return;
	}
	var str = '';
	$.each(list, function(index, value) {
		var imgurl = "../../images/pic.jpg";
		if(value.ProductPicUrlList.length > 0)
			imgurl = value.ProductPicUrlList[0].PicUrl
		str += '<div class="li">' +
			'<a href="javascript">' +
			'<div class="pic"><img src=' + imgurl + '></div>' +
			'<div class="number">' + value.ProductID + '</div>' +
			'<div class="title">' + value.ProductName + '</div>' +
			'<div class="sum rcolor">¥' + value.SalePrice + '</div>' +
			'</a>' +
			'<i class="i-delete" onclick="collectProductDel(this,' + index + ')">删除</i>' +
			'</div>'

	});
	//刷新列表
	if(getType === '1') {
		$('#productList').append(str);
	} else {
		$('#productList').prepend(str);
	}

	if(list.length !== 10) {
		// 锁定
		me.lock();
		// 无数据
		me.noData();
		me.resetload(); //dropload 重置
	} else {
		me.resetload(); //dropload 重置
	}
}

/**
 * 收藏删除
 */
function collectProductDel(th, index) {
	var SetCollect = JSON.stringify({
		GoodsID: ProductList[index].ProductID,
		ResellerID: usersObj.DisID,
		Type: '0',
		UserID: usersObj.UserID
	});

	post('SetCollect', SetCollect, function(response) {
		if(response.Result === "T") {
			window.location.reload();
		} else {
			
		}
	});
}