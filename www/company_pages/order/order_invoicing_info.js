var orderDetail;
var invoiceType;
var usersObj;
window.onload = function() {
	FastClick.attach(document.body);

	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	init();
}
/**
 * 初始化
 */
function init() {
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	$('#free_invoice').hide();
	$('#VAT_invoice').hide();
	orderDetail = JSON.parse(sessionStorage.getItem('$order_info'));
	if(orderDetail.Ostate === '4') {
		$('#save').hide();
	} else {
		$('#save').show();
	}
	setDisplay(orderDetail.Invoice.IsOBill);
	bindEvents();
}

function bindEvents() {
	var type = document.getElementById('invoice_type').getElementsByTagName('li');
	var len = type.length;
	var i = 0;
	for(; i < len;) {
		(function(i) {
			type[i].addEventListener('click', function() {
				setDisplay(i + '');
			});
		})(i);
		i++;
	}

	$('#save').on('click', function() {
		switch(invoiceType) {
			case '0':

				break
			case '1':
				if($('#free_invoice_title').val() === '' || $('#free_invoice_content').val() === '') {

					$.tips({
						content: '发票抬头与内容不能为空',
						stayTime: 3000,
						type: "warn"
					});
					return;
				}
				orderDetail.Invoice.Rise = $('#free_invoice_title').val();
				orderDetail.Invoice.Content = $('#free_invoice_content').val();
				break
			case '2':
				if($('#VAT_invoice_title').val() === '' || $('#VAT_invoice_content').val() === '' || $('#VAT_depositary_bank').val() === '' || $('#VAT_bank_account_number').val() === '' || $('#VAT_tax_number').val() === '') {

					$.tips({
						content: '请完善开票信息',
						stayTime: 3000,
						type: "warn"
					});
					return;
				}
				orderDetail.Invoice.Rise = $('#VAT_invoice_title').val(); //发票抬头
				orderDetail.Invoice.Content = $('#VAT_invoice_content').val(); //发票内容
				orderDetail.Invoice.OBank = $('#VAT_depositary_bank').val(); //开户银行
				orderDetail.Invoice.OAccount = $('#VAT_bank_account_number').val(); //银行账号
				orderDetail.Invoice.TRNumber = $('#VAT_tax_number').val(); //纳税登记号	
				break
		}
		orderDetail.Invoice.IsOBill = invoiceType;
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
					content: '开票信息修改成功',
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

function setDisplay(type) {
	invoiceType = type;
	$('#notInvoicing').removeClass('i-circle ok');
	$('#ordinary').removeClass('i-circle ok');
	$('#vat').removeClass('i-circle ok');
	$('#notInvoicing').addClass('i-circle');
	$('#ordinary').addClass('i-circle');
	$('#vat').addClass('i-circle');
	switch(type) {
		case '0': //不开发票
			$('#notInvoicing').addClass('i-circle ok');
			$('#free_invoice').hide();
			$('#VAT_invoice').hide();
			break
		case '1': //普通发票
			$('#ordinary').addClass('i-circle ok');
			$('#free_invoice').show();
			$('#VAT_invoice').hide();

			$('#free_invoice_title').text(orderDetail.Invoice.Rise);
			$('#free_invoice_content').text(orderDetail.Invoice.Content);
			break
		case '2': //增值税发票
			$('#vat').addClass('i-circle ok');
			$('#free_invoice').hide();
			$('#VAT_invoice').show();

			$('#VAT_invoice_title').text(orderDetail.Invoice.Rise); //发票抬头
			$('#VAT_invoice_content').text(orderDetail.Invoice.Content); //发票内容
			$('#VAT_depositary_bank').text(orderDetail.Invoice.OBank); //开户银行
			$('#VAT_bank_account_number').text(orderDetail.Invoice.OAccount); //银行账号
			$('#VAT_tax_number').text(orderDetail.Invoice.TRNumber); //纳税登记号	

			break
	}

}