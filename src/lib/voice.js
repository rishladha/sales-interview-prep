// Sarvam AI Voice Integration
// Supports Indian English and regional languages with excellent accuracy

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY

// Speech-to-Text using Sarvam's Saaras v3 model
export async function transcribeAudio(audioBlob) {
  if (!SARVAM_API_KEY) {
    console.warn('Sarvam API key not found, falling back to browser speech recognition')
    return null
  }

  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'saaras:v3')
    formData.append('language_code', 'en-IN')

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Sarvam STT error:', error)
      return null
    }

    const data = await response.json()
    return data.transcript || data.text || null
  } catch (error) {
    console.error('Sarvam transcription error:', error)
    return null
  }
}

// Text-to-Speech using Sarvam's Bulbul model
export async function synthesizeSpeech(text, voice = 'meera') {
  if (!SARVAM_API_KEY) {
    console.warn('Sarvam API key not found')
    return null
  }

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: 'en-IN',
        speaker: voice,
        model: 'bulbul:v1',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Sarvam TTS error:', error)
      return null
    }

    const data = await response.json()
    
    if (data.audios && data.audios[0]) {
      // Return base64 audio data
      return data.audios[0]
    }
    
    return null
  } catch (error) {
    console.error('Sarvam TTS error:', error)
    return null
  }
}

// Play audio from base64
export function playBase64Audio(base64Audio) {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`)
      audio.onended = resolve
      audio.onerror = reject
      audio.play()
    } catch (error) {
      reject(error)
    }
  })
}

// Audio recorder class for capturing microphone input
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
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start(100) // Collect data every 100ms
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
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        
        // Stop all tracks
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
