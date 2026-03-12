package com.securevote.controllers;

import com.securevote.dto.ChatRequest;
import com.securevote.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("reply", "Please enter a message."));
        }

        String reply = chatService.chat(request.getMessage().trim());
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
