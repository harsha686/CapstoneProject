package com.securevote.repositories;

import com.securevote.models.Vote;
import com.securevote.models.Voter;
import com.securevote.models.Constituency;
import com.securevote.dto.ResultDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    Optional<Vote> findByVoter(Voter voter);
    
    boolean existsByVoter(Voter voter);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.candidate.id = :candidateId")
    long countByCandidateId(@Param("candidateId") Long candidateId);
    
    @Query("SELECT v.candidate.id, COUNT(v) FROM Vote v WHERE v.constituency.id = :constituencyId GROUP BY v.candidate.id")
    List<Object[]> countVotesByCandidateInConstituency(@Param("constituencyId") Long constituencyId);
    
    @Query("SELECT v.candidate.id, c.name, p.name, COUNT(v) " +
           "FROM Vote v JOIN v.candidate c JOIN c.party p " +
           "WHERE v.constituency.id = :constituencyId " +
           "GROUP BY v.candidate.id, c.name, p.name " +
           "ORDER BY COUNT(v) DESC")
    List<Object[]> getVoteResultsByConstituency(@Param("constituencyId") Long constituencyId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.constituency.id = :constituencyId")
    long countTotalVotesInConstituency(@Param("constituencyId") Long constituencyId);
    
    @Query("SELECT v FROM Vote v JOIN FETCH v.candidate JOIN FETCH v.candidate.party WHERE v.constituency.id = :constituencyId")
    List<Vote> findAllVotesWithCandidatesInConstituency(@Param("constituencyId") Long constituencyId);

    @Query("SELECT new com.securevote.dto.ResultDTO(" +
           "c.id, c.name, p.name, p.symbolPath, COUNT(v.id), con.name) " +
           "FROM Candidate c " +
           "JOIN c.party p " +
           "JOIN c.constituency con " +
           "LEFT JOIN Vote v ON v.candidate.id = c.id " +
           "WHERE c.isActive = true " +
           "GROUP BY c.id, c.name, p.name, p.symbolPath, con.name " +
           "ORDER BY COUNT(v.id) DESC")
    List<ResultDTO> getAggregatedResults();
}