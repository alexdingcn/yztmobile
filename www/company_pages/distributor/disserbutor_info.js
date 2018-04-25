var Gid = ""; //经销商ID
var usersObj;
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	usersObj = JSON.parse(roleDetail);
	Bind();
	
	//经销商列表
	$("#dis_list").on('click', function() {
		window.location = "disserbutor_list.html?random=" + Math.random();
	});

	//修改基本信息
//	$("#updateInfo").on('click', function() {
//		window.location = "update_info.html?random=" + Math.random() + "id=" + Gid;
//	});

	//修改发票信息
	$("#updateInvoce").on('click', function() {
		window.location = "update_invoce.html?random=" + Math.random() + "id=" + Gid;
	});
	
	//修改登录账号
//	$("#updateLoging").on('click', function() {
//		window.location = "update_login.html?random=" + Math.random() + "id=" + Gid;
//	});

});

//绑定数据
function Bind() {
	var url = window.location.href; //URL地址
	Gid = url.split('id=')[1];
	var datastr = JSON.stringify({
		CompID: usersObj.CompID, //usersObj.CompID"",//核心企业ID
		ResellerID: Gid, //经销商ID
		UserID: usersObj.UserID // usersObj.UserID//用户ID
	});
	post('GetResellerDetail', datastr, function(response) {
		if(response.Result == "T") {
			//基本信息
			$("#ResellerCode").html(response.Reseller.ResellerCode); //编码
			$("#ResellerName").html(response.Reseller.ResellerName); //名称
			$("#ResellerClassify").html(response.Reseller.ResellerClassify); //分类
			$("#AreaName").html(response.Reseller.AreaName); //区域
			$("#ResellerAddr").html(response.Reseller.ResellerAddr); //地址
			$("#Zip").html(response.Reseller.Zip); //邮编
			$("#Tel").html(response.Reseller.Tel); //电话
			$("#Fax").html(response.Reseller.Fax); //传真
			$("#Principal").html(response.Reseller.Principal); //联系人
			$("#Phone").html(response.Reseller.Phone); //手机
			//发票信息
			if(response.Reseller.InvoceList.length > 0) {

				$("#InvoceType").html(response.Reseller.InvoceList[0].InvoceType); //发票类型
				$("#Content").html(response.Reseller.InvoceList[0].Content); //发票抬头
				$("#Rise").html(response.Reseller.InvoceList[0].Rise); //发票内容
				$("#OBank").html(response.Reseller.InvoceList[0].OBank); //开户银行
				$("#OAccount").html(response.Reseller.InvoceList[0].OAccount); //开户账户
				$("#TRNumber").html(response.Reseller.InvoceList[0].TRNumber); //纳税人登记号
			}
			//登录信息
			$("#UserName").html(response.Reseller.Account.UserName); //登录账号
			$("#TrueName").html(response.Reseller.Account.TrueName); //姓名
			$("#Phonelogin").html(response.Reseller.Account.Phone); //手机
		}
	})
}