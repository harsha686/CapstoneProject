package com.securevote.controllers;

import com.securevote.dto.VoteRequest;
import com.securevote.services.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    @Autowired
    private VoteService voteService;

    @PostMapping("/cast")
    public ResponseEntity<Map<String, Object>> castVote(
            @RequestBody VoteRequest voteRequest,
            HttpServletRequest request) {

        Map<String, Object> response = voteService.castVote(
                voteRequest.getVoterId(),
                voteRequest.getCandidateId(),
                request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/results/constituency/{constituencyId}")
    public ResponseEntity<Map<String, Object>> getVoteResults(@PathVariable Long constituencyId) {
        Map<String, Object> results = voteService.getVoteResults(constituencyId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/overall")
    public ResponseEntity<Map<String, Object>> getOverallResults() {
        Map<String, Object> results = voteService.getOverallResults();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/voter/{voterId}/has-voted")
    public ResponseEntity<Map<String, Boolean>> hasVoterVoted(@PathVariable Long voterId) {
        boolean hasVoted = voteService.hasVoterVoted(voterId);
        return ResponseEntity.ok(Map.of("hasVoted", hasVoted));
    }

    @GetMapping("/voter/{voterId}")
    public ResponseEntity<Map<String, Map<String, Object>>> getVoteByVoter(@PathVariable Long voterId) {
        return voteService.getVoteByVoter(voterId)
                .map(vote -> {
                    Map<String, Object> voteInfo = Map.of(
                            "voteId", vote.getId(),
                            "candidateId", vote.getCandidate().getId(),
                            "candidateName", vote.getCandidate().getName(),
                            "partyName", vote.getCandidate().getParty().getName(),
                            "timestamp", vote.getTimestamp());
                    return ResponseEntity.ok(Map.of("vote", voteInfo));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}