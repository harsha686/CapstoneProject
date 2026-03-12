package com.securevote.services;

import com.securevote.models.Candidate;
import com.securevote.repositories.CandidateRepository;
import com.securevote.repositories.PartyRepository;
import com.securevote.repositories.ConstituencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private ConstituencyRepository constituencyRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Candidate> getActiveCandidates() {
        return candidateRepository.findByIsActiveTrue();
    }

    public List<Candidate> getCandidatesByConstituency(Long constituencyId) {
        return candidateRepository.findByConstituencyId(constituencyId);
    }

    public Optional<Candidate> getCandidateById(Long id) {
        return candidateRepository.findById(id);
    }

    public Candidate addCandidate(Candidate candidate) {
        // Enforce Party lookup or creation
        if (candidate.getParty() != null) {
            final String partyName = candidate.getParty().getName();
            if (partyName != null && !partyName.isBlank()) {
                com.securevote.models.Party party = partyRepository.findAll().stream()
                        .filter(p -> p.getName().equalsIgnoreCase(partyName))
                        .findFirst()
                        .orElseGet(() -> {
                            // Ensure required fields for new party
                            if (candidate.getParty().isActive() == false)
                                candidate.getParty().setActive(true);
                            return partyRepository.save(candidate.getParty());
                        });
                candidate.setParty(party);
            }
        }

        // Enforce Constituency lookup
        if (candidate.getConstituency() != null && candidate.getConstituency().getId() != null) {
            constituencyRepository.findById(candidate.getConstituency().getId())
                    .ifPresent(candidate::setConstituency);
        }

        // Safety check: ensure required objects are present
        if (candidate.getParty() == null)
            throw new RuntimeException("Valid Party is required");
        if (candidate.getConstituency() == null || candidate.getConstituency().getId() == null)
            throw new RuntimeException("Valid Constituency is required");

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        return candidateRepository.findById(id).map(candidate -> {
            candidate.setName(candidateDetails.getName());

            // Handle Party lookup/update
            if (candidateDetails.getParty() != null) {
                final String partyName = candidateDetails.getParty().getName();
                com.securevote.models.Party party = partyRepository.findAll().stream()
                        .filter(p -> p.getName().equalsIgnoreCase(partyName))
                        .findFirst()
                        .orElseGet(() -> partyRepository.save(candidateDetails.getParty()));
                candidate.setParty(party);
            }

            // Handle Constituency lookup
            if (candidateDetails.getConstituency() != null && candidateDetails.getConstituency().getId() != null) {
                constituencyRepository.findById(candidateDetails.getConstituency().getId())
                        .ifPresent(candidate::setConstituency);
            }

            candidate.setManifesto(candidateDetails.getManifesto());
            candidate.setPhotoUrl(candidateDetails.getPhotoUrl());
            candidate.setActive(candidateDetails.isActive());
            return candidateRepository.save(candidate);
        }).orElse(null);
    }

    public boolean deleteCandidate(Long id) {
        return candidateRepository.findById(id).map(candidate -> {
            candidateRepository.delete(candidate);
            return true;
        }).orElse(false);
    }

    public Candidate toggleCandidateStatus(Long id) {
        return candidateRepository.findById(id).map(candidate -> {
            candidate.setActive(!candidate.isActive());
            return candidateRepository.save(candidate);
        }).orElse(null);
    }
}
