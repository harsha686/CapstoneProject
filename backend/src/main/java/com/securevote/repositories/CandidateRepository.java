package com.securevote.repositories;

import com.securevote.models.Candidate;
import com.securevote.models.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    List<Candidate> findByConstituency(Constituency constituency);

    List<Candidate> findByConstituencyId(Long constituencyId);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.party WHERE c.constituency.id = :constituencyId")
    List<Candidate> findByConstituencyIdWithParty(@Param("constituencyId") Long constituencyId);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.party p WHERE c.constituency.id = :constituencyId ORDER BY p.name")
    List<Candidate> findByConstituencyIdOrderByPartyName(@Param("constituencyId") Long constituencyId);

    List<Candidate> findByIsActiveTrue();
}