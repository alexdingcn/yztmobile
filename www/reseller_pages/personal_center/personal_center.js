/**
 *  经销商个人中心
 * 	@author hxbnzy
 *  @time 2017/08/10
 */
var usersObj;
var users;
var OpenID = '';
var isWxLogin = false;
window.onload = function() {
	init();
}

function init() {
	if(is_weixin()) {
		OpenID = localStorage.getItem('$wx_openid') || "";
		if(OpenID !== false) {
			isWxLogin = true;
		}
	} else {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	}
	var tabs = $('#tabs a');
	nextResellerToPage(tabs, '4');
	FastClick.attach(document.body);
	var roleDetail = localStorage.getItem('$login_role') || "";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	var usersList = JSON.parse(localStorage.getItem('$usersList') || "");
	loadCompanyList();
	$(document).on('click', '#my_account', function() {
			window.location.href = 'my_account.html';
		})
		.on('click', '#modify_password', function() {
			window.location.href = 'modify_password.html';
		})
		.on('click', '#company_info', function() {

		})
		.on('click', '#invoice_info', function() {

		})
		.on('click', '#shipping_address', function() {
			window.location.href = 'shipping_address.html';

		})
		.on('click', '#bound_card', function() {
			window.location.href = 'bound_card.html';

		})
		.on('click', '#switching_accounts', function() {
			var login_role = null;
			$.each(usersList, function(index, value) {
				if(value.CType === 1) {
					login_role = value;
					return false
				}
			});

			//将登陆角色保存到本地
			localStorage.setItem('$login_role', JSON.stringify(login_role));
			window.location.href = '../../company_pages/home/home.html';

			//			showRoleList(usersList);
			//			$('#offCanvas').offCanvas('open');

		})
		.on('click', '#switching_reseller', function() {
			//			showRoleList(usersList);
			$('#offCanvas').offCanvas('open');

		})
		.on('click', '#exitLogin', function() {
			exitLogin();
		});
	$('#disName').text(usersObj.DisName);
	$('#disPhone').text(usersObj.Phone);
	// 获取经销商详情
	var resellerInfoRequest = JSON.stringify({
		UserID: usersObj.UserID,
		ResellerID: usersObj.DisID,
	});

	post('GetResellerInfo', resellerInfoRequest, function(response) {

		if(response.Result === "T") {
			$('#disName').text(response.DisName);
			$('#disPhone').text(response.DisPhone);
		} else {

		}
	});

	if(validatingRoles()) {
		$('#switching_accounts').show();
	}

}

function loadCompanyList() {
	var GetUserCompany = JSON.stringify({
		UserID: usersObj.UserID
	});

	post('GetUserCompany', GetUserCompany, function(response) {
		if(response.Result === 'T') {
			// 加载厂商列表
			CompanyList = response.CompanyList;

			$.each(CompanyList, function(index, item) {
				// 厂商列表初次加载 默认选中第一个 
				// 从本地获取选中的厂商信息
				var isSelect = false;
				var items = null;
				if(item.CompanyID === usersObj.CompID)
					isSelect = true;

				if(isSelect) {
					items = '<li style="color:dodgerblue" class="firm-li"   onclick=firmclickListener(this,' + index + ')>' +
						'<a style="color: dodgerblue">' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				} else {
					items = '<li class="firm-li" onclick=firmclickListener(this,' + index + ')>' +
						'<a>' + item.CompanyName + '</a><i class="i-arrow"></i>' +
						'</li>';
				}

				$('#addList').append(items);
			});
		} else {

		}
	});
}

/** 厂商选择监听 */
var firmclickListener = function(th, index) {
	// 保存当前选择厂商信息
	$('#offCanvas a').css("color", "black");
	$(th).children('a').css("color", "dodgerblue");
	if(CompanyList === null) {
		return;
	}
	// 替换默认保存的厂商ID
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	if(roleDetail === null || roleDetail === '')
		window.open('../login/login.html')
	usersObj = JSON.parse(roleDetail);
	usersObj.CompID = CompanyList[index].CompanyID;
	usersObj.CompName = CompanyList[index].CompanyName;
	localStorage.setItem('$login_role', JSON.stringify(usersObj));
	$('#offCanvas').offCanvas('close');
}

