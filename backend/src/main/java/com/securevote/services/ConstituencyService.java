package com.securevote.services;

import com.securevote.models.Constituency;
import com.securevote.repositories.ConstituencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConstituencyService {

    @Autowired
    private ConstituencyRepository constituencyRepository;

    public List<Constituency> getAllConstituencies() {
        return constituencyRepository.findAll();
    }

    public Constituency getConstituencyById(Long id) {
        return constituencyRepository.findById(id).orElse(null);
    }

    public Constituency addConstituency(Constituency constituency) {
        return constituencyRepository.save(constituency);
    }

    public void deleteConstituency(Long id) {
        constituencyRepository.deleteById(id);
    }
}
