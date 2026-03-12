/**
 * useVoiceAssistant.js  (v2 — full rewrite)
 *
 * Orchestrates the two-way voice assistant for the SecureVote ballot page.
 *
 * State machine (phase):
 *   idle  →  greeting  →  listening_name  →  confirming  →  done
 *                                ↑________________↓ (no match / cancel)
 *
 * Usage:
 *   const va = useVoiceAssistant({ candidates, selectedLang, onSelectCandidate,
 *                                   onConfirmVote, onCancel });
 *   <button onClick={va.activate}>Start</button>
 */
import { useState, useCallback, useRef } from 'react';
import useVoiceSynthesis from './useVoiceSynthesis';
import useVoiceRecognition from './useVoiceRecognition';
import { getLocale } from '../utils/voiceLocale';
import { matchCandidate, normalise } from '../utils/levenshtein';

// Phase constants
const PHASE = {
    IDLE: 'idle',
    GREETING: 'greeting',
    LISTENING_NAME: 'listening_name',
    CONFIRMING: 'confirming',
    DONE: 'done',
};

const useVoiceAssistant = ({
    candidates = [],
    selectedLang = 'en-IN',
    onSelectCandidate,
    onSelectNota,
    onConfirmVote,
    onCancel,
}) => {
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);     // { type: 'UNSUPPORTED' | 'MIC_DENIED' | ... }
    const [pendingCandidate, setPendingCandidate] = useState(null);

    const { speak, cancel: cancelSpeech, isSpeaking } = useVoiceSynthesis();
    const { listen, abort: abortListen, isListening } = useVoiceRecognition();

    // Keep a ref to the current lang so async callbacks always read the latest value
    const langRef = useRef(selectedLang);
    langRef.current = selectedLang;

    // Guard: are we already running (to prevent double-activation)
    const activeRef = useRef(false);
    // Forward refs to break circular useCallback deps
    const handleListeningForNameRef = useRef(null);
    const handleConfirmationRef = useRef(null);

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    const safeSpeak = useCallback(
        (text) => speak(text, langRef.current),
        [speak]
    );

    const safeListen = useCallback(
        () => listen(langRef.current),
        [listen]
    );

    // ─── Core State-Machine Loop ──────────────────────────────────────────────────

    /**
     * handleListeningForName
     * Speak prompt → listen → match → branch to confirming or retry
     */
    const handleListeningForName = useCallback(async () => {
        const locale = getLocale(langRef.current);
        setPhase(PHASE.LISTENING_NAME);

        let gotTranscript = '';
        try {
            gotTranscript = await safeListen();
        } catch (err) {
            const errCode = err.message;

            if (errCode === 'NOT_ALLOWED') {
                setError({ type: 'MIC_DENIED' });
                await safeSpeak(locale.errorMicDenied);
                setPhase(PHASE.IDLE);
                activeRef.current = false;
                return;
            }

            if (errCode === 'NO_SPEECH') {
                await safeSpeak(locale.noSpeechMessage);
                // Retry listening
                handleListeningForNameRef.current && handleListeningForNameRef.current();
                return;
            }

            // Any other error — bail
            setPhase(PHASE.IDLE);
            activeRef.current = false;
            return;
        }

        setTranscript(gotTranscript);
        const t = normalise(gotTranscript);

        // Check for NOTA keywords
        if (locale.notaKeywords.some((kw) => t.includes(normalise(kw)))) {
            setPendingCandidate({ id: -1, name: 'None of the Above' });
            setPhase(PHASE.CONFIRMING);
            await safeSpeak(locale.confirmPrompt('None of the Above'));
            handleConfirmationRef.current && handleConfirmationRef.current({ id: -1, name: 'None of the Above' });
            return;
        }

        // Check for numeric selection (e.g. "number 1", "ek", "1")
        const numMatch = t.match(/\b(\d+)\b/);
        if (numMatch) {
            const n = parseInt(numMatch[1]);
            if (n >= 1 && n <= candidates.length) {
                const c = candidates[n - 1];
                setPendingCandidate(c);
                onSelectCandidate(c.id);
                setPhase(PHASE.CONFIRMING);
                await safeSpeak(locale.confirmPrompt(c.name));
                handleConfirmationRef.current && handleConfirmationRef.current(c);
                return;
            }
            if (n === candidates.length + 1) {
                setPendingCandidate({ id: -1, name: 'None of the Above' });
                setPhase(PHASE.CONFIRMING);
                await safeSpeak(locale.confirmPrompt('None of the Above'));
                handleConfirmationRef.current && handleConfirmationRef.current({ id: -1, name: 'None of the Above' });
                return;
            }
        }

        // Fuzzy candidate name match
        const match = matchCandidate(gotTranscript, candidates);
        if (match) {
            const { candidate } = match;
            setPendingCandidate(candidate);
            onSelectCandidate(candidate.id);
            setPhase(PHASE.CONFIRMING);
            await safeSpeak(locale.confirmPrompt(candidate.name));
            handleConfirmationRef.current && handleConfirmationRef.current(candidate);
            return;
        }

        // No match
        await safeSpeak(locale.noMatchMessage);
        handleListeningForNameRef.current && handleListeningForNameRef.current();
    }, [candidates, safeSpeak, safeListen, onSelectCandidate]);

    // Store latest version in refs to break circular deps
    handleListeningForNameRef.current = handleListeningForName;

    /**
     * handleConfirmation
     * Listen for yes/no after a candidate is proposed.
     */
    const handleConfirmation = useCallback(async (candidate) => {
        const locale = getLocale(langRef.current);

        let gotTranscript = '';
        try {
            gotTranscript = await safeListen();
        } catch (err) {
            if (err.message === 'NO_SPEECH') {
                // Re-prompt and listen again
                await safeSpeak(locale.confirmPrompt(candidate.name));
                handleConfirmationRef.current && handleConfirmationRef.current(candidate);
                return;
            }
            setPhase(PHASE.IDLE);
            activeRef.current = false;
            return;
        }

        setTranscript(gotTranscript);
        const t = normalise(gotTranscript);

        const isYes = locale.confirmWords.some((w) => t.includes(normalise(w)));
        const isNo = locale.cancelWords.some((w) => t.includes(normalise(w)));

        if (isYes) {
            setPhase(PHASE.DONE);
            await safeSpeak(locale.successMessage);
            if (candidate.id === -1) {
                onSelectNota();
            }
            onConfirmVote();
            activeRef.current = false;
            return;
        }

        if (isNo) {
            setPendingCandidate(null);
            onCancel();
            await safeSpeak(locale.cancelMessage);
            handleListeningForNameRef.current && handleListeningForNameRef.current();
            return;
        }

        // Unclear answer — re-prompt
        await safeSpeak(locale.confirmPrompt(candidate.name));
        handleConfirmationRef.current && handleConfirmationRef.current(candidate);
    }, [safeSpeak, safeListen, onSelectNota, onConfirmVote, onCancel]);

    handleConfirmationRef.current = handleConfirmation;

    // ─── Public API ───────────────────────────────────────────────────────────────

    const activate = useCallback(async () => {
        if (activeRef.current) return;
        activeRef.current = true;
        setError(null);
        setTranscript('');
        setPendingCandidate(null);

        const recogSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

        if (!recogSupported) {
            setError({ type: 'UNSUPPORTED' });
            setPhase(PHASE.IDLE);
            activeRef.current = false;
            return;
        }

        setPhase(PHASE.GREETING);
        const locale = getLocale(langRef.current);

        // 1. Speak greeting
        await safeSpeak(locale.greeting);

        // 2. Read candidate list
        if (candidates.length > 0) {
            await safeSpeak(locale.readCandidates(candidates));
        }

        // 3. Enter listening loop
        handleListeningForName();
    }, [candidates, safeSpeak, handleListeningForName]);

    const deactivate = useCallback(() => {
        const locale = getLocale(langRef.current);
        cancelSpeech();
        abortListen();
        safeSpeak(locale.deactivatedMessage);
        activeRef.current = false;
        setPhase(PHASE.IDLE);
        setTranscript('');
        setPendingCandidate(null);
        setError(null);
    }, [cancelSpeech, abortListen, safeSpeak]);

    const isActive = phase !== PHASE.IDLE && phase !== PHASE.DONE;

    return {
        phase,
        isActive,
        isSpeaking,
        isListening,
        transcript,
        error,
        pendingCandidate,
        activate,
        deactivate,
        PHASE,
    };
};

export default useVoiceAssistant;
