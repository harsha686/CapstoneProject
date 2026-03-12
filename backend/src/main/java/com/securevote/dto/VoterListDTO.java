package com.securevote.dto;

public class VoterListDTO {
    private Long id;
    private String name;
    private String epicNumber;
    private String constituencyName;
    private boolean isVerified;
    private boolean hasVoted;

    public VoterListDTO(Long id, String name, String epicNumber,
                        String constituencyName, boolean isVerified, boolean hasVoted) {
        this.id = id;
        this.name = name;
        this.epicNumber = epicNumber;
        this.constituencyName = constituencyName;
        this.isVerified = isVerified;
        this.hasVoted = hasVoted;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEpicNumber() { return epicNumber; }
    public String getConstituencyName() { return constituencyName; }
    public boolean isVerified() { return isVerified; }
    public boolean isHasVoted() { return hasVoted; }
}
