// Sarvam AI Voice Integration - STT Only (No TTS)
// Fixed audio format for Sarvam API

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY

// Speech-to-Text using Sarvam's API
export async function transcribeAudio(audioBlob) {
  if (!SARVAM_API_KEY) {
    console.warn('Sarvam API key not found')
    return null
  }

  try {
    // Create a clean blob with simple mime type (no codec specification)
    // Sarvam doesn't accept "audio/webm;codecs=opus", only "audio/webm"
    const cleanBlob = new Blob([audioBlob], { type: 'audio/webm' })
    
    const formData = new FormData()
    formData.append('file', cleanBlob, 'recording.webm')
    
    console.log('Sending to Sarvam, blob size:', cleanBlob.size, 'type:', cleanBlob.type)

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sarvam STT error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    console.log('Sarvam STT response:', data)
    return data.transcript || null
  } catch (error) {
    console.error('Sarvam transcription error:', error)
    return null
  }
}

// Audio recorder class - records as simple webm
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      })
      
      // Use simple webm without codec specification
      // This is important - Sarvam rejects "audio/webm;codecs=opus"
      let mimeType = 'audio/webm'
      
      // Fallback for browsers that don't support plain webm
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType })
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start(100)
      console.log('Recording started with mimeType:', this.mediaRecorder.mimeType)
      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      return false
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = () => {
        // Always create blob with simple type (Sarvam requirement)
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        console.log('Recording stopped, blob size:', audioBlob.size)
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
        }
        
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording() {
    return this.mediaRecorder?.state === 'recording'
  }
}

// Browser fallback speech recognition
export function createBrowserSpeechRecognition(onResult, onEnd) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Browser speech recognition not supported')
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-IN'

  let finalTranscript = ''

  recognition.onresult = (event) => {
    let interimTranscript = ''
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
      } else {
        interimTranscript += transcript
      }
    }
    
    onResult(finalTranscript, interimTranscript)
  }

  recognition.onend = () => {
    onEnd(finalTranscript.trim())
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    onEnd(finalTranscript.trim())
  }

  return {
    start: () => {
      finalTranscript = ''
      recognition.start()
    },
    stop: () => {
      recognition.stop()
    }
  }
}

// Check if Sarvam is available
export function isSarvamAvailable() {
  return !!SARVAM_API_KEY
}
