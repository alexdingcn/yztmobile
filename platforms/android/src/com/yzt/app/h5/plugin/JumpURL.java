package com.yzt.app.h5.plugin;

import android.content.Intent;

import com.yzt.app.h5.mWebViewActivity;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * Js交互外部链接跳转
 * Created by hxbnzy on 2018/4/2.
 */

public class JumpURL extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if("Jump".equals(action)){
            String url = args.getString(0);
            String title = args.getString(1);
            Intent intent = new Intent(cordova.getActivity(),mWebViewActivity.class);
            intent.putExtra("url", url);
            intent.putExtra("title", title);
            cordova.getActivity().startActivity(intent);
            return true;
        }
        return false;
    }
}
