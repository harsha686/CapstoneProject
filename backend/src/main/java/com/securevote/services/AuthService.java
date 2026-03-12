package com.securevote.services;

import com.securevote.models.Voter;
import com.securevote.models.Admin;
import com.securevote.repositories.VoterRepository;
import com.securevote.repositories.AdminRepository;
import com.securevote.utils.JwtUtil;
import com.securevote.utils.OtpUtil;
import com.securevote.utils.FaceEncodingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpUtil otpUtil;

    @Autowired
    private FaceRecognitionService faceRecognitionService;

    @Autowired
    private FaceEncodingUtil faceEncodingUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Map<String, Object> registerVoter(Voter voter, MultipartFile faceImage) {
        Map<String, Object> response = new HashMap<>();

        // Validate voter data
        if (voterRepository.existsByEpicNumber(voter.getEpicNumber())) {
            response.put("success", false);
            response.put("message", "Voter with this EPIC number already exists");
            return response;
        }

        if (voterRepository.existsByAadhaarNumber(voter.getAadhaarNumber())) {
            response.put("success", false);
            response.put("message", "Voter with this Aadhaar number already exists");
            return response;
        }

        if (voterRepository.existsByPhoneNumber(voter.getPhoneNumber())) {
            response.put("success", false);
            response.put("message", "Voter with this phone number already exists");
            return response;
        }

        // Generate face encoding
        try {
            double[] faceEncoding = faceRecognitionService.generateFaceEncoding(faceImage);
            voter.setFaceEncoding(faceEncodingUtil.encodeFaceEncoding(faceEncoding));
        } catch (Exception e) {
            System.err.println("Registration error - Face encoding failed: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to process face image: " + e.getMessage());
            return response;
        }

        // Hash password
        voter.setPasswordHash(passwordEncoder.encode(voter.getPassword()));

        // Auto-verify for testing purposes
        voter.setIsVerified(true);

        // Save voter
        Voter savedVoter = voterRepository.save(voter);

        response.put("success", true);
        response.put("message", "Registration successful. Please wait for verification.");
        response.put("voterId", savedVoter.getId());

        return response;
    }

    public Map<String, Object> initiateLogin(String identifier) {
        Map<String, Object> response = new HashMap<>();

        Optional<Voter> voterOpt = voterRepository.findByEpicOrAadhaar(identifier);
        if (voterOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Voter not found");
            return response;
        }

        Voter voter = voterOpt.get();

        if (!voter.getIsVerified()) {
            response.put("success", false);
            response.put("message", "Account not verified yet");
            return response;
        }

        if (voter.getHasVoted()) {
            response.put("success", false);
            response.put("message", "You have already voted");
            return response;
        }

        // Generate OTP
        String otp = otpUtil.generateOtp(identifier);

        response.put("success", true);
        response.put("message", "OTP sent successfully");
        response.put("otp", otp); // Added for displaying on screen
        response.put("voterId", voter.getId());
        response.put("requiresFaceVerification", true);

        return response;
    }

    public Map<String, Object> verifyFaceAndOtp(String identifier, MultipartFile faceImage, String otp) {
        Map<String, Object> response = new HashMap<>();

        Optional<Voter> voterOpt = voterRepository.findByEpicOrAadhaar(identifier);
        if (voterOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Voter not found");
            return response;
        }

        Voter voter = voterOpt.get();

        // Verify OTP
        if (!otpUtil.validateOtp(identifier, otp)) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP");
            return response;
        }

        // Verify face
        double[] storedEncoding = faceEncodingUtil.decodeFaceEncoding(voter.getFaceEncoding());
        boolean faceMatch = faceRecognitionService.compareFaces(storedEncoding, faceImage);

        if (!faceMatch) {
            response.put("success", false);
            response.put("message", "Face verification failed");
            return response;
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(voter.getEpicNumber(), "voter");

        response.put("success", true);
        response.put("message", "Authentication successful");
        response.put("token", token);
        response.put("voter", Map.of(
                "id", voter.getId(),
                "name", voter.getName(),
                "epicNumber", voter.getEpicNumber(),
                "constituencyId", voter.getConstituency().getId()));

        return response;
    }

    public Map<String, Object> adminLogin(String username, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return response;
        }

        Admin admin = adminOpt.get();

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return response;
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(admin.getUsername(), admin.getRole());

        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("admin", Map.of(
                "id", admin.getId(),
                "username", admin.getUsername(),
                "role", admin.getRole()));

        return response;
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public String extractUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String extractRoleFromToken(String token) {
        return jwtUtil.extractRole(token);
    }
}