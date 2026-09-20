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
import android.widget.Toast
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

/**
 * JARVIS Main Activity
 * Listens for voice commands, sends to AI server, executes actions
 */
class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    companion object {
        const val TAG = "JARVIS"
        const val SERVER_URL = "https://bussahayak.onrender.com" // Cloud server
        const val PERMISSION_REQUEST = 100
    }

    private lateinit var tts: TextToSpeech
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var statusText: TextView
    private lateinit var speakButton: Button
    private lateinit var webSocket: WebSocket

    private val client = OkHttpClient.Builder()
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private var isListening = false
    private var isReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        speakButton = findViewById(R.id.speakButton)

        // Initialize TTS
        tts = TextToSpeech(this, this)

        // Initialize Speech Recognizer
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        // Check permissions
        checkPermissions()

        // Connect to server
        connectToServer()

        // Button click to start listening
        speakButton.setOnClickListener {
            if (isListening) {
                stopListening()
            } else {
                startListening()
            }
        }

        // Long press for screen reading
        speakButton.setOnLongClickListener {
            readScreen()
            true
        }

        speak("JARVIS ready. Say hey JARVIS or tap the button.")
    }

    // ==================== TTS INIT ====================

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.US
            isReady = true
        }
    }

    private fun speak(text: String) {
        if (isReady) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utteranceId")
            statusText.text = text
        }
    }

    // ==================== SPEECH RECOGNITION ====================

    private fun startListening() {
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
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN") // Indian English
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
                speakButton.text = "Hold to Speak"
            }

            override fun onError(error: Int) {
                isListening = false
                speakButton.text = "Hold to Speak"
                speak("Sorry, I didn't catch that. Try again.")
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val text = matches[0]
                    processVoiceCommand(text)
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

    // ==================== COMMAND PROCESSING ====================

    private fun processVoiceCommand(text: String) {
        speak("Processing: $text")

        // Send to cloud server via HTTP POST
        val json = JSONObject().apply {
            put("text", text)
        }

        val requestBody = json.toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$SERVER_URL/api/chat")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    speak("Connection error. Is the server running?")
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: ""
                try {
                    val jsonResponse = JSONObject(body)
                    val replyText = jsonResponse.getString("text")
                    val action = jsonResponse.optJSONObject("action")

                    runOnUiThread {
                        speak(replyText)

                        // Execute action if any
                        if (action != null) {
                            executeAction(action)
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread {
                        speak("Sorry, I didn't understand that.")
                    }
                }
            }
        })
    }

    // ==================== ACTION EXECUTION ====================

    private fun executeAction(action: JSONObject) {
        val actionType = action.getString("type")

        when (actionType) {
            "launch_app" -> {
                val packageName = action.getString("package")
                launchApp(packageName)
            }
            "go_back" -> {
                JarvisService.instance?.goBack()
            }
            "go_home" -> {
                JarvisService.instance?.goHome()
            }
            "read_screen" -> {
                readScreen()
            }
            "list_buttons" -> {
                listButtons()
            }
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
            "click" -> {
                // Find and click element
                val target = action.optString("target", "")
                clickElement(target)
            }
            "type_text" -> {
                val text = action.optString("text", "")
                typeInFocusedElement(text)
            }
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
                speak("App not found.")
            }
        } catch (e: Exception) {
            speak("Cannot open this app.")
        }
    }

    private fun readScreen() {
        // Get accessibility service to read screen
        if (JarvisService.isRunning) {
            val service = JarvisService.instance
            val summary = service?.getScreenSummary() ?: "Cannot read screen."
            speak(summary)
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

    private fun typeInFocusedElement(text: String) {
        speak("Typing: $text")
        // Implementation would use AccessibilityService to type
    }

    // ==================== SERVER CONNECTION ====================

    private fun connectToServer() {
        val request = Request.Builder()
            .url("$SERVER_URL/health")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    statusText.text = "Server offline. Run: python3 jarvis_server.py"
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    statusText.text = "Connected to AI server"
                }
            }
        })
    }

    // ==================== PERMISSIONS ====================

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.INTERNET,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
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

    // ==================== LIFECYCLE ====================

    override fun onDestroy() {
        super.onDestroy()
        tts.stop()
        tts.shutdown()
        speechRecognizer.destroy()
    }
}
