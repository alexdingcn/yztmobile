/**
 *  经销商订单提交
 * 	@author hxbnzy
 * 	获取收货地址 -> 获取系统配置项 -> if 设置返利 -> 生成预订单 -> 订单提交 -> 结果页面
 *  @time 2017/08/17
 */

var usersObj;
var orderSubGoods;
var CheckList;
var arriveDate;
var DisAddressID;
var OrderDetailList;

$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html');
	usersObj = JSON.parse(roleDetail);
	orderSubGoods = JSON.parse(sessionStorage.getItem('$order_sub_goods'));
	orderReceiptAddress();
	selectDate();

	// 配送方式
	$('#select_giveMode').on('click', function() {
		weui.actionSheet([{
			label: '请选择配送方式',
		}, {
			label: '送货',
			onClick: function() {
				$('#giveMode').text('送货')
			}
		}, {
			label: '自提',
			onClick: function() {
				$('#giveMode').text('自提')
			}
		}], [{
			label: '取消',
			onClick: function() {

			}
		}], {
			className: "custom-classname"
		});
	});

	// 订单提交
	$('#subOrder').on('click', function() {
		if(CheckList === null || CheckList.length === 0) {
			return;
		}
		// 开票信息		
		// 由于页面要进行跳转 暂时没有做改功能 默认不开发票
		var BillInfo = {
			Content: "", //开票内容
			DisID: usersObj.DisID + '', //经销商ID
			IsOBill: '0', //是否开票
			OAccount: '', //开户账号
			OBank: '', //开户银行
			Rise: '', //发票抬头
			TRNumber: '' //纳税人登记号
		}

		var OrderList = new Array();
//		orderSubGoods[0].Num = orderSubGoods[0].Num + '';
//		orderSubGoods[0].SumAmount = orderSubGoods[0].SumAmount + '';
		var SumAmount = 0;
		$.each(OrderDetailList,function(i,value){
			SumAmount += parseFloat(value.SumAmount);
		});
		
		var Order = {
			AddType: '3', //提交类型（3：经销商下单 4：核心企业下单）
			AddrID: DisAddressID, //收货地址ID
			ArriveDate: $('#delivery_date').text(), //要求发货日期
			BillInfo: BillInfo,
			CompID: usersObj.CompID + '', //核心企业ID
			GiveMode: $('#giveMode').text(), //配送方式
			OrderDetailList: OrderDetailList,
			OrderRemark: $('#order_remark').text(), //订单备注
			Otype: '0', //订单类型 (s  1：销售赊销订单 2、特价申请订单（兼容赠品订单，单价为0）)
			Rebate: '0', //使用的返利
			ReceiptNo: '', //订单号
			SubType: '0', //提交方式（0：新下订单 1：编辑订单）
			TotalAmount: SumAmount //合计
		}

		OrderList.push(Order);
		//
		var SubResellerOrder = JSON.stringify({
			OrderList: OrderList,
			ResellerID: usersObj.DisID + '',
			UserID: usersObj.UserID + ''
		});

		post('SubResellerOrder', SubResellerOrder, function(response) {
			if(response.Result === 'T') {

				// 获取本地购物车数据
				var cartName = '$' + usersObj.UserID + usersObj.DisID;
				var CartDataList = JSON.parse(localStorage.getItem(cartName) || "[]");;
				var successList = response.OrderList[0].OrderDetailList;

				// 购物车删除
				for(var i = 0; i < CartDataList.length; i++) {
					var orderDetailList = CartDataList[i].orderDetailList;
					for(var j = 0; j < orderDetailList.length; j++) {
						for(var k = 0; k < successList.length; k++) {
							if(successList[k].SKUID === orderDetailList[j].SKUID) {
								if(parseInt(successList[k].Num) === parseInt(orderDetailList[j].Num)) {
									// 如果提交订单商品数与购物车数量一致
									// 删除本地购物车商品
									CartDataList[i].orderDetailList.splice(j, 1);
								} else {
									CartDataList[i].orderDetailList[j].Num = parseInt(orderDetailList[j].Num) - parseInt(successList[k].Num);
								}
							}
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

				//				var i = 0;
				//				successlen = successList.length;
				//				for(; i < successlen;) {
				//					var j = 0;
				//					shopCartlen = shopCartList.length;
				//					for(; j < shopCartlen;) {
				//						if(successList[i].SKUID === shopCartList[j].SKUID) {
				//							if(parseInt(successList[i].Num) === parseInt(shopCartList[j].Num)) {
				//								// 如果提交订单商品数与购物车数量一致
				//								// 删除本地购物车商品
				//								shopCartList.splice(j, 1);
				//								j--;
				//								shopCartlen--;
				//							} else {
				//								shopCartList[j].Num = parseInt(shopCartList[j].Num) - parseInt(successList[i].Num);
				//							}
				//						}
				//						j++;
				//					}
				//					i++;
				//				}

				localStorage.setItem(cartName, JSON.stringify(CartDataList));
				//订单提交成功
				window.location.href = 'successful_sub.html?' + Math.random();
			} else {
				//				el = $.tips({
				//					content: response.Description,
				//					stayTime: 3000,
				//					type: "warn"
				//				});
				weui.topTips(response.Description, {
					duration: 3000,
					className: "custom-classname",
					callback: function() {
						console.log('close');
					}
				});
			}
		});

	});
});

/** 交货日期 */
function selectDate() {
	var myDate = new Date();
	var dateYear = myDate.getFullYear();
	var dateMonth = (myDate.getMonth() + 1);
	if(dateMonth >= 1 && dateMonth <= 9) {
		dateMonth = "0" + dateMonth;
	}

	var dateDay = myDate.getDate();
	var startDate = dateYear + '-' + dateMonth + '-' + dateDay;
	console.log('startDate============================' + startDate);
	// 日期选择
	$('#selectDate').on('click', function() {
		new DatePicker({
			"type": "3", //0年, 1年月, 2月日, 3年月日(默认为3)

			"title": '请选择交货日期', //标题（可选）

			"maxYear": "", //最大年份（可选）

			"minYear": "", //最小年份（可选）

			"separator": "-", //日期分割符(可选)(默认为'/')

			"defaultValue": startDate, //默认值：根据分隔符分隔开（可选）

			"callBack": function(val) {
				//回调函数（val为选中的日期）
				// 可在此处设置显示选中的值
				self.nowVal = val;
				$('#delivery_date').text(val);
			}
		});
	});

}

/** 订单收货地址 */
function orderReceiptAddress() {
	var GetResellerAddressList = JSON.stringify({
		UserID: usersObj.UserID,
		ResellerID: usersObj.DisID,
		CompanyID: ''
	});
	post('GetResellerShippingAddressList', GetResellerAddressList, function(response) {
		if(response.Result === "T") {
			// 设置收货地址 默认选取列表首个地址
			DisAddressID = response.DisAddressList[0].DisAddressID;
			//			disAdress = response.DisAddressList[0];
			$('#address').text(response.DisAddressList[0].Principal + ' ' + response.DisAddressList[0].Phone);
			sysConfig(); //获取系统配置项
			// 设置地址列表数据
			initDisAdressList(response.DisAddressList);
		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {

				}
			});
		}
	});

}

