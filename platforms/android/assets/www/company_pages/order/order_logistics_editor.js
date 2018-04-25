/**
 *  物流信息编辑
 * 	@author hxbnzy
 *  @time 2017/08/08
 */
var OrderSendGoodsInfo;
var UnSendoutDetailList;
var usersObj;
var LogisticsChoiceList;
var orderDetail;
window.onload = function() {
	FastClick.attach(document.body);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	init();
}

function init() {
	$('#pop_logistics_company').hide();
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	OrderSendGoodsInfo = JSON.parse(sessionStorage.getItem('$OrderSendGoodsInfo'));
	UnSendoutDetailList = OrderSendGoodsInfo.UnSendoutDetailList;
	$('#logistics_company').on('click', function() {
		$('#pop_logistics_company').show();
	});
	$('#pop_close').on('click', function() {
		$('#pop_logistics_company').hide();
	});
	//发货
	$('#employ').on('click', function() {
		var i = 0;
		len = UnSendoutDetailList.length;
		var OrderdetailList = new Array();
		var ReceiptNoList = new Array();
		for(; i < len;) {
			if(UnSendoutDetailList[i].IsChecked === '1') {
				var Orderdetail = {
					IsChecked: UnSendoutDetailList[i].IsChecked,
					Num: UnSendoutDetailList[i].DeliverGoods + '',
					ProductID: UnSendoutDetailList[i].OrderOutDetailInfo.ProductID,
					SKUID: UnSendoutDetailList[i].SKUID
				}
				OrderdetailList.push(Orderdetail);
			}
			i++;
		}

		var ReceiptNo = {
			Car: $('#license_plate_num').val(),
			CarNo: $('#drivers_phone').val(),
			CarUser: $('#drivers_name').val(),
			ComPCode: '',
			ComPName: $('#logistics_company_name').val(),
			LogisticsNo: $('#logistics_no').val(),
			OrderdetailList: OrderdetailList,
			ReceiptNo: orderDetail.ReceiptNo
		}

		ReceiptNoList.push(ReceiptNo);

		//提交发货
		var SubProduct = JSON.stringify({
			UserID: usersObj.UserID,
			CompanyID: usersObj.CompID,
			ReceiptNoList: ReceiptNoList,
		});

		post('SubProduct', SubProduct, function(response) {
			if(response.Result === "T") {
				window.location.href = 'order_delivery_info.html?' + Math.random();
			} else {

			}
		});

	});
	//获取支持物流公司列表
	var GetLogisticsList = JSON.stringify({
		UserID: usersObj.UserID,
		CompanyID: usersObj.CompID,
	});

	post('GetLogisticsList', GetLogisticsList, function(response) {
		if(response.Result === "T") {
			LogisticsChoiceList = response.LogisticsChoiceList
			//加载列表
			loadLogistics();
		} else {

		}
	});

}

function loadLogistics() {
	var obj = {
		LogisticsCode: '',
		LogisticsName: '无'
	};
	LogisticsChoiceList.unshift(obj);
	strbig = '';
	$.each(LogisticsChoiceList, function(index, value) {
		strbig += '<li >' + value.LogisticsName + '<div class="opt"><i class="i-circle" onclick="select(this,' + index + ')"></i></div></li>'
	});

	$('#logistics_company_list').append(strbig);
}

function select(th, index) {
	//清空按钮选中
	$('#logistics_company_list').find(".opt i").removeClass("ok");
	$(th).addClass('ok');
	$('#logistics_company_name').text(LogisticsChoiceList[index].LogisticsName);

}