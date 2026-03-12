package com.securevote.controllers;

import com.securevote.models.Voter;
import com.securevote.services.VoterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/voters")
public class VoterController {

    @Autowired
    private VoterService voterService;

    @GetMapping
    public ResponseEntity<List<Voter>> getAllVoters() {
        List<Voter> voters = voterService.getAllVoters();
        return ResponseEntity.ok(voters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voter> getVoterById(@PathVariable Long id) {
        Optional<Voter> voter = voterService.getVoterById(id);
        return voter.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/epic/{epicNumber}")
    public ResponseEntity<Voter> getVoterByEpicNumber(@PathVariable String epicNumber) {
        Optional<Voter> voter = voterService.getVoterByEpicNumber(epicNumber);
        return voter.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voter> updateVoter(@PathVariable Long id, @RequestBody Voter voterDetails) {
        Voter updatedVoter = voterService.updateVoter(id, voterDetails);
        if (updatedVoter != null) {
            return ResponseEntity.ok(updatedVoter);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoter(@PathVariable Long id) {
        boolean deleted = voterService.deleteVoter(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Voter> verifyVoter(@PathVariable Long id) {
        Voter verifiedVoter = voterService.verifyVoter(id);
        if (verifiedVoter != null) {
            return ResponseEntity.ok(verifiedVoter);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/unverified")
    public ResponseEntity<List<Voter>> getUnverifiedVoters() {
        List<Voter> unverifiedVoters = voterService.getUnverifiedVoters();
        return ResponseEntity.ok(unverifiedVoters);
    }

    @GetMapping("/constituency/{constituencyId}")
    public ResponseEntity<List<Voter>> getVotersByConstituency(@PathVariable Long constituencyId) {
        List<Voter> voters = voterService.getVotersByConstituency(constituencyId);
        return ResponseEntity.ok(voters);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getVoterStatistics() {
        Map<String, Object> stats = voterService.getVoterStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/constituency/{constituencyId}/statistics")
    public ResponseEntity<Map<String, Object>> getConstituencyVoterStatistics(@PathVariable Long constituencyId) {
        Map<String, Object> stats = voterService.getConstituencyVoterStatistics(constituencyId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{epicNumber}/has-voted")
    public ResponseEntity<Map<String, Boolean>> hasVoterVoted(@PathVariable String epicNumber) {
        boolean hasVoted = voterService.hasVoterVoted(epicNumber);
        return ResponseEntity.ok(Map.of("hasVoted", hasVoted));
    }

    @GetMapping("/{epicNumber}/is-eligible")
    public ResponseEntity<Map<String, Boolean>> isVoterEligible(@PathVariable String epicNumber) {
        boolean isEligible = voterService.isVoterEligible(epicNumber);
        return ResponseEntity.ok(Map.of("isEligible", isEligible));
    }
}