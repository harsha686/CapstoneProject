package com.securevote.services;

import com.securevote.models.Voter;
import com.securevote.models.Constituency;
import com.securevote.repositories.VoterRepository;
import com.securevote.repositories.ConstituencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
public class VoterService {

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private ConstituencyRepository constituencyRepository;

    public List<Voter> getAllVoters() {
        return voterRepository.findAll();
    }

    public Optional<Voter> getVoterById(Long id) {
        return voterRepository.findById(id);
    }

    public Optional<Voter> getVoterByEpicNumber(String epicNumber) {
        return voterRepository.findByEpicNumber(epicNumber);
    }

    public Voter updateVoter(Long id, Voter voterDetails) {
        return voterRepository.findById(id).map(voter -> {
            voter.setName(voterDetails.getName());
            voter.setAddress(voterDetails.getAddress());
            voter.setPhoneNumber(voterDetails.getPhoneNumber());
            return voterRepository.save(voter);
        }).orElse(null);
    }

    public boolean deleteVoter(Long id) {
        return voterRepository.findById(id).map(voter -> {
            voterRepository.delete(voter);
            return true;
        }).orElse(false);
    }

    public Voter verifyVoter(Long id) {
        return voterRepository.findById(id).map(voter -> {
            voter.setIsVerified(true);
            return voterRepository.save(voter);
        }).orElse(null);
    }

    public List<Voter> getUnverifiedVoters() {
        return voterRepository.findAll().stream()
                .filter(voter -> !voter.getIsVerified())
                .toList();
    }

    public List<Voter> getVotersByConstituency(Long constituencyId) {
        return voterRepository.findAll().stream()
                .filter(voter -> voter.getConstituency().getId().equals(constituencyId))
                .toList();
    }

    public Map<String, Object> getVoterStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalVoters = voterRepository.count();
        long verifiedVoters = voterRepository.findAll().stream()
                .filter(Voter::getIsVerified)
                .count();
        long votedVoters = voterRepository.findAll().stream()
                .filter(Voter::getHasVoted)
                .count();
        long unverifiedVoters = totalVoters - verifiedVoters;
        
        stats.put("totalVoters", totalVoters);
        stats.put("verifiedVoters", verifiedVoters);
        stats.put("votedVoters", votedVoters);
        stats.put("unverifiedVoters", unverifiedVoters);
        stats.put("voterTurnoutPercentage", totalVoters > 0 ? (votedVoters * 100.0) / totalVoters : 0.0);
        
        return stats;
    }

    public Map<String, Object> getConstituencyVoterStatistics(Long constituencyId) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalVoters = voterRepository.countTotalVotersByConstituency(constituencyId);
        long votedVoters = voterRepository.countVotedVotersByConstituency(constituencyId);
        
        stats.put("totalVoters", totalVoters);
        stats.put("votedVoters", votedVoters);
        stats.put("remainingVoters", totalVoters - votedVoters);
        stats.put("voterTurnoutPercentage", totalVoters > 0 ? (votedVoters * 100.0) / totalVoters : 0.0);
        
        return stats;
    }

    public boolean hasVoterVoted(String epicNumber) {
        return voterRepository.findByEpicNumber(epicNumber)
                .map(Voter::getHasVoted)
                .orElse(false);
    }

    public boolean isVoterEligible(String epicNumber) {
        return voterRepository.findByEpicNumber(epicNumber)
                .map(voter -> voter.getIsVerified() && !voter.getHasVoted())
                .orElse(false);
    }

    public void markVoterAsVoted(Long voterId) {
        voterRepository.findById(voterId).ifPresent(voter -> {
            voter.setHasVoted(true);
            voterRepository.save(voter);
        });
    }
}