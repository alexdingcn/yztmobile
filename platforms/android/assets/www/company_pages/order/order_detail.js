/**
 *  订单详情页面
 * 	@author hxbnzy
 *  @time 2017/07/29
 */
var orderDetail; //订单详情
var rebateInfo = null; //返利信息
var usersObj; //用户信息
var selectDateDom = $('#selectDate');
var showDateDom = $('#showDate');
var yearData;
var monthData;
var dateData;
var orderReceiptNo;

window.onload = function() {
	//		plus.nativeUI.closeWaiting();
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var url = window.location.href; //URL地址
	orderReceiptNo = url.split('id=')[1] || ""; //商品ID
	if(orderReceiptNo === '') {
		orderReceiptNo = sessionStorage.getItem('$receiptNo');
	} else {
		sessionStorage.setItem('$receiptNo', orderReceiptNo);
	}
	var roleDetail = localStorage.getItem('$login_role') || "";
	usersObj = JSON.parse(roleDetail);
	initPageData();
	$('#back').click(function(){
		window.location.href = 'order_list.html?' + Math.random();
	});
	
	$('#orderGoodsInfo').click(function() {
		window.location.href = 'order_goods_info.html?' + Math.random();
	});

	$('#delivery_info').click(function() {
		window.location.href = 'order_delivery_info.html?' + Math.random();
	});

	$('#payment_info').click(function() {
		window.location.href = 'order_payment_info.html?' + Math.random();
	});
}

/**
 * 初始化页面数据
 */
function initPageData() {
	$('#pop_order_remark').hide();
	$('#pop_post_fee').hide();
	$('#pop_order_rebate').hide();
	$('#pop_order_disuse').hide();
	$('#pop_order_audit').hide();
	//	plus.nativeUI.closeWaiting();//关闭系统等待对话框
	selectDate(false); //初始化时间选择器
	//获取核心企业图标统计
	var CompySta = JSON.stringify({
		CompanyID: usersObj.CompID,
		CreateDate: '',
		Phone: '',
		ReceiptNo: orderReceiptNo,
		UserID: usersObj.UserID
	});

	post('GetCompanyOrderDetail', CompySta, function(response) {
		if(response.Result === "T") {
			orderDetail = response.Order;
			//将当前订单临时保存
			sessionStorage.setItem('$order_info', JSON.stringify(response.Order));
//			//获取可用最大返利
//			getRebateSum();
			//设置数据
			setData(orderDetail);
			//根据Ostate设置显示页面
			setLayout(orderDetail.Ostate);
			orderEditorBindEvents();
			initPop();
		} else {

		}
		setTimeout(function() {
			$('#loading').hide();
		}, '500');
	});

}

///**
// * 获取订单可用返利
// */
//
//function getRebateSum() {
//	//获取经销商可用返利
//	var RebateRequest = JSON.stringify({
//		ResellerID: orderDetail.DisID,
//		OrderID: orderDetail.OrderID,
//	});
//
//	post('GetRebate', RebateRequest, function(response) {
//		if(response.Result === "T") {
//			rebateInfo = response;
//			//设置返利弹出框 返利总金额
//			$('#available_rebates').text('¥' + rebateInfo.RebateSum);
//
//		} else {
//
//		}
//	});
//}

/**
 * 初始化弹窗
 */
