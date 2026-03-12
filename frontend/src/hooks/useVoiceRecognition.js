/**
 * useVoiceRecognition.js
 * Promise-based wrapper around the native SpeechRecognition API.
 * continuous = false: stops automatically after one result (privacy/battery safe).
 */
import { useState, useCallback, useRef } from 'react';

const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition || null;

    const isSupported = !!SpeechRecognitionAPI;

    /**
     * Listen for one voice command and return its transcript.
     * @param {string} lang  e.g. 'en-IN'
     * @returns {Promise<string>}  resolves with transcript, rejects with error code
     */
    const listen = useCallback(
        (lang = 'en-IN') => {
            return new Promise((resolve, reject) => {
                if (!SpeechRecognitionAPI) {
                    reject(new Error('UNSUPPORTED'));
                    return;
                }

                // Abort any previous session
                if (recognitionRef.current) {
                    try { recognitionRef.current.abort(); } catch (_) { }
                }

                const recognition = new SpeechRecognitionAPI();
                recognitionRef.current = recognition;

                recognition.lang = lang;
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => setIsListening(true);

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setIsListening(false);
                    resolve(transcript);
                };

                recognition.onerror = (event) => {
                    setIsListening(false);
                    // 'no-speech' is recoverable; 'not-allowed' is fatal
                    reject(new Error(event.error.toUpperCase().replace(/-/g, '_')));
                };

                recognition.onend = () => {
                    setIsListening(false);
                    // If onend fires without onresult (e.g. silence timeout), reject
                    // We use a small guard to avoid double-reject if onresult already ran
                };

                try {
                    recognition.start();
                } catch (err) {
                    setIsListening(false);
                    reject(new Error('START_FAILED'));
                }
            });
        },
        [SpeechRecognitionAPI]
    );

    const abort = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (_) { }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    return { listen, abort, isListening, isSupported };
};

export default useVoiceRecognition;
