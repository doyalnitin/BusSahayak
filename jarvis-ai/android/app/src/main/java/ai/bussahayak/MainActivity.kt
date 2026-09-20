package ai.bussahayak

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
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
import okio.ByteString
import okio.ByteString.Companion.toByteString
import org.json.JSONObject
import java.io.IOException
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * JARVIS Main Activity - Gemini Live API
 * Streams audio to cloud server for real-time voice interaction
 */
class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    companion object {
        const val TAG = "JARVIS"
        const val SERVER_URL = "wss://bussahayak.onrender.com/ws/voice"
        const val SERVER_HTTP = "https://bussahayak.onrender.com"
        const val PERMISSION_REQUEST = 100
        const val SAMPLE_RATE = 16000
        const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
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
    
    // Audio recording
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingThread: Thread? = null

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
            runOnUiThread { statusText.text = text }
        }
    }

    // ==================== WEBSOCKET CONNECTION ====================
    private fun connectWebSocket() {
        val request = Request.Builder()
            .url(SERVER_URL)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket connected")
                isWebSocketConnected = true
                runOnUiThread {
                    statusText.text = "Connected to JARVIS AI"
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val type = json.getString("type")
                    
                    when (type) {
                        "connected" -> {
                            Log.d(TAG, "Server: ${json.getString("text")}")
                        }
                        "response", "audio_response", "text_response" -> {
                            val responseText = json.optString("text", "")
                            val audio = json.optString("audio", "")
                            
                            runOnUiThread {
                                speak(responseText)
                                statusText.text = responseText
                            }
                            
                            // If there's audio from Gemini, play it
                            if (audio.isNotEmpty()) {
                                playGeminiAudio(audio)
                            }
                            
                            // Execute action if any
                            val action = json.optJSONObject("action")
                            if (action != null) {
                                executeAction(action)
                            }
                        }
                        "screen_summary" -> {
                            val text = json.getString("text")
                            speak(text)
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
                runOnUiThread {
                    statusText.text = "Connection lost. Reconnecting..."
                }
                // Reconnect after 3 seconds
                Thread.sleep(3000)
                connectWebSocket()
            }
        })
    }

    // ==================== AUDIO STREAMING ====================
    private fun startListening() {
        if (!isWebSocketConnected) {
            speak("Not connected to server. Please wait.")
            return
        }

        isListening = true
        isRecording = true
        speakButton.text = "Listening..."

        // Start streaming audio to Gemini Live
        startAudioStreaming()
    }

    private fun stopListening() {
        isListening = false
        isRecording = false
        speakButton.text = "Hold to Speak"
        stopAudioStreaming()
    }

    private fun startAudioStreaming() {
        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        
        try {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
                return
            }

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )

            audioRecord?.startRecording()
            
            recordingThread = Thread {
                val buffer = ShortArray(1024)
                while (isRecording) {
                    val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (read > 0) {
                        // Convert short array to byte array
                        val byteBuffer = ByteArray(read * 2)
                        for (i in 0 until read) {
                            byteBuffer[i * 2] = (buffer[i].toInt() and 0xFF).toByte()
                            byteBuffer[i * 2 + 1] = (buffer[i].toInt() shr 8 and 0xFF).toByte()
                        }
                        
                        // Send audio chunk to server
                        val audioB64 = android.util.Base64.encodeToString(byteBuffer, android.util.Base64.NO_WRAP)
                        val message = JSONObject().apply {
                            put("type", "audio")
                            put("data", audioB64)
                        }
                        webSocket?.send(message.toString())
                    }
                }
            }.apply { start() }

        } catch (e: Exception) {
            Log.e(TAG, "Audio recording failed: ${e.message}")
        }
    }

    private fun stopAudioRecording() {
        try {
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
        } catch (e: Exception) {
            Log.e(TAG, "Stop recording failed: ${e.message}")
        }
    }

    private fun stopAudioStreaming() {
        isRecording = false
        recordingThread?.join(1000)
        stopAudioRecording()
    }

    private fun playGeminiAudio(audioB64: String) {
        try {
            val audioBytes = android.util.Base64.decode(audioB64, android.util.Base64.NO_WRAP)
            
            // Gemini outputs 24kHz 16-bit PCM audio
            val sampleRate = 24000
            val channelConfig = AudioFormat.CHANNEL_OUT_MONO
            val encoding = AudioFormat.ENCODING_PCM_16BIT
            
            val bufferSize = AudioTrack.getMinBufferSize(sampleRate, channelConfig, encoding)
            
            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    android.media.AudioAttributes.Builder()
                        .setUsage(android.media.AudioAttributes.USAGE_MEDIA)
                        .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setSampleRate(sampleRate)
                        .setChannelMask(channelConfig)
                        .setEncoding(encoding)
                        .build()
                )
                .setBufferSizeInBytes(bufferSize)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()
            
            audioTrack.play()
            audioTrack.write(audioBytes, 0, audioBytes.size)
            
        } catch (e: Exception) {
            Log.e(TAG, "Play audio failed: ${e.message}")
        }
    }

    // ==================== COMMAND PROCESSING ====================
    private fun processVoiceCommand(text: String) {
        speak("Processing: $text")
        
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
            "launch_app" -> {
                val packageName = action.getString("package")
                launchApp(packageName)
            }
            "go_back" -> JarvisService.instance?.goBack()
            "go_home" -> JarvisService.instance?.goHome()
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
            "click" -> {
                val target = action.optString("target", "")
                clickElement(target)
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

    // ==================== SPEECH RECOGNITION (FALLBACK) ====================
    private fun startSpeechRecognition() {
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
                    processVoiceCommand(matches[0])
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        speechRecognizer.startListening(intent)
    }

    // ==================== PERMISSIONS ====================
    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.INTERNET,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE
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
        stopAudioRecording()
        webSocket?.close(1000, "App closed")
        tts.stop()
        tts.shutdown()
        speechRecognizer.destroy()
    }
}