function initPop() {

	//弹窗-修改使用返利
	$('#available_rebates').text('¥' + orderDetail.Rebate); //可用返利

	$('#order_rebate_cancel').on('click', function() {
		$('#pop_order_rebate').hide();
	});
	$('#order_rebate_close').on('click', function() {
		$('#pop_order_rebate').hide();
	});

	$('#order_rebate_confirm').on('click', function() {
		var thisRebate = $('#this_rebate').val();
		if(rebateInfo === null) {
			console.log('返利可使用金额获取失败');
			$('#pop_order_rebate').hide();
		}
		if(rebateInfo.RebateSum < thisRebate) {
			console.log('返利金额超出可使用金额');
			return;
		}
		orderDetail.Rebate = thisRebate;
		$('#pop_order_rebate').hide();
		BuildPrice();
	});

	//弹窗-修改运费

	$('#post_fee_close').on('click', function() {
		$('#pop_post_fee').hide();
	});

	$('#post_fee_cancel').on('click', function() {
		$('#pop_post_fee').hide();
	});

	$('#post_fee_confirm').on('click', function() {
		var this_postfee = $('#this_postfee').val();
		orderDetail.PostFee = this_postfee;
		$('#pop_post_fee').hide();
		BuildPrice();
	});
	//弹窗-订单备注
	$('#order_remark_cancel').on('click', function() {
		$('#pop_order_remark').hide();
	});

	$('#order_remark_close').on('click', function() {
		$('#pop_order_remark').hide();
	});

	$('#order_remark_confirm').on('click', function() {
		var order_remark_content = $('#order_remark_content').val();
		orderDetail.OrderRemark = order_remark_content;
		$('#order_remark_content').text(orderDetail.OrderRemark); //更新输入框默认订单备注
		$('#order_remark').text(orderDetail.OrderRemark); //更新详情页订单备注
		$('#pop_order_remark').hide();
	});
	//弹窗-订单审核
	$('#order_audit_cancel').on('click', function() {
		$('#pop_order_audit').hide();
	});

	$('#order_audit_confirm').on('click', function() {
		var approveList = new Array();
		var approve = {
			ReceiptNo: orderDetail.ReceiptNo,
			Approve: '0', //0审核通过 1 审核拒绝
			ApproveText: ''
		}
		approveList.push(approve);
		var SubCompanyApprove = JSON.stringify({
			UserID: usersObj.UserID,
			CompanyID: usersObj.CompID,
			ApproveList: approveList
		});

		post('SubCompanyApprove', SubCompanyApprove, function(response) {
			if(response.Result === "T") {
				//订单审核成功,刷新界面
				window.location.reload();

			} else {
				//作废失败
				$('#pop_order_audit').hide();
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				});
			}
		});
	});

	//弹窗-订单作废
	$('#order_disuse_cancel').on('click', function() {
		$('#pop_order_disuse').hide();
	});

	$('#order_disuse_confirm').on('click', function() {
		var CancelOrderRequest = JSON.stringify({
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			OrderID: orderDetail.OrderID,
			ts: orderDetail.ts
		});

		post('CancelOrder', CancelOrderRequest, function(response) {
			if(response.Result === "T") {
				//订单作废成功,刷新界面
				window.location.reload();

			} else {
				//作废失败
				$('#pop_order_disuse').hide();
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});
	});

	//未审核订单作废
	$('#order_disuse').on('click', function() {
		$('#pop_order_disuse').show();
	});

	//未审核 审核
	$('#order_check').on('click', function() {
		$('#pop_order_audit').show();

	});

}

/**
 * 修改返利、运费
 * 重新计算应付总额
 * 订单价格
 * 应付 = 总额 - 促销优惠 - 返利 + 运费
 */
function BuildPrice() {
	var discount_amount = orderDetail.ProInfo.OrderPrice === '' ? '0' : orderDetail.ProInfo.OrderPrice;
	orderDetail.AuditTotalAmount = parseFloat(orderDetail.TotalAmount) - parseFloat(discount_amount) - parseFloat(orderDetail.Rebate) + parseFloat(orderDetail.PostFee);
	//  console.log('价格为'+orderDetail.AuditTotalAmount);

	//刷新页面价格
	$('#total_amount').text('￥' + orderDetail.TotalAmount); //商品总额
	$('#discount_amount').text('￥' + discount_amount); //促销优惠
	$('#order_rebate').text('￥' + orderDetail.Rebate); //返利抵扣
	$('#post_fee').text('￥' + orderDetail.PostFee); //运费
	$('#audit_total_amount').text('￥' + orderDetail.AuditTotalAmount); //应付总额
	$('#postfee').text('￥' + orderDetail.PostFee); //弹窗运费
	$('#this_rebate').text('￥' + orderDetail.Rebate); //弹窗返利

	sessionStorage.setItem('$order_info', orderDetail); //更新本地保存订单内容

}

/**
 * 订单未审核 绑定/取消 事件
 */
