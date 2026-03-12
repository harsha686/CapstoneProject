package com.securevote.repositories;

import com.securevote.models.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConstituencyRepository extends JpaRepository<Constituency, Long> {
    
    List<Constituency> findByState(String state);
    
    List<Constituency> findByPincode(String pincode);
}