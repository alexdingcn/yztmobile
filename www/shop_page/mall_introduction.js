/**
 * @author hxbnzy
 * @time 2017/09/06
 */
$(function(){
	var id = getQueryVariable('id');
	var CompName = getQueryVariable('CompName');
	
	$('#login').click(function(){
		JumpLoginPage();
	});
	
	$('#CompName').text(decodeURI(CompName));
	var WXGetCompInfo = JSON.stringify({
		CompID:id
	});
	
	
	post('WXGetCompInfo',WXGetCompInfo,function(response){
		if(response.Result==='T'){
			$('#CompInfo').text(response.CompInfo);
			$('#Principal').text(response.Principal);
			$('#Phone').text(response.Phone);
			$('#Address').text(response.Address);
		}
	});
	
});
