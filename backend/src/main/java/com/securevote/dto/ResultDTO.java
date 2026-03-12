package com.securevote.dto;

public class ResultDTO {
    private Long candidateId;
    private String candidateName;
    private String partyName;
    private String partySymbol;
    private Long totalVotes;
    private String constituencyName;

    public ResultDTO(Long candidateId, String candidateName, String partyName,
                     String partySymbol, Long totalVotes, String constituencyName) {
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.partyName = partyName;
        this.partySymbol = partySymbol;
        this.totalVotes = totalVotes;
        this.constituencyName = constituencyName;
    }

    public Long getCandidateId() { return candidateId; }
    public String getCandidateName() { return candidateName; }
    public String getPartyName() { return partyName; }
    public String getPartySymbol() { return partySymbol; }
    public Long getTotalVotes() { return totalVotes; }
    public String getConstituencyName() { return constituencyName; }
}
