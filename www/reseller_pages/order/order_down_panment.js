/**
 * 订单支付 线下收款
 */
var uploadList = new Array();
var orderReceiptNo = '';
var amountPaid = '';
var uploadImgList = '';
var imgtype = '1';
$(function() {
	FastClick.attach(document.body);
	var url = window.location.href; //URL地址
	orderReceiptNo = getQueryVariable('id'); //商品ID
	var amountPaid = getQueryVariable('amount_paid');
	$('#down_Amount').val(amountPaid);
	var roleDetail = localStorage.getItem('$login_role');
	usersObj = JSON.parse(roleDetail);

	$('#submit').on('click', function() {
		var Amount = $('#down_Amount').val(); // 收款金额
		var Account = $('#down_Account').val(); // 收款账户
		var Bank = $('#down_Bank').val(); // 收款银行
		var Number = $('#down_Number').val(); // 收款卡号
		var txtCreateDate = $("#txtCreateDate").text();
		var Remark = $('#down_Remark').val() || ''; // down_Remark
		if(Amount === '') {
			weui.topTips('请填写付款金额', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {}
			});
			return;
		}
		if(txtCreateDate === '') {
			weui.topTips('请选择付款日期', {
				duration: 3000,
				className: "custom-classname",
				callback: function() {

				}
			});
			return;
		}

		// 提交
		var OrderPay = {
			KeyID: orderReceiptNo, // 订单id
			DisID: usersObj.DisID,
			UserID: usersObj.UserID,
			CompID: usersObj.CompID,
			paymoney: Amount, // 付款金额
			bankname: Account, // 账户名称
			bank: Bank, // 收款银行
			bankcode: Number, // 收款卡号
			texArriveDate: txtCreateDate, //支付日期
			remark: Remark, // 备注
			attach: uploadImgList, // 附件
			imgtype: imgtype
		};

		var orderPay = JSON.stringify(OrderPay);
		post('OrderPay', orderPay, function(response) {
			if(response.Result === "T") {
				$.tips({
					content: response.Description,
					stayTime: 2500,
					type: "warn"
				});
				setTimeout(function() {
					window.location.href = 'order_detail.html?random=' + Math.random() + "id=" + orderReceiptNo;
				}, 2500);
			} else {
				weui.topTips(response.Description, {
					duration: 3000,
					className: "custom-classname",
					callback: function() {

					}
				});
			}
		});

	});

	if(!is_weixin()) {
		$('#weui-imglist').show();
		$('#uploaderInput').on('change', function(e) {
			var imgData = {};
			var file = e.target.files[0]; //获取图片资源
			imgData.fileName = file.name;
			// 只选择图片文件
			if(!file.type.match('image.*')) {
				return false;
			}
			var reader = new FileReader();
			reader.readAsDataURL(file); // 读取文件
			// 渲染文件
			reader.onload = function(arg) {
				imgData.base64 = arg.target.result;
				uploadList.push(JSON.stringify(imgData));
				// 传入后台
				uploadImg(imgData.base64, imgData.fileName);

			}
		});
		//		$('#uploaderInput').on('click', function(e) {
		//			wx.chooseImage({
		//				success: function(res) {
		//					alert('已选择 ' + res.localIds.length + ' 张图片');
		//					wx.uploadImage({
		//						localId: res.localIds, // 需要上传的图片的本地ID，由chooseImage接口获得
		//						isShowProgressTips: 1 // 默认为1，显示进度提示
		//						success: function(res) {
		//							var serverId = res.serverId; // 返回图片的服务器端ID
		//							// 设置图片预览
		//							var img = '<li class="weui-uploader__file" style="background-image:url(' + serverId + ')"></li>'
		//							$("#uploaderFiles").append(img);
		//							if(wx_imgIDs === '') {
		//								wx_imgIDs = serverId;
		//							} else {
		//								wx_imgIDs += '&&' + serverId;
		//							}
		//						}
		//					});
		//				}
		//			});
		//		});

	}

	getDatatime();
	if(is_weixin()) {
		getWxJsInfo();
	}
});

function uploadImg(baseImg, baseName) {
	// 提交
	var OrderPayAttch = {
		base64: baseImg,
		fileName: baseName,
	};

	var OrderPayAttch = JSON.stringify(OrderPayAttch);
	post1('OrderPayAttch', OrderPayAttch, function(response) {
		if(response.Result === "T") {
			var img = '<li class="weui-uploader__file" style="background-image:url(' + baseImg + ')"></li>'
			$("#uploaderFiles").append(img);
			if(uploadImgList === '') {
				uploadImgList = response.Description;
			} else {
				uploadImgList += '&&' + response.Description;
			}
			//			uploadImgList.push(response.Description);
		} else {
			weui.topTips(response.Description, {
				duration: 3000,
				className: "custom-classname",
				callback: function() {

				}
			});
		}
	});
}

