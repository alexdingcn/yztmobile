/**
 *  修改收货信息
 * 	@author hxbnzy
 *  @time 2017/08/07
 */
var orderDetail;
var usersObj;
var selectDateDom = $('#selectDate');
var showDateDom = $('#showDate');

window.onload = function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	init();
}

function init() {
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#showDate').text(orderDetail.ArriveDate); //交货日期
	$('#order_remark').val(orderDetail.OrderRemark); //订单备注
	$('#address').text(orderDetail.Address); //收货地址
	$('#giveMode').text(orderDetail.GiveMode); //配送方式
	//配送方式
	$('#give_Mode').on('click', function() {
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

	//保存收货信息修改
	$('#employ').on('click', function() {
		orderDetail.OrderRemark = $('#order_remark').val();
		orderDetail.ArriveDate = $('#showDate').text();
		orderDetail.GiveMode = $('#giveMode').text();
		//提交保存
		var EditOrderRequest = JSON.stringify({
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			ResellerID: '',
			Order: orderDetail
		});

		post('EditComPanyOrder', EditOrderRequest, function(response) {
			if(response.Result === "T") {
				$.tips({
					content: '收货信息保存成功',
					stayTime: 3000,
					type: "success"
				})
				setTimeout(function() {
					history.go(-1);
				}, '1000')
			} else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				})
			}
		});
	});

	$('#shopAddres').click(function() {
		window.location.href = 'modif_shipping_address.html?' + Math.random();
	});
	var myDate = new Date();
	var dateYear = myDate.getFullYear();
	var dateMonth = (myDate.getMonth() + 1);
	if(dateMonth >= 1 && dateMonth <= 9) {
		dateMonth = "0" + dateMonth;
	}
	var dateDay = myDate.getDate();
	//交货日期
	$('#selectDate').on('click', function() {
		var myDate = new Date();
		//获取当前年
		var year = myDate.getFullYear();
		//获取当前月
		var month = myDate.getMonth() + 1;
		//获取当前日
		var date = myDate.getDate();
		var now = year + '-' + p(month) + "-" + p(date)
		new DatePicker({
			"type": "3", //0年, 1年月, 2月日, 3年月日(默认为3)
			"title": '请选择交货日期', //标题（可选）
			"maxYear": "", //最大年份（可选）
			"minYear": "", //最小年份（可选）
			"separator": "-", //日期分割符(可选)(默认为'/')
			"defaultValue": now, //默认值：根据分隔符分隔开（可选）
			"callBack": function(val) {
				//回调函数（val为选中的日期）
				// 可在此处设置显示选中的值
				self.nowVal = val;
				$('#showDate').text(val);
			}
		});
		//		weui.datePicker({
		//			start: dateYear+'-'+dateMonth+'-'+dateDay,
		//			end: '2030-12-29',
		//			defaultValue: [dateYear, dateMonth, dateDay],
		//			onChange: function(result) {
		//
		//			},
		//			onConfirm: function(result) {
		//				$('#showDate').text(result[0].value + '-' + result[1].value + '-' + result[2].value);
		//			},
		//			id: 'datePicker'
		//		});

	});
}

function p(s) {
	return s < 10 ? '0' + s : s;
}