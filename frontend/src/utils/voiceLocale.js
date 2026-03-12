/**
 * voiceLocale.js
 * All language-specific strings and settings for the SecureVote Voice Assistant.
 */

export const LANGUAGES = {
    'en-IN': {
        code: 'en-IN',
        label: 'EN',
        displayName: 'English',
        greeting: 'Voice assistant activated. I will read out the candidates. Please say the name of the candidate you want to vote for.',
        readCandidates: (candidates) => {
            let text = 'The candidates in your constituency are: ';
            candidates.forEach((c, i) => {
                text += `Number ${i + 1}: ${c.name} from ${c.party?.name || 'Independent'}. `;
            });
            text += `Number ${candidates.length + 1}: None of the Above. `;
            text += 'Please say the candidates name or their number to select.';
            return text;
        },
        confirmPrompt: (name) =>
            `You selected ${name}. Say Yes to confirm your vote, or No to choose again.`,
        successMessage: 'Your vote has been confirmed. Thank you for participating in the democratic process.',
        noMatchMessage: 'I could not match that to any candidate. Please try saying the full name slowly, or say their number.',
        noSpeechMessage: 'I did not hear anything. Please try again.',
        cancelMessage: 'Selection cancelled. Please say a candidate name to begin again.',
        errorMicDenied: 'Microphone access was denied. Please allow microphone access in your browser settings and try again.',
        errorUnsupported: 'Your browser does not support voice features. Please use Google Chrome or Microsoft Edge.',
        deactivatedMessage: 'Voice assistant deactivated.',
        confirmWords: ['yes', 'yeah', 'yep', 'correct', 'confirm', 'ok', 'okay'],
        cancelWords: ['no', 'nope', 'cancel', 'back', 'wrong'],
        notaKeywords: ['nota', 'none', 'none of the above', 'no one'],
    },

    'hi-IN': {
        code: 'hi-IN',
        label: 'हिं',
        displayName: 'Hindi',
        greeting: 'Voice assistant shuru ho gaya. Main candidates ke naam padhega. Kripya us candidate ka naam bolen jise aap vote dena chahte hain.',
        readCandidates: (candidates) => {
            let text = 'Aapke constituency mein candidates hain: ';
            candidates.forEach((c, i) => {
                text += `Number ${i + 1}: ${c.name} from ${c.party?.name || 'Independent'}. `;
            });
            text += `Number ${candidates.length + 1}: NOTA, yani koi nahi. `;
            text += 'Candidate ka naam ya unka number bolein.';
            return text;
        },
        confirmPrompt: (name) =>
            `Aapne ${name} chunaa hai. Confirm karne ke liye Haan bolein, ya dobara chunne ke liye Nahi bolein.`,
        successMessage: 'Aapka vote confirm ho gaya. Dhanyavaad.',
        noMatchMessage: 'Koi candidate nahi mila. Kripya poora naam dheere dheere bolein, ya number bolein.',
        noSpeechMessage: 'Kuch suna nahi. Dobara koshish karein.',
        cancelMessage: 'Selection cancel kar diya. Dobara candidate ka naam bolein.',
        errorMicDenied: 'Microphone access deny kar diya gaya. Kripay browser settings mein microphone allow karein.',
        errorUnsupported: 'Aapke browser mein voice features support nahi hain. Google Chrome ya Edge use karein.',
        deactivatedMessage: 'Voice assistant band ho gaya.',
        confirmWords: ['haan', 'ha', 'yes', 'theek hai', 'sahi', 'confirm'],
        cancelWords: ['nahi', 'na', 'no', 'cancel', 'galat', 'wapas'],
        notaKeywords: ['nota', 'koi nahi', 'none'],
    },

    'te-IN': {
        code: 'te-IN',
        label: 'తె',
        displayName: 'Telugu',
        greeting: 'Voice assistant praramhambhainadi. Nenu candidates peru chaduvutanu. Daya chesi meeru vote veyalankuntunna candidate peru cheppandi.',
        readCandidates: (candidates) => {
            let text = 'Mee constituency lo candidates: ';
            candidates.forEach((c, i) => {
                text += `Number ${i + 1}: ${c.name} from ${c.party?.name || 'Independent'}. `;
            });
            text += `Number ${candidates.length + 1}: NOTA, ela evaru ledu. `;
            text += 'Candidate peru cheppandi leда number cheppandi.';
            return text;
        },
        confirmPrompt: (name) =>
            `Meeru ${name} ni select chesaru. Vote confirm cheyyataniki Avunu anandi, lekapote Kadu anandi.`,
        successMessage: 'Mee vote confirm ayindi. Loktantrika prakriyalo palgonnatanduku dhanyavaadalu.',
        noMatchMessage: 'Aa peru candidate ki match avvaledu. Daya chesi poora peru munde munde cheppandi leда number cheppandi.',
        noSpeechMessage: 'Emee vinapadaledu. Malli prayatinchandi.',
        cancelMessage: 'Selection cancel chesam. Malli candidate peru cheppandi.',
        errorMicDenied: 'Microphone access deny chesaru. Browser settings lo microphone allow cheyandi.',
        errorUnsupported: 'Mee browser lo voice features support kaadu. Google Chrome leда Edge vadandi.',
        deactivatedMessage: 'Voice assistant aapindi.',
        confirmWords: ['avunu', 'avuna', 'ho', 'yes', 'confirm', 'sare'],
        cancelWords: ['kadu', 'ledu', 'no', 'cancel', 'tappu', 'back'],
        notaKeywords: ['nota', 'evaru ledu', 'none', 'ela evaru ledu'],
    },
};

export const DEFAULT_LANG = 'en-IN';

/**
 * Returns the locale config object for a given language code.
 * Falls back to English if not found.
 */
export function getLocale(langCode) {
    return LANGUAGES[langCode] || LANGUAGES['en-IN'];
}