function exitLogin() {
	weui.actionSheet([{
		label: '退出后不会删除任何历史数据，下次登陆依然可以适用本账号。',
	}, {
		label: '退出登陆',
		onClick: function() {
			if(isWxLogin) {
				//清空openid
				var EditOpenID = JSON.stringify({
					OpenID: '',
					CompUserID: usersObj.CompUserID,
				});

				post('EditOpenID', EditOpenID, function(response) {

				});
			} else {

			}

			setTimeout(function() {
				localStorage.setItem('$usersList', '[]');
				localStorage.setItem('$login_role', ''); //清空本地保存信息
				window.location.href = '../../company_pages/login/login.html';
			}, '1000')
		}
	}], [{
		label: '取消',
		onClick: function() {

		}
	}], {
		className: "custom-classname"
	});
}

/**
 * 展示角色列表
 */
function showRoleList(userList) {
	var login_role = null;
	$.each(userList, function(index, value) {
		if(value.CType === 1) {
			login_role = value;
			return false
		}
	});
	//	setTimeout(function() {
	weui.actionSheet([{
		label: '厂商',
		onClick: function() {
			//				setTimeout(function() {
			//将登陆角色保存到本地
			localStorage.setItem('$login_role', JSON.stringify(login_role));
			window.location.href = '../../company_pages/home/home.html';
			//				}, '1000');
		}
	}], [{
		label: '取消',
		onClick: function() {

		}
	}]);
	//	}, '1000');

	//	var roleList = new Array();
	//	var i = 0;
	//	len = userList.length;
	//
	//	var actionList = new Array();;
	//	for(; i < len;) {
	//		(function(i) {
	//			action = {
	//				label: userList[i].CType === 1 ? userList[i].CompName + ' - 核心企业' : userList[i].CompName + ' - 经销商  ',
	//				onClick: function() {
	//					selectCallback(i, userList);
	//				}
	//			}
	//
	//		})(i);
	//		actionList.push(action);
	//		i++;
	//	}
	//	weui.actionSheet(
	//		actionList, [{
	//			label: '取消',
	//			onClick: function() {
	//
	//			}
	//		}]
	//	);

}

function selectCallback(position, userList) {
	if(isWxLogin) {
		var OpenID = localStorage.getItem('$wx_openid') || "";
		var EditOpenID = JSON.stringify({
			OpenID: OpenID,
			CompUserID: userList[position].CompUserID,
		});
		post('EditOpenID', EditOpenID, function(response) {

		});
	} else {
		//		//重置JPush 别名
		//		setAlias(md5(userList[position].CompUserID), function(response) {
		//			if(response.Result === "T") {
		//				console.log(response.Description.alias);
		//			} else {
		//				weui.topTips('推送设置失败,请稍后重试', {
		//					duration: 3000,
		//					className: "custom-classname",
		//					callback: function() {
		//						console.log('close');
		//					}
		//				});
		//
		//				return;
		//				//				console.log(response.Description.code);
		//			}
		//		});

		//		if(isDebug) {
		//
		//		} else {
		//			//重置JPush 别名
		//			setAlias(md5(userList[position].CompUserID), function(response) {
		//				if(response.Result === "T") {
		//					console.log(response.Description.alias);
		//				} else {
		//					weui.topTips('推送设置失败,请稍后重试', {
		//						duration: 3000,
		//						className: "custom-classname",
		//						callback: function() {
		//							console.log('close');
		//						}
		//					});
		//
		//					return;
		//					//				console.log(response.Description.code);
		//				}
		//			});
		//		}

	}
	setTimeout(function() {
		//将登陆角色保存到本地
		localStorage.setItem('$login_role', JSON.stringify(userList[position]));
		if(userList[position].CType === 1) {
			window.location.href = '../../company_pages/home/home.html';
		} else if(userList[position].CType === 2) {
			window.location.href = '../home/home.html';
		} else {

		}
	}, '1000');

}