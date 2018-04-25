var usersObj;
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	usersObj = JSON.parse(roleDetail);
	Bind();

	$(".InvoceType1,.InvoceType2,.InvoceType3").on(function() {
		$(".InvoceType1,.InvoceType2,.InvoceType3").removeClass("ok")
		$(this).addClass("ok")
	})

	//返回按钮
	$("#returns").on('click', function() {
		window.location = "disserbutor_info.html?id=" + Gid;
	})
})

function Bind() {
	var url = window.location.href; //URL地址
	Gid = url.split('=')[1] //商品ID

	var DataJson = {
		CompID: usersObj.CompID, //usersObj.CompID"",//核心企业ID
		ResellerID: Gid, //经销商ID
		UserID: usersObj.UserID // usersObj.UserID//用户ID
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerDetail', datastr, function(response) {
		if(response.Result == "T") {
			//发票信息
			if(response.Reseller.InvoceList.length > 0) {

				var InvoceType = response.Reseller.InvoceList[0].InvoceType //发票类型
				if(InvoceType == "不开发票")
					$(".InvoceType1").addClass("ok")
				else if(InvoceType == "普通发票")
					$(".InvoceType2").addClass("ok")
				else if(InvoceType == "增值税发票")
					$(".InvoceType3").addClass("ok")
				$("#Content").val(response.Reseller.InvoceList[0].Content); //发票抬头
				$("#Rise").val(response.Reseller.InvoceList[0].Rise); //发票内容
				$("#OBank").val(response.Reseller.InvoceList[0].OBank); //开户银行
				$("#OAccount").val(response.Reseller.InvoceList[0].OAccount); //开户账户
				$("#TRNumber").val(response.Reseller.InvoceList[0].TRNumber); //纳税人登记号
			}
		}
	})
}