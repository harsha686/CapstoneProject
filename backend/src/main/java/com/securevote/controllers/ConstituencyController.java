package com.securevote.controllers;

import com.securevote.models.Constituency;
import com.securevote.services.ConstituencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constituencies")
public class ConstituencyController {

    @Autowired
    private ConstituencyService constituencyService;

    @GetMapping
    public List<Constituency> getAllConstituencies() {
        return constituencyService.getAllConstituencies();
    }

    @PostMapping
    public Constituency addConstituency(@RequestBody Constituency constituency) {
        return constituencyService.addConstituency(constituency);
    }

    @DeleteMapping("/{id}")
    public void deleteConstituency(@PathVariable Long id) {
        constituencyService.deleteConstituency(id);
    }
}