/** 收货地址 */
function initDisAdressList(list) {
	var disAddressList = new Array();
	//			address = {
	//				label: '全部',
	//				value: '0'
	//			};
	//			resellerList.push(reseller);
	$.each(list, function(index, item) {
		address = {
			label: item.Address,
			value: item.DisAddressID
		};
		disAddressList.push(address);
	});

	$('#selectAddress').on('click', function() {
		weui.picker(disAddressList, {
			defaultValue: [0],
			className: 'custom-classname',
			onChange: function(result) {

			},
			onConfirm: function(result) {
				$.each(list, function(index, item) {
					DisAddressID = result[0].value;
					if(item.DisAddressID === result[0].value) {
						$('#address').text(item.Principal + ' ' + item.Phone);
					}
				});

			},
			id: 'picker'
		});
	});

}

/** 获取系统配置项 */
function sysConfig() {
	//获取系统配置项
	var GetConfiguration = JSON.stringify({
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
		ResellerID: usersObj.DisID
	});

	post('GetConfiguration', GetConfiguration, function(response) {
		if(response.Result === "T") {
			//返利功能待完成
			//生成预订单
			reservationOrder();
		} else {

		}

	});
}

/** 订单开启返利 */
function orderRebate() {

}

/** 生成预订单 */
function reservationOrder() {
	CheckList = new Array();
	var goodsList = new Array();
	$.each(orderSubGoods, function(index, value) {

		var goods = {
			SKUID: value.SKUID,
			Num: value.Num,
		}
		goodsList.push(goods);

	});

	var CheckOrder = {
		ReceptNO: '',
		DisID: usersObj.DisID,
		CompID: usersObj.CompID,
		Rebate: '0',
		CheckList: goodsList
	}
	CheckList.push(CheckOrder);

	var GetOrderCheckRequest = JSON.stringify({
		UserID: usersObj.UserID,
		CheckOrderList: CheckList
	});

	post('GetOrderCheckList', GetOrderCheckRequest, function(response) {
		if(response.Result === "T") {
			updateOrderInfo(response.CheckList); //更新订单信息

		} else {
			//			el = $.tips({
			//				content: response.Description,
			//				stayTime: 3000,
			//				type: "warn"
			//			})
			setTimeout(function(){
				history.back();
			},3000);
			
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {
					//					console.log('close');
				}
			});

		}

	})
}

/** 根据预订单更新订单提交信息 */
function updateOrderInfo(CheckList) {
	var str = '';
	OrderDetailList = CheckList[0].OrderDetailList;
	//加载商品列表
	$.each(OrderDetailList, function(index, value) {
		var imgeUrl;
		if(value.ProductPicUrlList !== null && value.ProductPicUrlList !== 0) {
			imgeUrl = value.ProductPicUrlList[0];
		} else {
			imgeUrl = '../../images/pic.jpg';
		}

		str += '<div class="li">' +
			'<div class="opt"><i class="i-circle ok"></i></div>' +
			'<div class="pic"><a><img src=' + orderSubGoods[index].imgeUrl + '></a></div>' +
			'<div class="number">编号: ' + orderSubGoods[index].BarCode + ' <i class="mon">¥' + value.TinkerPrice + '</i></div>' +
			//			'<div class="number">名称: ' + orderSubGoods[index].ProductName + '</div>' +
			'<div class="number">名称: ' + orderSubGoods[index].SKUName + '</div>' +
			'<div class="number">类别: ' + substringOmit(orderSubGoods[index].ValueInfo, 20, "…") + '<i class="size">数量: 	X' + value.Num + '</i></div>' +
			'<div class="number">库存: ' + orderSubGoods[index].Inventory + '</div>' +
			'</div>'
	});

	$('#goods_list').append(str);
	$('#auditTotalAmount').text('¥' + CheckList[0].AuditTotalAmount);

}