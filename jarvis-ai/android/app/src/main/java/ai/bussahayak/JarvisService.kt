package ai.bussahayak

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Log
import android.view.Display
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.io.ByteArrayOutputStream

/**
 * JARVIS Accessibility Service
 * Captures screen, extracts UI elements, executes actions
 */
class JarvisService : AccessibilityService() {

    companion object {
        const val TAG = "JARVIS"
        var instance: JarvisService? = null
        var isRunning = false
    }

    private val handler = Handler(Looper.getMainLooper())
    private var serverUrl = "http://10.0.2.2:8000" // Local Python server

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        isRunning = true

        serviceInfo = serviceInfo.apply {
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 100
        }

        Log.d(TAG, "JARVIS Service Connected!")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // We don't need to react to every event
        // Only when user triggers voice command
    }

    override fun onInterrupt() {
        isRunning = false
    }

    // ==================== SCREEN CAPTURE ====================

    fun captureScreen(): String? {
        return try {
            val windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
            val display: Display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                display!!
            } else {
                @Suppress("DEPRECATION")
                windowManager.defaultDisplay
            }

            val metrics = android.util.DisplayMetrics()
            @Suppress("DEPRECATION")
            display.getRealMetrics(metrics)

            val width = metrics.widthPixels
            val height = metrics.heightPixels

            // Create bitmap
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val surface = android.view.SurfaceControl()

            // Take screenshot (requires SYSTEM_ALERT_WINDOW permission)
            // For actual implementation, use MediaProjection API
            // This is a simplified version

            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
            val base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)

            bitmap.recycle()
            base64
        } catch (e: Exception) {
            Log.e(TAG, "Screen capture failed: ${e.message}")
            null
        }
    }

    // ==================== UI ELEMENT EXTRACTION ====================

    fun extractUIElements(): List<UIElement> {
        val elements = mutableListOf<UIElement>()
        val rootNode = rootInActiveWindow ?: return elements

        traverseNode(rootNode, elements)
        return elements
    }

    private fun traverseNode(node: AccessibilityNodeInfo, elements: MutableList<UIElement>, depth: Int = 0) {
        if (depth > 20) return // Prevent infinite recursion

        val text = node.text?.toString() ?: ""
        val desc = node.contentDescription?.toString() ?: ""
        val className = node.className?.toString() ?: ""
        val isClickable = node.isClickable
        val isScrollable = node.isScrollable
        val isEditable = node.isEditable
        val bounds = android.graphics.Rect()
        node.getBoundsInScreen(bounds)

        if (text.isNotEmpty() || desc.isNotEmpty() || isClickable) {
            elements.add(UIElement(
                text = text,
                description = desc,
                className = className,
                isClickable = isClickable,
                isScrollable = isScrollable,
                isEditable = isEditable,
                bounds = bounds,
                nodeId = node.viewIdResourceName ?: "",
                nodeInfo = node
            ))
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            traverseNode(child, elements, depth + 1)
        }
    }

    // ==================== ACTION EXECUTOR ====================

    fun clickElement(element: UIElement): Boolean {
        return try {
            element.nodeInfo.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            Log.d(TAG, "Clicked: ${element.text}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Click failed: ${e.message}")
            false
        }
    }

    fun longClickElement(element: UIElement): Boolean {
        return try {
            element.nodeInfo.performAction(AccessibilityNodeInfo.ACTION_LONG_CLICK)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun scrollForward(element: UIElement): Boolean {
        return try {
            element.nodeInfo.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun scrollBackward(element: UIElement): Boolean {
        return try {
            element.nodeInfo.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun typeText(element: UIElement, text: String): Boolean {
        return try {
            val arguments = android.os.Bundle()
            arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            element.nodeInfo.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun goBack(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    fun goHome(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_HOME)
    }

    fun openRecents(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_RECENTS)
    }

    // ==================== APP LAUNCHER ====================

    fun launchApp(packageName: String): Boolean {
        return try {
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                Log.d(TAG, "Launched: $packageName")
                true
            } else {
                Log.e(TAG, "App not found: $packageName")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Launch failed: ${e.message}")
            false
        }
    }

    // ==================== FIND ELEMENTS ====================

    fun findElementByText(text: String): UIElement? {
        val elements = extractUIElements()
        return elements.find {
            it.text.contains(text, ignoreCase = true) ||
            it.description.contains(text, ignoreCase = true)
        }
    }

    fun findClickableElements(): List<UIElement> {
        return extractUIElements().filter { it.isClickable }
    }

    fun findEditableElements(): List<UIElement> {
        return extractUIElements().filter { it.isEditable }
    }

    fun getScreenSummary(): String {
        val elements = extractUIElements()
        val clickableCount = elements.count { it.isClickable }
        val textElements = elements.filter { it.text.isNotEmpty() }

        return buildString {
            append("Screen has ${elements.size} elements. ")
            append("$clickableCount buttons. ")
            if (textElements.isNotEmpty()) {
                append("Main text: ${textElements.take(5).joinToString(", ") { it.text }}")
            }
        }
    }

    // ==================== COMMUNICATION WITH PYTHON SERVER ====================

    fun sendToServer(endpoint: String, data: Map<String, Any>, callback: (String) -> Unit) {
        Thread {
            try {
                val url = java.net.URL("$serverUrl/$endpoint")
                val connection = url.openConnection() as java.net.HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val json = org.json.JSONObject(data).toString()
                connection.outputStream.write(json.toByteArray())

                val response = connection.inputStream.bufferedReader().readText()
                callback(response)
            } catch (e: Exception) {
                Log.e(TAG, "Server error: ${e.message}")
                callback("Server connection failed")
            }
        }.start()
    }

    // ==================== CLEANUP ====================

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        instance = null
    }
}

// ==================== UI ELEMENT DATA CLASS ====================

data class UIElement(
    val text: String,
    val description: String,
    val className: String,
    val isClickable: Boolean,
    val isScrollable: Boolean,
    val isEditable: Boolean,
    val bounds: android.graphics.Rect,
    val nodeId: String,
    val nodeInfo: AccessibilityNodeInfo
)
