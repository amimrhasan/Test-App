package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

    private var webViewRef: WebView? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .statusBarsPadding()
                        .imePadding()
                ) { innerPadding ->
                    OnushilonWebView(
                        onWebViewCreated = { webViewRef = it },
                        onShareBackup = { jsonContent, filename ->
                            shareBackupFile(jsonContent, filename)
                        }
                    )
                }
            }
        }
    }

    private fun shareBackupFile(content: String, filename: String) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, content)
            putExtra(Intent.EXTRA_TITLE, filename)
            type = "application/json"
        }
        val shareIntent = Intent.createChooser(sendIntent, "অনুশীলন ব্যাকআপ সংরক্ষণ করুন")
        startActivity(shareIntent)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webViewRef?.canGoBack() == true) {
            webViewRef?.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

class WebAppInterface(
    private val onShareBackup: (String, String) -> Unit
) {
    @JavascriptInterface
    fun downloadJson(content: String, filename: String) {
        onShareBackup(content, filename)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun OnushilonWebView(
    onWebViewCreated: (WebView) -> Unit,
    onShareBackup: (String, String) -> Unit
) {
    var webViewInstance: WebView? = null

    BackHandler(enabled = true) {
        if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                }

                webChromeClient = WebChromeClient()
                webViewClient = object : WebViewClient() {}

                addJavascriptInterface(WebAppInterface(onShareBackup), "AndroidInterface")

                loadUrl("file:///android_asset/index.html")
                webViewInstance = this
                onWebViewCreated(this)
            }
        }
    )
}
