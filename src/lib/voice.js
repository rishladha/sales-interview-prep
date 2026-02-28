// Sarvam AI Voice Integration - Fixed Version 2
// Supports Indian English and regional languages

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY

// Speech-to-Text using Sarvam's API
export async function transcribeAudio(audioBlob) {
  if (!SARVAM_API_KEY) {
    console.warn('Sarvam API key not found')
    return null
  }

  try {
    // Create a new blob with simple mime type (no codec specification)
    const cleanBlob = new Blob([audioBlob], { type: 'audio/webm' })
    
    const formData = new FormData()
    // Use .webm extension explicitly
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

// Text-to-Speech using Sarvam's Bulbul v3 model
export async function synthesizeSpeech(text, speaker = 'aditya') {
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
        speaker: speaker,
        model: 'bulbul:v3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sarvam TTS error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    console.log('Sarvam TTS response:', data)
    
    if (data.audios && data.audios[0]) {
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
      this.mediaRecorder = new MediaRecorder(this.stream, { 
        mimeType: 'audio/webm'
      })
      
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
        // Create blob with simple type
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
