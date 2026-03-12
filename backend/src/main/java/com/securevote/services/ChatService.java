package com.securevote.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ChatService {

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.url}")
    private String apiUrl;

    @Value("${ai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT =
        "You are a helpful, concise virtual assistant for SecureVote — a secure facial recognition " +
        "based online voting platform built for Indian elections. Help voters with questions about " +
        "registration, EPIC numbers, Aadhaar, face verification, OTP login, how to cast their vote, " +
        "NOTA option, and general election info. Keep answers short, friendly, and to the point. " +
        "Never discuss sensitive personal data or attempt to influence vote choices.";

    public String chat(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Build the messages array: system + user
        List<Map<String, String>> messages = Arrays.asList(
            Map.of("role", "system", "content", SYSTEM_PROMPT),
            Map.of("role", "user",   "content", userMessage)
        );

        // Groq / OpenAI-compatible payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("model",       model);
        payload.put("messages",    messages);
        payload.put("max_tokens",  512);
        payload.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            Map<?, ?> body = response.getBody();

            if (body != null && body.containsKey("choices")) {
                List<?> choices = (List<?>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> choice  = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) choice.get("message");
                    if (message != null && message.containsKey("content")) {
                        return message.get("content").toString().trim();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Chat API error: " + e.getMessage());
        }

        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
}
