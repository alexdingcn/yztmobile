var Nid = ""; //新闻ID
$(function() {

	FastClick.attach(document.body);
	if(!is_weixin()) {
		document.addEventListener("jpush.openNotification", onOpenNotification, false);
	};
	$('#back').click(function(){
		window.location.href="news_list.html?"+Math.random();
	});
	Bind();

})

//绑定数据
function Bind() {
	var url = window.location.href; //URL地址
	Nid = url.split('id=')[1]
	var roleDetail = localStorage.getItem('$login_role') || "[]";
	var usersObj = JSON.parse(roleDetail);
	var DataJson = {
		CompanyID: usersObj.CompID,
		NewsID: Nid,
		UserID: usersObj.UserID
		//          		CompanyID:"1028",
		//              NewsID:Nid,
		//              UserID:"1149"
	}
	var datastr = JSON.stringify(DataJson)
	post('GetNewsInfo', datastr, function(response) {
		//console.log(JSON.stringify(response));
		if(response.Result == "T" && response.Description == "返回成功") {
			console.log(JSON.stringify(response));
			var Contents = response.NewsInfo.Contents == null ? "无内容" : response.NewsInfo.Contents
			var Title = response.NewsInfo.Title == "" ? "无标题" : response.NewsInfo.Title
			$("#titleDiv").html(Title)
			$("#timeDiv").html("发布时间：" + response.NewsInfo.CreateTime)
			$("#contentsDiv").html(response.NewsInfo.Contents)
		}
	})
}