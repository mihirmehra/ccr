"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseVoiceSearchOptions {
  lang?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseVoiceSearchReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  error: string | null
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}): UseVoiceSearchReturn {
  const { lang = "en-US", onResult, onError } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null

    if (!SpeechRecognition) {
      const msg = "Voice search is not supported in this browser."
      setError(msg)
      onError?.(msg)
      return
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.results[event.results.length - 1]
      const text = current[0].transcript

      setTranscript(text)

      if (current.isFinal) {
        onResult?.(text)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let msg = "An error occurred during voice recognition."
      if (event.error === "not-allowed") {
        msg = "Microphone access was denied. Please allow microphone permissions."
      } else if (event.error === "no-speech") {
        msg = "No speech was detected. Please try again."
      } else if (event.error === "network") {
        msg = "Network error occurred. Please check your connection."
      }
      setError(msg)
      setIsListening(false)
      onError?.(msg)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch {
      setError("Could not start voice recognition.")
      setIsListening(false)
    }
  }, [lang, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    error,
  }
}
