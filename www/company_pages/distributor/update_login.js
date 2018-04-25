var usersObj;
var Account;
$(function() {
	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	usersObj = JSON.parse(roleDetail);
	Bind();
	//返回按钮
	$("#returns").on('click', function() {
		window.location = "disserbutor_info.html?id=" + Gid;
	})
	//保存按钮
	
	$("#save").on('click', function() {
		if($('#TrueName').val() === ''){
			$.tips({
				content: '姓名不能为空',
				stayTime: 3000,
				type: "warn"
			});
			return;
		}
		
		var EditResellerAccount = JSON.stringify({
			AccountID:Account.AccountID,
			CompID:usersObj.CompID,
			TrueName:$('#TrueName').val(),
			UserID:usersObj.UserID,
			ts:Account.ts
		});
		
		post('EditResellerAccount', EditResellerAccount, function(response) {
			if(response.Result === "T") {
				$.tips({
					content: '修改成功',
					stayTime: 1000,
					type: "success"
				});
				setTimeout(function() {
					window.location.href = 'disserbutor_list.html?'+Math.random();
				}, '1000');
			} else {
				$.tips({
					content: response.Description,
					stayTime: 3000,
					type: "warn"
				});
			}

		});
	})
})

function Bind() {
	var url = window.location.href; //URL地址
	Gid = url.split('id=')[1] //商品ID

	var DataJson = {
		CompID: usersObj.CompID, //usersObj.CompID"",//核心企业ID
		ResellerID: Gid, //经销商ID
		UserID: usersObj.UserID // usersObj.UserID//用户ID
	}
	var datastr = JSON.stringify(DataJson);
	post('GetResellerDetail', datastr, function(response) {
		if(response.Result == "T") {
			Account = response.Reseller.Account;
			//登录信息
			$("#UserName").text(response.Reseller.Account.UserName); //登录账号
			$("#TrueName").val(response.Reseller.Account.TrueName); //姓名
			$("#Phone").text(response.Reseller.Account.Phone); //手机
		}
	})
}