function getDatatime() {
	var myDate = new Date();
	//获取当前年
	var year = myDate.getFullYear();
	//获取当前月
	var month = myDate.getMonth() + 1;
	//获取当前日
	var date = myDate.getDate();

	var now = year + '-' + p(month) + "-" + p(date)

	$("#create_date").click(function() {
		new DatePicker({
			"type": "3", //0年, 1年月, 2月日, 3年月日(默认为3)

			"title": '请选择收款日期', //标题（可选）

			"maxYear": "", //最大年份（可选）

			"minYear": "", //最小年份（可选）

			"separator": "-", //日期分割符(可选)(默认为'/')

			"defaultValue": now, //默认值：根据分隔符分隔开（可选）

			"callBack": function(val) {
				//回调函数（val为选中的日期）
				// 可在此处设置显示选中的值
				self.nowVal = val;
				$('#txtCreateDate').text(val);
			} 
		});
	});
}

function p(s) {
	return s < 10 ? '0' + s : s;
}

/**
 * JS-SDK 获取注册配置信息
 */
var getWxJsInfo = function() {
	var GetWXconfig = JSON.stringify({
		CompID: usersObj.CompID,
		url: location.href.split('#')[0]
	});
	post('GetWXconfig', GetWXconfig, function(response) {
		if(response.Result == "T") {
			// 注入权限验证配置
			wx_config(response.appId, response.timestamp, response.nonceStr, response.signature);
			$('#weui-imglist').show();
		} else {
			el = $.tips({
				content: response.Description,
				stayTime: 3000,
				type: "warn"
			});
			$('#weui-imglist').hide();
		}

	});
};

/**
 * JS-SDK 
 * config接口注入权限验证配置
 */
var wx_config = function(appid, timeStamp, noncestr, sig) {
	//	calcSignature(noncestr,)
	//	alert(location.href.split('#')[0]);
	wx.config({
		debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: appid, // 必填，公众号的唯一标识
		timestamp: timeStamp, // 必填，生成签名的时间戳
		nonceStr: noncestr, // 必填，生成签名的随机串
		signature: sig, // 必填，签名，见附录1
		jsApiList: [
			'chooseImage',
			'uploadImage'
		] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});

	//	config信息验证后会执行ready方法
	wx.ready(function() {
		imgtype = '2';
		$('#weui-imglist').show();
//		$('#uploaderInput').attr("disabled", true);
		$('#weui-imglist').on('click', function() {
			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success: function(res) {
					var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					// 设置图片预览
					//					var img = '<li class="weui-uploader__file" style="background-image:url(' + localIds + ')"></li>'
					var img = '<img class="weui-uploader__file" src= ' + localIds + ' />'
					$("#uploaderFiles").append(img);
					wx.uploadImage({
						localId: localIds.toString(), // 需要上传的图片的本地ID，由chooseImage接口获得
						isShowProgressTips: 1, // 默认为1，显示进度提示
						success: function(res) {
							var serverId = res.serverId; // 返回图片的服务器端ID
							if(uploadImgList === '') {
								uploadImgList = serverId.toString();
							} else {
								uploadImgList += '&&' + serverId;
							}
						}
					});
				}
			});
		});

		// 在这里调用 API
		//			wx.chooseImage({
		//						success: function(res) {
		//							//					alert('已选择 ' + res.localIds.length + ' 张图片');
		//							wx.uploadImage({
		//								localId: res.localIds, // 需要上传的图片的本地ID，由chooseImage接口获得
		//								isShowProgressTips: 1 // 默认为1，显示进度提示
		//								success: function(res) {
		//									var serverId = res.serverId; // 返回图片的服务器端ID
		//									// 设置图片预览
		//									var img = '<li class="weui-uploader__file" style="background-image:url(' + serverId + ')"></li>'
		//									$("#uploaderFiles").append(img);
		//									if(wx_imgIDs === '') {
		//										wx_imgIDs = serverId;
		//									} else {
		//										wx_imgIDs += '&&' + serverId;
		//									}
		//								}
		//							});
		//						}
		//					});

	});
	// 	config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
	wx.error(function(res) {
		el = $.tips({
			content: res,
			stayTime: 3000,
			type: "warn"
		});
		$('#weui-imglist').hide();
	});
};