package com.securevote.controllers;

import com.securevote.models.Voter;
import com.securevote.models.Admin;
import com.securevote.dto.LoginRequest;
import com.securevote.services.AuthService;
import com.securevote.services.VoterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private VoterService voterService;

    @GetMapping("/hii")
    public String sayHi() {
        return "Hi";
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerVoter(
            @RequestPart("voter") Voter voter,
            @RequestPart("faceImage") MultipartFile faceImage) {

        Map<String, Object> response = authService.registerVoter(voter, faceImage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/initiate")
    public ResponseEntity<Map<String, Object>> initiateLogin(@RequestBody LoginRequest request) {
        Map<String, Object> response = authService.initiateLogin(request.getIdentifier());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/verify")
    public ResponseEntity<Map<String, Object>> verifyLogin(
            @RequestParam("identifier") String identifier,
            @RequestParam("faceImage") MultipartFile faceImage,
            @RequestParam("otp") String otp) {

        Map<String, Object> response = authService.verifyFaceAndOtp(identifier, faceImage, otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody LoginRequest request) {
        Map<String, Object> response = authService.adminLogin(request.getIdentifier(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new java.util.HashMap<>();

        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);

            if (authService.validateToken(jwtToken)) {
                String username = authService.extractUsernameFromToken(jwtToken);
                String role = authService.extractRoleFromToken(jwtToken);

                response.put("valid", true);
                response.put("username", username);
                response.put("role", role);

                if ("voter".equals(role)) {
                    voterService.getVoterByEpicNumber(username).ifPresent(voter -> {
                        response.put("voterId", voter.getId());
                        response.put("constituencyId", voter.getConstituency().getId());
                    });
                }
            } else {
                response.put("valid", false);
                response.put("message", "Invalid or expired token");
            }
        } else {
            response.put("valid", false);
            response.put("message", "Invalid token format");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}