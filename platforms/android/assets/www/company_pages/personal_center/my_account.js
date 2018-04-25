/**
 *  核心企业修改登录信息
 * 	@author wyf
 *  @time 2017/08/09
 */
var usersObj;
window.onload=function(){
	
if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role');
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
//			$('.p-t18 .cusername').attr("disabled","disabled");
//			$('.cphone').attr("disabled",true);
			EditCompInfo(usersObj);
		}
	})
}
	/*获取登录账号信息*/
	function initData(usersObj) {
			/*发送数据请求*/
			var OrderPrompt = JSON.stringify({
				UserID: usersObj.UserID,
				CompID: usersObj.CompID
			});		
			post('GetCompanyInfo', OrderPrompt, function(response) {
				if(response.Result === "T") {
					var compAccoun=response.CompAccount;
					compMessage(compAccoun);
					localStorage.setItem("comMa",JSON.stringify(compAccoun));
				} else {			
					
				}
			})
		}
	function compMessage(message){
		$('.username').text(message.UserName);
		$('.truename').text(message.TrueName);
		$('.phone').text(message.Phone);
		$('.email').text(message.Email);
		$('.cusername').val(message.UserName);
		$('.ctruename').val(message.TrueName);
		$('.cphone').val(message.Phone);
		$('.cemail').val(message.Email);
	}
	
	/*修改账号信息*/
	function EditCompInfo(editinfo){
		var username=$(".cusername").val();
		var truename=$(".ctruename").val();
		var phone=$(".cphone").val();
		var email=$(".cemail").val();
		var comMae=localStorage.getItem("comMa");
		var comMage=JSON.parse(comMae);
		var editinf = JSON.stringify({
				UserID: editinfo.UserID,
				CompID: editinfo.CompID,
				CompAccount: {
		        "UserName": username,
		        "TrueName": truename,
		        "Phone": phone,
		        "Email": email,
		        "Ts": comMage.Ts
		      }
		});
			post('EditCompanyAccount', editinf, function(response) {
				//
				if(response.Result === "T") {
					initData(usersObj);
	
				} else {	
					
				}
			})
	}



