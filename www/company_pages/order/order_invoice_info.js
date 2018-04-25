var orderDetail;
var isComplete;
var usersObj;
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
	$('#billNo').text(orderDetail.Invoice.BillNo);
	isComplete = orderDetail.Invoice.IsBill;
	//设置按钮选中
	if(isComplete === '1') {
		$('#isComplete').addClass('ok');
	}

	$('#isComplete').on('click', function() {
		$('#isComplete').removeClass('i-circle ok');
		if(isComplete === '1') {
			isComplete = '0';
			//			$.tips({
			//				content: '发票信息修改成功',
			//				stayTime: 3000,
			//				type: "warn"
			//			})
			$('#isComplete').addClass('i-circle');
		} else {
			//			$.tips({
			//				content: '发票信息修改成功',
			//				stayTime: 3000,
			//				type: "warn"
			//			})
			$('#isComplete').addClass('i-circle ok');
			isComplete = '1';
		}
	});

	$('#save').on('click', function() {
		orderDetail.Invoice.BillNo = $('#billNo').val();
		orderDetail.Invoice.IsBill = isComplete;
		//提交保存
		var EditOrderRequest = JSON.stringify({
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			ResellerID: '',
			Order: orderDetail
		});
		//重新获取订单 
		//订单编辑过后 需要刷新orderdetail 否则无法再次编辑
		var CompySta = JSON.stringify({
			CompanyID: usersObj.CompID,
			CreateDate: '',
			Phone: '',
			ReceiptNo: orderDetail.ReceiptNo,
			UserID: usersObj.UserID
		});

		post('EditComPanyOrder', EditOrderRequest, function(response) {
			if(response.Result === "T") {
				$.tips({
					content: '发票信息修改成功',
					stayTime: 3000,
					type: "success"
				});

				post('GetCompanyOrderDetail', CompySta, function(response) {
					if(response.Result === "T") {
						sessionStorage.setItem('$order_info', JSON.stringify(response.Order));
						orderDetail = response.Order;
					} else {

					}
				});
			} else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				});
			}
		});

	});

}