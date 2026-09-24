package id.sch.sdnkalibotolor10.sigap

import android.app.Activity
import android.os.Build
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class ExambroBridge(private val activity: Activity) {

    private var isExamLocked: Boolean = false

    @JavascriptInterface
    fun isExambroApp(): Boolean {
        return true
    }

    @JavascriptInterface
    fun startLockTask() {
        activity.runOnUiThread {
            try {
                isExamLocked = true
                // 1. Kunci Layar Penuh Kiosk Android
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    activity.startLockTask()
                }

                // 2. Blokir Screenshot & Screen Recording
                activity.window.setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                )

                // 3. Masuk Immersive Fullscreen
                hideSystemBars()

                Toast.makeText(activity, "🔒 Mode Ujian Terkunci Aktif", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun stopLockTask() {
        activity.runOnUiThread {
            try {
                isExamLocked = false
                // 1. Lepas Kunci Kiosk Android
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    activity.stopLockTask()
                }

                // 2. Buka Blokir Screenshot
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)

                Toast.makeText(activity, "🔓 Ujian Selesai - Layar Dibuka", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun setScreenshotAllowed(allowed: Boolean) {
        activity.runOnUiThread {
            if (allowed) {
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            } else {
                activity.window.setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                )
            }
        }
    }

    @JavascriptInterface
    fun exitApp() {
        activity.runOnUiThread {
            activity.finishAffinity()
        }
    }

    fun isLocked(): Boolean = isExamLocked

    private fun hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            activity.window.insetsController?.let {
                it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            activity.window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }
}
