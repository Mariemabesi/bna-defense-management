package com.bna.defense.service.referentiel;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public abstract class GenericReferentielService<T, ID> {

    public Page<T> findAll(JpaSpecificationExecutor<T> repository, Specification<T> spec, Pageable pageable) {
        return repository.findAll(spec, pageable);
    }

    public List<T> findAll(JpaRepository<T, ID> repository) {
        return repository.findAll();
    }

    public Optional<T> findById(JpaRepository<T, ID> repository, ID id) {
        return repository.findById(id);
    }

    public T save(JpaRepository<T, ID> repository, T entity) {
        return repository.save(entity);
    }

    public void delete(JpaRepository<T, ID> repository, ID id) {
        repository.deleteById(id);
    }
}
