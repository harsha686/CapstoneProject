package com.securevote.dto;

public class VoteRequest {
    private Long voterId;
    private Long candidateId;
    
    public VoteRequest() {}
    
    public VoteRequest(Long voterId, Long candidateId) {
        this.voterId = voterId;
        this.candidateId = candidateId;
    }
    
    public Long getVoterId() {
        return voterId;
    }
    
    public void setVoterId(Long voterId) {
        this.voterId = voterId;
    }
    
    public Long getCandidateId() {
        return candidateId;
    }
    
    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }
}