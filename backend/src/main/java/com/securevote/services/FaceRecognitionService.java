package com.securevote.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevote.utils.FaceEncodingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * FaceRecognitionService — communicates with the Python Flask face microservice.
 *
 * Key fix: uses ResponseEntity instead of plain postForObject so that 4xx/5xx
 * HTTP responses from Python are caught and their JSON body (with "message" and
 * "errorCode") is parsed and surfaced to the frontend as a clean exception message
 * instead of the raw Spring HttpClientErrorException stack trace.
 */
@Service
public class FaceRecognitionService {

    @Value("${face.recognition.service.url:http://localhost:5000}")
    private String faceServiceUrl;

    @Autowired private RestTemplate restTemplate;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private FaceEncodingUtil faceEncodingUtil;

    // ── Strict tolerance matching the Python service ───────────────────────
    private static final double MATCH_TOLERANCE = 0.45;

    // =========================================================================
    // Internal helper: POST to face service, parse JSON, surface errors cleanly
    // =========================================================================

    /**
     * Makes a POST to the Python face service and returns the parsed JsonNode.
     * If the Python service returns a 4xx/5xx with { "message", "errorCode" },
     * extracts the user-friendly message and throws RuntimeException with it —
     * so the frontend never sees a raw HTTP error string.
     */
    private JsonNode callFaceService(String path, Map<String, ?> body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, ?>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    faceServiceUrl + path, HttpMethod.POST, entity, String.class);

            return objectMapper.readTree(response.getBody());

        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            // Python returned 4xx/5xx — parse the JSON body for the user message
            String userMessage = extractPythonError(ex.getResponseBodyAsString());
            throw new RuntimeException(userMessage);
        } catch (Exception ex) {
            throw new RuntimeException(
                    "Face recognition service is unavailable. Please try again shortly.");
        }
    }

    /** Parse { "message": "...", "errorCode": "..." } from the Python response body. */
    private String extractPythonError(String responseBody) {
        try {
            JsonNode node = objectMapper.readTree(responseBody);
            if (node.has("message")) {
                return node.get("message").asText();
            }
            if (node.has("error")) {
                return node.get("error").asText();
            }
        } catch (Exception ignored) {}
        return "Face processing failed. Please try again.";
    }

    // =========================================================================
    // Public API
    // =========================================================================

    /** Registration: encode a MultipartFile through the full security pipeline. */
    public double[] generateFaceEncoding(MultipartFile imageFile) {
        try {
            String b64 = Base64.getEncoder().encodeToString(imageFile.getBytes());
            return generateFaceEncodingFromBase64(b64);
        } catch (RuntimeException re) {
            throw re;   // already user-friendly
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to read image file. Please try again.", e);
        }
    }

    /** Registration: encode a base64 image string through the full security pipeline. */
    public double[] generateFaceEncodingFromBase64(String base64Image) {
        Map<String, String> body = new HashMap<>();
        body.put("image", base64Image);

        JsonNode node = callFaceService("/encode", body);

        if (node.has("encoding")) {
            return objectMapper.convertValue(node.get("encoding"), double[].class);
        }
        // Python returned success=false with a message — already user-friendly
        String msg = node.has("message") ? node.get("message").asText()
                                         : "Face encoding failed. Please try again.";
        throw new RuntimeException(msg);
    }

    /** Login: verify a live face against a stored encoding. Returns true on match. */
    public boolean compareFaces(double[] storedEncoding, MultipartFile liveImage) {
        try {
            double[] live = generateFaceEncoding(liveImage);
            return faceEncodingUtil.compareFaceEncodings(storedEncoding, live, MATCH_TOLERANCE);
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("Face comparison failed. Please try again.", e);
        }
    }

    /** Login: verify a base64 live image against a stored encoding. */
    public boolean compareFacesFromBase64(double[] storedEncoding, String base64Image) {
        double[] live = generateFaceEncodingFromBase64(base64Image);
        boolean match = faceEncodingUtil.compareFaceEncodings(storedEncoding, live, MATCH_TOLERANCE);
        if (!match) {
            throw new RuntimeException(
                    "Face verification failed. Please ensure you are the registered voter.");
        }
        return true;
    }

    /** Verify face detected in image (no matching — presence check only). */
    public Map<String, Object> verifyFace(MultipartFile imageFile) {
        try {
            String b64 = Base64.getEncoder().encodeToString(imageFile.getBytes());
            Map<String, String> body = new HashMap<>();
            body.put("image", b64);
            JsonNode node = callFaceService("/verify", body);
            return objectMapper.convertValue(node, Map.class);
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("Face verification failed. Please try again.", e);
        }
    }

    /** Health ping — returns true if face service is reachable. */
    public boolean isFaceServiceAvailable() {
        try {
            String r = restTemplate.getForObject(faceServiceUrl + "/health", String.class);
            return r != null && r.contains("OK");
        } catch (Exception e) {
            return false;
        }
    }
}