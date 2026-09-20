package ai.bussahayak

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.Locale
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    companion object {
        const val TAG = "JARVIS"
        const val SERVER_WS = "wss://bussahayak.onrender.com/ws/voice"
        const val SERVER_HTTP = "https://bussahayak.onrender.com"
        const val PERMISSION_REQUEST = 100
    }

    private lateinit var tts: TextToSpeech
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var statusText: TextView
    private lateinit var speakButton: Button
    private var webSocket: WebSocket? = null
    
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
    
    private var isListening = false
    private var isReady = false
    private var isWebSocketConnected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        speakButton = findViewById(R.id.speakButton)

        tts = TextToSpeech(this, this)
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        checkPermissions()
        connectWebSocket()

        speakButton.setOnClickListener {
            if (isListening) {
                stopListening()
            } else {
                startListening()
            }
        }

        speakButton.setOnLongClickListener {
            readScreen()
            true
        }

        speak("JARVIS ready. Tap the button to speak.")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.US
            isReady = true
        }
    }

    private fun speak(text: String) {
        if (isReady) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utteranceId")
            runOnUiThread { statusText.text = text }
        }
    }

    // ==================== WEBSOCKET ====================
    private fun connectWebSocket() {
        val request = Request.Builder().url(SERVER_WS).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket connected")
                isWebSocketConnected = true
                runOnUiThread { statusText.text = "Connected to JARVIS AI" }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val type = json.getString("type")
                    
                    when (type) {
                        "connected" -> {
                            Log.d(TAG, "Server: ${json.getString("text")}")
                        }
                        "response" -> {
                            val responseText = json.optString("text", "")
                            runOnUiThread {
                                speak(responseText)
                                statusText.text = responseText
                            }
                            val action = json.optJSONObject("action")
                            if (action != null) {
                                executeAction(action)
                            }
                        }
                        "screen_summary" -> {
                            speak(json.getString("text"))
                        }
                        "error" -> {
                            speak(json.getString("text"))
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Parse error: ${e.message}")
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, null)
                isWebSocketConnected = false
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failed: ${t.message}")
                isWebSocketConnected = false
                runOnUiThread { statusText.text = "Connection lost. Reconnecting..." }
                Thread.sleep(3000)
                connectWebSocket()
            }
        })
    }

    // ==================== SPEECH RECOGNITION ====================
    private fun startListening() {
        if (!isWebSocketConnected) {
            speak("Not connected to server. Please wait.")
            return
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                arrayOf(Manifest.permission.RECORD_AUDIO), PERMISSION_REQUEST)
            return
        }

        isListening = true
        speakButton.text = "Listening..."
        speak("Yes?")

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }

        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {
                isListening = false
                runOnUiThread { speakButton.text = "Hold to Speak" }
            }
            override fun onError(error: Int) {
                isListening = false
                runOnUiThread { speakButton.text = "Hold to Speak" }
                speak("Sorry, I didn't catch that. Try again.")
            }
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val text = matches[0]
                    Log.d(TAG, "Recognized: $text")
                    sendTextToServer(text)
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        speechRecognizer.startListening(intent)
    }

    private fun stopListening() {
        speechRecognizer.stopListening()
        isListening = false
        speakButton.text = "Hold to Speak"
    }

    // ==================== SEND TEXT TO SERVER ====================
    private fun sendTextToServer(text: String) {
        runOnUiThread { statusText.text = "Thinking..." }
        
        val json = JSONObject().apply {
            put("type", "text")
            put("text", text)
        }
        webSocket?.send(json.toString())
    }

    // ==================== ACTION EXECUTION ====================
    private fun executeAction(action: JSONObject) {
        val actionType = action.optString("type", "")
        
        when (actionType) {
            "launch_app" -> launchApp(action.getString("package"))
            "go_back" -> JarvisService.instance?.goBack()
            "go_home" -> JarvisService.instance?.goHome()
            "open_recents" -> JarvisService.instance?.openRecents()
            "read_screen" -> readScreen()
            "list_buttons" -> listButtons()
            "scroll_down" -> {
                JarvisService.instance?.let { service ->
                    service.findClickableElements().firstOrNull()?.let {
                        service.scrollForward(it)
                    }
                }
            }
            "scroll_up" -> {
                JarvisService.instance?.let { service ->
                    service.findClickableElements().firstOrNull()?.let {
                        service.scrollBackward(it)
                    }
                }
            }
            "click" -> clickElement(action.optString("target", ""))
        }
    }

    private fun launchApp(packageName: String) {
        try {
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                speak("Opened.")
            } else {
                speak("App not found on your phone.")
            }
        } catch (e: Exception) {
            speak("Cannot open this app.")
        }
    }

    private fun readScreen() {
        if (JarvisService.isRunning) {
            val service = JarvisService.instance
            val summary = service?.getScreenSummary() ?: "Cannot read screen."
            speak(summary)
            
            // Also send screen data to server for AI understanding
            val elements = service?.findClickableElements() ?: emptyList()
            val screenData = JSONObject().apply {
                put("type", "screen_data")
                put("elements", org.json.JSONArray().apply {
                    elements.forEach { element ->
                        put(JSONObject().apply {
                            put("text", element.text)
                            put("description", element.description)
                            put("clickable", element.isClickable)
                        })
                    }
                })
            }
            webSocket?.send(screenData.toString())
        } else {
            speak("Accessibility service not enabled. Please enable it in settings.")
        }
    }

    private fun listButtons() {
        if (JarvisService.isRunning) {
            val service = JarvisService.instance
            val buttons = service?.findClickableElements()
            if (buttons.isNullOrEmpty()) {
                speak("No buttons found on screen.")
            } else {
                val buttonText = buttons.take(5).mapIndexed { index, element ->
                    "${index + 1}: ${element.text.ifEmpty { element.description }}"
                }.joinToString(". ")
                speak("Buttons available: $buttonText")
            }
        }
    }

    private fun clickElement(target: String) {
        if (JarvisService.isRunning) {
            val service = JarvisService.instance
            val element = service?.findElementByText(target)
            if (element != null) {
                service?.clickElement(element)
                speak("Clicked.")
            } else {
                speak("Button not found.")
            }
        }
    }

    // ==================== PERMISSIONS ====================
    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.INTERNET
        )

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), PERMISSION_REQUEST)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                speak("Permissions granted. Ready to help!")
            } else {
                speak("Some permissions are needed for voice features.")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocket?.close(1000, "App closed")
        tts.stop()
        tts.shutdown()
        speechRecognizer.destroy()
    }
}
