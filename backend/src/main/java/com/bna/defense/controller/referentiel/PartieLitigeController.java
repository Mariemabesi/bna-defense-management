package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.PartieLitige;
import com.bna.defense.repository.PartieLitigeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/parties-litige")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PartieLitigeController {

    @Autowired
    private PartieLitigeRepository partieLitigeRepository;

    @GetMapping
    public Page<PartieLitige> getAll(@RequestParam(required = false) String search,
                                     @RequestParam(required = false) PartieLitige.TypePartie type,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        String searchQuery = (search != null) ? search : "";
        return partieLitigeRepository.searchParties(searchQuery, type, PageRequest.of(page, size));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public PartieLitige create(@RequestBody PartieLitige item) {
        return partieLitigeRepository.save(item);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        partieLitigeRepository.deleteById(id);
    }
}