function orderEditorBindEvents(isBindEditorEvents) {
	if(isBindEditorEvents) {
//		//修改使用返利
//		$("#img_order_rebate").on('click', function() {
//			$('#pop_order_rebate').show();
//		});
		//修改运费
		$("#img_post_fee").on('click', function() {
			$('#pop_post_fee').show();
		});
		var myDate = new Date();
		var dateYear = myDate.getFullYear();
		var dateMonth = (myDate.getMonth() + 1);
		if(dateMonth >= 1 && dateMonth <= 9) {
			dateMonth = "0" + dateMonth;
		}

		var dateDay = myDate.getDate();
		var startDate = dateYear + '-' + dateMonth + '-' + dateDay;
		//交货日期
		$("#selectDate").on('click', function() {
			weui.datePicker({
				start: startDate,
				end: '2050-12-29',
				defaultValue: [dateYear, dateMonth, dateDay],
				onChange: function(result) {

				},
				onConfirm: function(result) {
					//				$('#delivery_date').text(result[0].value + '-' + result[1].value + '-' + result[2].value);

					$('#showDate').text(result[0].value + '-' + result[1].value + '-' + result[2].value);
					orderDetail.ArriveDate = $('#showDate').text();
				},
				id: 'datePicker'
			});

		});
		//配送方式
		$("#li_giveMode").on('click', function() {
			//			selectGiveMode();

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
		//订单备注
		$("#li_order_remark").on('click', function() {
			$('#pop_order_remark').show();
		});
		//收货地址
		$("#li_address").on('click', function() {
			console.log('点击了我')
		});
		//发票、开票信息
		$('#invoice_modif').on('click', function() {
			window.location.href = 'invoice_modification.html?' + Math.random();
		});
	} else {
		$("#order_rebate").unbind('click');
		$("#li_arriveDate").unbind('click');
		$('#invoice_modif').unbind('click');
	}

	//修改收货信息
	$('#receipt_info').on('click', function() {
		window.location.href = 'modify_receipt_info.html?' + Math.random();
	});

	//修改发货信息
	$('#invoice_info').on('click', function() {
		window.location.href = 'invoice_modification.html?' + Math.random();
	});

}

/**
 * 设置数据
 */
function setData(orderDetail) {
	$('#productNum').text(orderDetail.OrderDetailList.length + '种'); //设置商品种类数
	$('#receiptNo').text(orderDetail.ReceiptNo); //订单编号
	$('#compName').text(orderDetail.DisName); //公司信息
	$('#createDate').text(orderDetail.CreateDate); //订单创建日期
	$('#showDate').text(orderDetail.ArriveDate);
	$('#giveMode').text(orderDetail.GiveMode); //配送方式
	$('#order_remark').text(orderDetail.Order_Remark); //订单备注
	$('#address').text(orderDetail.Address); //收货地址
	
	switch(orderDetail.Invoice.IsOBill) {
		case "0":
			$('#invoicing').text('不开发票')
			break;
		case "1":
			$('#invoicing').text('普通发票');
			break;
		case "2":
			$('#invoicing').text('增值税发票')
			break;
	}

	if(orderDetail.Invoice.IsBill === '0') { //未完成
		$('#invoice').text('是否已开完: 否');
	} else {
		$('#invoice').text(orderDetail.Invoice.BillNo + "     是否已开完: 是");
	}
	$('#total_amount').text('￥' + orderDetail.TotalAmount); //商品总额
	var discount_amount = orderDetail.ProInfo.OrderPrice === '' ? '0.00' : orderDetail.ProInfo.OrderPrice;
	$('#discount_amount').text('￥' + discount_amount); //促销优惠
	$('#order_rebate').text('￥' + orderDetail.Rebate); //返利抵扣
	$('#this_rebate').text('￥' + orderDetail.Rebate); //弹窗返利
	$('#post_fee').text('￥' + orderDetail.PostFee); //运费
	$('#postfee').text('￥' + orderDetail.PostFee); //弹窗运费
	$('#audit_total_amount').text('￥' + orderDetail.AuditTotalAmount); //应付总额
	$('#order_remark').text(orderDetail.OrderRemark); //订单备注
	$('#order_remark_content').text(orderDetail.OrderRemark); //输入框订单备注
	//设置商品列表
	var strbig = "";
	//	$("#goods_list").html("");
	//遍历商品  追加到列表
	$.each(orderDetail.OrderDetailList, function(n, value) {
		var imgurl = "../../images/pic.jpg";
		if(value.ProductPicUrlList.length > 0)
			imgurl = value.ProductPicUrlList[0].PicUrl
		strbig += '<div class="li">' +
			'<div class="opt"><i class="i-circle ok"></i></div>' +
			'<div class=pic><a><img src=' + imgurl + '></a></div>' +
			'<div class=number>编号:' + value.BarCode + '<i class=mon></i></div>' +
			//'<div class=number>编号:' + value.BarCode + '<i class=mon>' + value.Inventory+ '</i></div>' +
			'<div class=number>名称:' + value.SKUName + '</div>' +
			'<div class=number>规格:' + value.ValueInfo + '<i class=size>x' + parseInt(value.Num) + '</i></div>' +
			(value.Remark ? '<div class=number acolor>备注:' + value.Remark + '</div>' : '') +
			'</div>'
	});

	$("#goods_list").append(strbig)
}

/**
 * Ostate 设置当前页面 
 */
function setLayout(Ostate) {
	switch(Ostate) {
		case '1': //未审核

			$("#ostate").text('未审核')
			$("#order_check").show();
			$("#order_disuse").show();
			$("#receipt_info").hide();
			$("#invoice_info").hide();
			$('#employ').text('修改');
			$("#receipt_info").hide();
			$("#invoice_info").hide();
			$("#delivery_info").hide();
			$("#payment_info").hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();

			//未审核订单 修改操作
			$('#employ').on('click', function() {

				if($('#employ').text() === '修改') {
					$('#employ').text('保存');
//					$("#img_order_rebate").show();
					$("#img_post_fee").show();
					$("#disuse_check").hide();
					orderEditorBindEvents(true);

				} else {
					//提交保存
					var EditOrderRequest = JSON.stringify({
						UserID: usersObj.UserID,
						CompID: usersObj.CompID,
						ResellerID: '',
						Order: orderDetail
					});
					post('EditComPanyOrder', EditOrderRequest, function(response) {
						if(response.Result === "T") {
//							//订单修改成功
//							$("#img_order_rebate").hide();
//							$("#img_post_fee").hide();
//							$('#employ').text('修改');
//							$("#disuse_check").show();
//							orderEditorBindEvents(false);
							$.tips({
								content: response.Description,
								stayTime: 2000,
								type: "success"
							});
							setTimeout(function(){
								window.location.reload();
							},'2000');
						} else {
							$.tips({
								content: response.Description,
								stayTime: 3000,
								type: "warn"
							});
						}
					});

				}
			});
			break;
		case '2': //已审核
			$('#ostate').text('待发货');
			$('#employ').hide();
			$("#order_check").hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			break;
		case '3': //退货处理
			$("#ostate").text('退货处理');
			$("#order_disuse").text('退货审核');
			$("#order_check").hide();
			$("#order_disuse").show();
			$('#employ').hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			$("#receipt_info").hide();
			break;
		case '4': //待收货
			$("#order_check").hide();
			$('#ostate').text('待收货');
			$("#disuse_check").hide();
			$('#employ').hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			$("#receipt_info").hide();
			break;
		case '5': //已完成
			$("#order_check").hide();
			$('#ostate').text('已完成');
			$('#employ').hide();
			$("#receipt_info").hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			break;
		case '6': //已作废
			$("#order_check").hide();
			$('#ostate').text('已作废');
			$("#receipt_info").hide();
			$("#invoice_info").hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			$("#disuse_check").hide();
			$('#employ').hide();
			break;
		case '7': //已完成
			$("#order_check").hide();
			$('#ostate').text('已退货');
			$('#employ').hide();
			$("#receipt_info").hide();
			$("#invoice_info").hide();
//			$("#img_order_rebate").hide();
			$("#img_post_fee").hide();
			break;
	}
}