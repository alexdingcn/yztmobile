package com.yzt.app.h5;

import android.annotation.TargetApi;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * 根据url跳转外部链接
 * Created by hxbnzy on 2018/4/2.
 */

public class mWebViewActivity extends Activity{

    private WebView mWebView;
    private LinearLayout back;
    private TextView tv_title;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_webview);
        // 获取跳转参数
        String url = getIntent().getStringExtra("url");
        String title = getIntent().getStringExtra("title");

        mWebView = (WebView) findViewById(R.id.mWebView);
        back = (LinearLayout) findViewById(R.id.back);
        tv_title = (TextView) findViewById(R.id.tv_title);
        // 设置标题
        tv_title.setText(title);
        // 关闭当前页面
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                finish();
            }
        });

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAppCacheEnabled(true);
        //设置可以访问文件
        settings.setAllowFileAccess(true);

        // 拦截url 避免调用第三方浏览器打开
        mWebView.setWebViewClient(new WebViewClient(){
            @TargetApi(Build.VERSION_CODES.LOLLIPOP)
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                view.loadUrl(request.getUrl().toString());
                return true;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        mWebView.loadUrl(url);
    }

    // 捕捉“回退”按键，让WebView能回退到上一页，而不是直接关闭Activity。
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
