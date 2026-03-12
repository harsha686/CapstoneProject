package com.securevote.controllers;

import com.securevote.dto.VoterListDTO;
import com.securevote.dto.ResultDTO;
import com.securevote.repositories.VoterRepository;
import com.securevote.repositories.VoteRepository;
import com.securevote.services.VoterService;
import com.securevote.services.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private VoterService voterService;

    @Autowired
    private VoteService voteService;

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private VoteRepository voteRepository;

    // ─── Secure, DTO-based endpoints ────────────────────────────────────────────

    /**
     * Returns all voters as safe DTOs (no faceEncoding, no passwordHash).
     */
    @GetMapping("/voters")
    public ResponseEntity<List<VoterListDTO>> getAllVoters() {
        List<VoterListDTO> voters = voterRepository.findAllAsDTO();
        return ResponseEntity.ok(voters);
    }

    /**
     * Returns aggregated vote results per candidate using a single JPQL query.
     * Uses LEFT JOIN so candidates with 0 votes are included.
     */
    @GetMapping("/results")
    public ResponseEntity<List<ResultDTO>> getResults() {
        List<ResultDTO> results = voteRepository.getAggregatedResults();
        return ResponseEntity.ok(results);
    }

    // ─── Existing endpoints ───────────────────────────────────────────────────

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = voterService.getVoterStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/election/end")
    public ResponseEntity<Map<String, Object>> endElection() {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Election ended successfully");
        response.put("timestamp", java.time.LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-log")
    public ResponseEntity<Map<String, Object>> getAuditLog() {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("logs", java.util.Arrays.asList());
        response.put("totalRecords", 0);
        return ResponseEntity.ok(response);
    }
}