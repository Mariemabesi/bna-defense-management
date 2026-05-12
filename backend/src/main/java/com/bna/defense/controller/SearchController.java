package com.bna.defense.controller;

import com.bna.defense.dto.search.GlobalSearchResultDTO;
import com.bna.defense.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/global")
    public ResponseEntity<GlobalSearchResultDTO> globalSearch(@RequestParam String q, Principal principal) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(searchService.globalSearch(q, principal.getName()));
    }
}
