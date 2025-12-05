/**
 * Speech-to-Text Client
 * Handles both Whisper API and Chrome native speech recognition
 */

import { getLLMConfig, getSessionToken, isLocalProxy } from './llm-config'

export type TranscriptionResponse = {
  text: string
}

let activeChromeRecognition: SpeechRecognition | null = null

type ErrorResponse = {
  error: string
}

/**
 * Transcribe audio using Whisper V3 (Infomaniak)
 */
async function transcribeWithWhisper(
  audioBlob: Blob,
): Promise<TranscriptionResponse> {
  const config = getLLMConfig()

  if (!config.proxyURL) {
    throw new Error(
      'Proxy server required. Please start the local proxy server.',
    )
  }

  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper')
    formData.append('language', 'fr')
    formData.append('response_format', 'text')

    // Build URL based on environment
    const url = config.isLocalProxy
      ? `${config.proxyURL}/api/audio/transcriptions`
      : `${config.proxyURL}/transcribe.php`

    const headers: { [key: string]: string } = {}

    // Add session token for online mode
    if (!isLocalProxy()) {
      const token = getSessionToken()
      if (!token) {
        throw new Error('Session required. Please reopen the chat panel.')
      }

      headers['X-Session-Token'] = token
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error: ErrorResponse = (await response
        .json()
        .catch(() => ({ error: 'Transcription failed' }))) as ErrorResponse
      throw new Error(
        `Transcription Error: ${response.status} - ${JSON.stringify(error)}`,
      )
    }

    const result = (await response.json()) as { text: string }
    return { text: result.text ?? '' }
  } catch (error) {
    console.error('Whisper API Error:', error)
    throw error
  }
}

/**
 * Stop active Chrome native speech recognition
 */
export function stopChromeRecognition(): void {
  if (activeChromeRecognition) {
    try {
      activeChromeRecognition.stop()
      activeChromeRecognition = null
    } catch (err) {
      console.error('Error stopping recognition:', err)
    }
  }
}

/**
 * Transcribe audio using Chrome native speech recognition
 * Note: Chrome native ignores the audioBlob and listens directly from microphone
 */
function transcribeWithChromeNative(): Promise<TranscriptionResponse> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window)) {
      reject(
        new Error(
          'Speech recognition not supported in this browser. Please use Chrome.',
        ),
      )
      return
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const SpeechRecognitionConstructor = (window.webkitSpeechRecognition ??
      window.SpeechRecognition) as { new (): SpeechRecognition }
    const recognition = new SpeechRecognitionConstructor()
    activeChromeRecognition = recognition

    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript =
        (event.results[0]?.[0]?.transcript as string | undefined) ?? ''
      recognition.stop()
      activeChromeRecognition = null
      resolve({ text: transcript })
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognition.stop()
      activeChromeRecognition = null
      if (event.error === 'no-speech') {
        resolve({ text: '' })
      } else {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }
    }

    try {
      recognition.start()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Main transcription function - routes to the appropriate engine
 */
export async function transcribeAudio(
  audioBlob: Blob,
  engine: 'whisper' | 'chrome-native' = 'whisper',
): Promise<TranscriptionResponse> {
  if (engine === 'chrome-native') {
    return transcribeWithChromeNative()
  }
  return transcribeWithWhisper(audioBlob)
}
