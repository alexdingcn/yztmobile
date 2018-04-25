/**
 * XmlhttpRequest POST Request
 * @author hxbnzy
 * @time 2017/7/20
 */
function postPay(methodName, data,callback){
//	console.log(methodName+':  '+data);
	var url = 'http://47.100.16.185:84//MobileService/WechatOrderPay.asmx/'+methodName;
//	var url = 'http://192.168.1.3:8099//MobileService/WechatOrderPay.asmx/'+methodName;
	var key = CryptoJS.enc.Utf8.parse("HaiYuSoftOrder18");
	var iv  = CryptoJS.enc.Utf8.parse("1hj^5B6k7o8v&*fR'");
    var xhr = new XMLHttpRequest();
	var requestJson;
	requestJson = "JSon="+Encrypt(data);
   	requestJson +="&from=6";
   	var obj ={
		 Result : "",
		 Description : ''
	};
	if (xhr) {
	    xhr.onreadystatechange = function(){
	    		if (xhr.readyState == 4) {
	        		if (xhr.status == 200) {
		            var response = xhr.responseText;
		        	    callback(AnalysisXml(response,obj)); 
		        } else {
				    
  		            obj.Result = "F";
		            obj.Description = "网络请求失败 Error code:  " + xhr.status;
		            callback(obj);
		        }
      		}else {
	      	
	      	}
	    };
	    xhr.open('POST',url, true);
	    xhr.setRequestHeader("CONTENT-TYPE","application/x-www-form-urlencoded");
	
        xhr.send(requestJson.replace(/[+-\s]/g, "%2B"));
	 } else {
//	  	console.log(xhrfalse);
    }
    
     /** Advanced Encryption Standard 加密 */
    function Encrypt(data){
    
     	var encrypted = CryptoJS.AES.encrypt(
	      data,
	      key,
	      {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7
	      });
    		return encrypted.toString();
     }
     /** Advanced Encryption Standard 解密 */
    function Decrypt(data) {
	    var decrypted = CryptoJS.AES.decrypt(
	      data,
	      key,
	      {iv:iv,padding:CryptoJS.pad.Pkcs7});
	      console.log(decrypted.toString(CryptoJS.enc.Utf8));
	    return decrypted.toString(CryptoJS.enc.Utf8);
  	}
      
    /** 解析xml获取json字符串 */
    function AnalysisXml(data,obj){
    		var x2js = new X2JS();
    		var jsonObj = x2js.xml_str2json( data );
      	var stringObj = jsonObj.string;
		obj = JSON.parse(Decrypt(stringObj.__text));
//		console.log(JSON.stringify(obj)); 
    		return obj;
	};
}


