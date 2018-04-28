/**
 *  核心企业修改公司信息
 * 	@author wyf
 *  @time 2017/08/10
 */
var usersObj;
window.onload=function(){
	
if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "";
	if (roleDetail === null || roleDetail === '') {
		window.location.href = '../login/login.html';
		return;
	}
	
	var usersList = JSON.parse(localStorage.getItem('$usersList') || "");
	usersObj = JSON.parse(roleDetail);
	
 	initData(usersObj);
   	var save=false;//判断是否保存；默认编辑
	$('.per').on('click',function(){
		save=!save;
		if(save){
			$(this).text("保存");
			$('.edit').removeClass("none");
			$(".wedit").hide();	
		}else{
			$(this).text("编辑");
			$('.edit').addClass("none");
			$(".wedit").show();	
			EditCompInfo(usersObj);
		}
	})
}
	/*获取个人信息*/
	function initData(usersObj) {
			/*发送数据请求*/
			var OrderPrompt = JSON.stringify({
				UserID: usersObj.UserID,
				CompID: usersObj.CompID || getUrlParameter("compid")
			});		
			post('GetCompanyInfo', OrderPrompt, function(response) {
				if(response.Result === "T") {
					var compAccou=response.CompInfo;
					console.log(compAccou);
					compMessage(compAccou);
					localStorage.setItem("compInfo",JSON.stringify(compAccou));
				} else {			
					
				}
			})
		}
	function compMessage(message){
		$('.compName').text(message.CompName);
		$('.induName').text(message.InduName);
		$('.address').text(message.Address);
		$('.zip').text(message.Zip);
		$('.telp').text(message.Tel);
		$('.fax').text(message.Fax);
		$('.principal').text(message.Principal);
		$('.phone').html("<a href=\"tel:" + message.Phone + "\">" + message.Phone + "</a>");
		$('.manageInfo').text(message.ManageInfo);
		$('.ecompName').val(message.CompName);
		$('.einduName').val(message.InduName);
		$('.eaddress').val(message.Address);
		$('.ezip').val(message.Zip);
		$('.etelp').val(message.Tel);
		$('.efax').val(message.Fax);
		$('.eprincipal').val(message.Principal);
		$('.ephone').val(message.Phone);
		$('.emanageInfo').val(message.ManageInfo);
	
	}
	
	/*修改账号信息*/
	var ecompName;//公司名称
	var einduName;//行业类别名称
	var eaddress;//详细地址
	var ezip;//邮编
	var etelp;//电话
	var efax;//传真
	var eprincipal;//联系人
	var ephone;//手机
	var emanageInfo;//经营范围
	function EditCompInfo(editinfo){
		 ecompName=$(".ecompName").val();
		 einduName=$(".einduName").val();
		 eaddress=$('.eaddress').val();
		 ezip=$(".ezip").val();
		 etelp=$(".etelp").val();
		 efax=$('.efax').val();
		 eprincipal=$('.eprincipal').val();
		 ephone=$('.ephone').val();
		 emanageInfo=$('.emanageInfo').val();
		var cinfo=localStorage.getItem("compInfo");
		var coninfo=JSON.parse(cinfo);
		var editinf = JSON.stringify({
				UserID: editinfo.UserID,
				CompID: editinfo.CompID,
				CompInfo:{
					"CompName": ecompName,
	                "InduName": einduName,
	                "Address": eaddress,
	                "Zip": ezip,
	                "Tel": etelp,
	                "Fax": efax,
	                "Principal": eprincipal,
	                "Phone": ephone,
	                "ManageInfo": emanageInfo,
	                "Ts": coninfo.Ts
				}
		});
			post('EditCompanyInfo', editinf, function(response) {
				//
				if(response.Result === "T") {
					initData(usersObj);
				} else {	
					
				}
			})
	}



