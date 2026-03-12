package com.securevote.services;

import com.securevote.models.*;
import com.securevote.repositories.VoteRepository;
import com.securevote.repositories.VoterRepository;
import com.securevote.repositories.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private VoterService voterService;

    @Transactional
    public Map<String, Object> castVote(Long voterId, Long candidateId, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // Check if voter exists and is eligible
        Optional<Voter> voterOpt = voterRepository.findById(voterId);
        if (voterOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Voter not found");
            return response;
        }

        Voter voter = voterOpt.get();
        
        if (voter.getHasVoted()) {
            response.put("success", false);
            response.put("message", "You have already voted");
            return response;
        }

        if (!voter.getIsVerified()) {
            response.put("success", false);
            response.put("message", "Voter not verified");
            return response;
        }

        String ipAddress = getClientIpAddress(request);

        try {
            // ── NOTA (None of the Above) ─────────────────────────────────
            if (candidateId == null || candidateId == -1L) {
                Vote vote = new Vote(voter, null, voter.getConstituency(), ipAddress);
                voteRepository.save(vote);
                voter.setHasVoted(true);
                voterRepository.save(voter);
                response.put("success", true);
                response.put("message", "NOTA vote cast successfully");
                response.put("voteId", vote.getId());
                return response;
            }

            // ── Regular candidate vote ────────────────────────────────────
            Optional<Candidate> candidateOpt = candidateRepository.findById(candidateId);
            if (candidateOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Candidate not found");
                return response;
            }

            Candidate candidate = candidateOpt.get();
            
            if (!candidate.getConstituency().getId().equals(voter.getConstituency().getId())) {
                response.put("success", false);
                response.put("message", "Candidate not available in your constituency");
                return response;
            }

            Vote vote = new Vote(voter, candidate, voter.getConstituency(), ipAddress);
            voteRepository.save(vote);
            
            voter.setHasVoted(true);
            voterRepository.save(voter);
            
            response.put("success", true);
            response.put("message", "Vote cast successfully");
            response.put("voteId", vote.getId());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to cast vote: " + e.getMessage());
        }
        
        return response;
    }

    public Map<String, Object> getVoteResults(Long constituencyId) {
        Map<String, Object> response = new HashMap<>();
        
        List<Object[]> results = voteRepository.getVoteResultsByConstituency(constituencyId);
        long totalVotes = voteRepository.countTotalVotesInConstituency(constituencyId);
        
        List<Map<String, Object>> candidateResults = new ArrayList<>();
        
        for (Object[] result : results) {
            Map<String, Object> candidateResult = new HashMap<>();
            candidateResult.put("candidateId", result[0]);
            candidateResult.put("candidateName", result[1]);
            candidateResult.put("partyName", result[2]);
            candidateResult.put("votes", result[3]);
            
            long votes = ((Number) result[3]).longValue();
            double percentage = totalVotes > 0 ? (votes * 100.0) / totalVotes : 0.0;
            candidateResult.put("percentage", percentage);
            
            candidateResults.add(candidateResult);
        }
        
        // Add NOTA option (None of the Above)
        Map<String, Object> notaResult = new HashMap<>();
        notaResult.put("candidateId", -1L);
        notaResult.put("candidateName", "None of the Above (NOTA)");
        notaResult.put("partyName", "NOTA");
        notaResult.put("votes", 0);
        notaResult.put("percentage", 0.0);
        
        // Find winner
        Map<String, Object> winner = null;
        if (!candidateResults.isEmpty()) {
            winner = candidateResults.get(0);
        }
        
        response.put("success", true);
        response.put("constituencyId", constituencyId);
        response.put("totalVotes", totalVotes);
        response.put("results", candidateResults);
        response.put("winner", winner);
        response.put("voterTurnout", calculateVoterTurnout(constituencyId));
        
        return response;
    }

    public Map<String, Object> getOverallResults() {
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, Object>> constituencyResults = new ArrayList<>();
        
        // Get all constituencies and their results
        List<Constituency> constituencies = voterRepository.findAll().stream()
                .map(Voter::getConstituency)
                .distinct()
                .toList();
        
        for (Constituency constituency : constituencies) {
            Map<String, Object> constituencyResult = getVoteResults(constituency.getId());
            constituencyResult.put("constituencyName", constituency.getName());
            constituencyResults.add(constituencyResult);
        }
        
        // Calculate overall statistics
        long totalVotes = voteRepository.count();
        long totalVoters = voterRepository.count();
        double overallTurnout = totalVoters > 0 ? (totalVotes * 100.0) / totalVoters : 0.0;
        
        response.put("success", true);
        response.put("constituencyResults", constituencyResults);
        response.put("totalVotes", totalVotes);
        response.put("totalVoters", totalVoters);
        response.put("overallTurnout", overallTurnout);
        
        return response;
    }

    public boolean hasVoterVoted(Long voterId) {
        return voteRepository.existsByVoter(voterRepository.findById(voterId).orElse(null));
    }

    public Optional<Vote> getVoteByVoter(Long voterId) {
        return voterRepository.findById(voterId)
                .flatMap(voteRepository::findByVoter);
    }

    private double calculateVoterTurnout(Long constituencyId) {
        long totalVoters = voterRepository.countTotalVotersByConstituency(constituencyId);
        long totalVotes = voteRepository.countTotalVotesInConstituency(constituencyId);
        
        return totalVoters > 0 ? (totalVotes * 100.0) / totalVoters : 0.0;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}