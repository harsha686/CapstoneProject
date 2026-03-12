package com.securevote.repositories;

import com.securevote.models.Voter;
import com.securevote.dto.VoterListDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoterRepository extends JpaRepository<Voter, Long> {
    
    Optional<Voter> findByEpicNumber(String epicNumber);
    
    Optional<Voter> findByAadhaarNumber(String aadhaarNumber);
    
    Optional<Voter> findByPhoneNumber(String phoneNumber);
    
    boolean existsByEpicNumber(String epicNumber);
    
    boolean existsByAadhaarNumber(String aadhaarNumber);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    @Query("SELECT v FROM Voter v WHERE v.epicNumber = :identifier OR v.aadhaarNumber = :identifier")
    Optional<Voter> findByEpicOrAadhaar(@Param("identifier") String identifier);
    
    @Query("SELECT COUNT(v) FROM Voter v WHERE v.constituency.id = :constituencyId AND v.hasVoted = true")
    long countVotedVotersByConstituency(@Param("constituencyId") Long constituencyId);
    
    @Query("SELECT COUNT(v) FROM Voter v WHERE v.constituency.id = :constituencyId")
    long countTotalVotersByConstituency(@Param("constituencyId") Long constituencyId);

    @Query("SELECT new com.securevote.dto.VoterListDTO(" +
           "v.id, v.name, v.epicNumber, v.constituency.name, v.isVerified, v.hasVoted) " +
           "FROM Voter v ORDER BY v.name ASC")
    List<VoterListDTO> findAllAsDTO();
}