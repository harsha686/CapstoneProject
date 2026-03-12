/**
 * VoiceAssistantWidget.js
 * 
 * Self-contained floating panel for the SecureVote Voice Assistant.
 * Features:
 *  - Language selector: EN / हिं / తె
 *  - Animated mic button (idle / listening / speaking states)
 *  - Transcript display
 *  - Error bar (unsupported browser, mic denied)
 */
import React, { useState } from 'react';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import { LANGUAGES } from '../utils/voiceLocale';

const LANG_OPTIONS = Object.values(LANGUAGES);

const VoiceAssistantWidget = ({
    candidates,
    onSelectCandidate,
    onSelectNota,
    onConfirmVote,
    onCancel,
}) => {
    const [selectedLang, setSelectedLang] = useState('en-IN');

    const {
        phase,
        isActive,
        isSpeaking,
        isListening,
        transcript,
        error,
        activate,
        deactivate,
        PHASE,
    } = useVoiceAssistant({
        candidates,
        selectedLang,
        onSelectCandidate,
        onSelectNota,
        onConfirmVote,
        onCancel,
    });

    // ─── Derived UI state ─────────────────────────────────────────────────────────
    const micState = isListening ? 'listening' : isSpeaking ? 'speaking' : isActive ? 'active' : 'idle';

    const statusLabel = {
        listening: '🎤 Listening...',
        speaking: '🔊 Speaking...',
        active: phase === PHASE.CONFIRMING ? '⏳ Awaiting your confirmation...' : '⏳ Processing...',
        idle: '🎙 Press the mic to start',
    }[micState];

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="voice-assistant-widget">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">♿</span>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">Voice Assistant</h3>
                        <p className="text-xs text-gray-500">Accessibility Feature</p>
                    </div>
                </div>
                {/* Language Selector Pills */}
                <div className="flex space-x-1">
                    {LANG_OPTIONS.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => !isActive && setSelectedLang(lang.code)}
                            disabled={isActive}
                            title={lang.displayName}
                            className={`voice-lang-pill ${selectedLang === lang.code ? 'active' : ''} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Bar */}
            {error && (
                <div className="voice-error-bar">
                    <span className="text-sm">
                        {error.type === 'UNSUPPORTED'
                            ? '⚠️ Voice not supported. Please use Chrome or Edge.'
                            : error.type === 'MIC_DENIED'
                                ? '🔒 Mic access denied. Enable it in browser settings.'
                                : '⚠️ An error occurred. Please try again.'}
                    </span>
                </div>
            )}

            {/* Mic Area */}
            <div className="flex flex-col items-center py-4">
                <div className="voice-mic-container">
                    {/* Outer ping ring — shown only when listening */}
                    {isListening && (
                        <>
                            <span className="voice-mic-ring ring-1" />
                            <span className="voice-mic-ring ring-2" />
                        </>
                    )}

                    {/* Mic Button */}
                    <button
                        id="voice-mic-btn"
                        onClick={isActive ? deactivate : activate}
                        disabled={!!error}
                        className={`voice-mic-btn ${micState}`}
                        title={isActive ? 'Stop Voice Assistant' : 'Start Voice Assistant'}
                        aria-label={isActive ? 'Stop Voice Assistant' : 'Start Voice Assistant'}
                    >
                        {micState === 'speaking' ? (
                            /* Sound wave icon when TTS is active */
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                            </svg>
                        ) : (
                            /* Microphone icon */
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5z" />
                                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291A6.751 6.751 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Status Label */}
                <p className={`voice-status-label ${micState}`}>{statusLabel}</p>

                {/* Transcript */}
                {transcript && micState !== 'idle' && (
                    <div className="voice-transcript">
                        <span className="text-xs text-gray-400 mr-1">Heard:</span>
                        <span className="text-xs text-gray-600 italic">"{transcript}"</span>
                    </div>
                )}
            </div>

            {/* Instructions */}
            {!isActive && !error && (
                <div className="voice-instructions">
                    <p className="text-xs text-gray-500 text-center">
                        Select language, then press the mic. Say a <strong>candidate name</strong> or <strong>number</strong> to vote.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistantWidget;
