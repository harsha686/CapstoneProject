/**
 * useVoiceSynthesis.js
 * A clean Promise-based wrapper around window.speechSynthesis.
 * Resolves when the utterance finishes speaking.
 */
import { useState, useCallback } from 'react';

const useVoiceSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const isSupported = 'speechSynthesis' in window;

    /**
     * Speak text in the given language.
     * Returns a Promise that resolves when speaking is done.
     * @param {string} text
     * @param {string} lang  e.g. 'en-IN', 'hi-IN', 'te-IN'
     * @returns {Promise<void>}
     */
    const speak = useCallback((text, lang = 'en-IN') => {
        return new Promise((resolve) => {
            if (!isSupported || !text) {
                resolve();
                return;
            }

            // Cancel any active speech first
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Pick a matching voice if available
            const pickVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                // Prefer an exact lang match, else a regional match, else first available
                return (
                    voices.find((v) => v.lang === lang) ||
                    voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ||
                    voices.find((v) => v.lang.includes('IN')) ||
                    voices[0] ||
                    null
                );
            };

            const assignVoiceAndSpeak = () => {
                const voice = pickVoice();
                if (voice) utterance.voice = voice;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => {
                    setIsSpeaking(false);
                    resolve();
                };
                utterance.onerror = () => {
                    setIsSpeaking(false);
                    resolve(); // resolve (not reject) so the caller can continue
                };

                window.speechSynthesis.speak(utterance);
            };

            // Voices may not be loaded yet in some browsers
            if (window.speechSynthesis.getVoices().length > 0) {
                assignVoiceAndSpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.onvoiceschanged = null;
                    assignVoiceAndSpeak();
                };
                // Fallback timeout in case onvoiceschanged never fires
                setTimeout(() => {
                    if (!isSpeaking) assignVoiceAndSpeak();
                }, 1000);
            }
        });
    }, [isSupported, isSpeaking]);

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return { speak, cancel, isSpeaking, isSupported };
};

export default useVoiceSynthesis;
