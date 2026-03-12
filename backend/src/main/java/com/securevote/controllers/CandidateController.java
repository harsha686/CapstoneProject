package com.securevote.controllers;

import com.securevote.models.Candidate;
import com.securevote.services.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    // Fetch active candidates for Voter Dashboard
    @GetMapping
    public ResponseEntity<List<Candidate>> getActiveCandidates() {
        List<Candidate> candidates = candidateService.getActiveCandidates();
        return ResponseEntity.ok(candidates);
    }

    // Fetch all candidates for Admin View
    @GetMapping("/admin")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/constituency/{id}")
    public ResponseEntity<List<Candidate>> getCandidatesByConstituency(@PathVariable Long id) {
        List<Candidate> candidates = candidateService.getCandidatesByConstituency(id);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        return candidateService.getCandidateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Candidate> addCandidate(@RequestBody Candidate candidate) {
        Candidate savedCandidate = candidateService.addCandidate(candidate);
        return ResponseEntity.ok(savedCandidate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidateDetails) {
        Candidate updatedCandidate = candidateService.updateCandidate(id, candidateDetails);
        if (updatedCandidate != null) {
            return ResponseEntity.ok(updatedCandidate);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Candidate> toggleCandidateStatus(@PathVariable Long id) {
        Candidate updatedCandidate = candidateService.toggleCandidateStatus(id);
        if (updatedCandidate != null) {
            return ResponseEntity.ok(updatedCandidate);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        boolean deleted = candidateService.deleteCandidate(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
