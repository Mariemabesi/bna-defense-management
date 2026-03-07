import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DossierService } from '../../services/dossier.service';
import { FraisService } from '../../services/frais.service';
import { ReportingService, DashboardStats } from '../../services/reporting.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { Dossier } from '../../models/dossier.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ReferentielService, Auxiliaire } from '../../services/referentiel.service';
import { AIService, AIAnalysis } from '../../services/ai.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Espace {{ getSpaceName() }}"></app-header>

        <div class="dashboard-content">
      <!-- ============================================== -->
      <!-- DASHBOARD CHARGE DE DOSSIER -->
      <!-- ============================================== -->
      <ng-container *ngIf="isChargeDossier() || isAdmin()">
        <div class="role-welcome-banner bna">
          <div class="banner-content">
            <h2>Espace Chargé de Dossier</h2>
            <p>Pilotez vos dossiers juridiques et suivez vos demandes de frais en temps réel.</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Mes Dossiers Actifs</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="trend positive">{{ stats ? stats.totalDossiers + ' total' : 'Chargement...' }}</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers Clôturés</div>
              <div class="value">{{ stats ? stats.closedDossiers : '—' }}</div>
              <div class="status-indicator">Au total</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Taux de Réussite</div>
              <div class="value">{{ stats ? (stats.successRate * 100 | number:'1.0-1') + '%' : '—' }}</div>
              <div class="trend positive">Performance Juridique</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Budget Provisionné</div>
              <div class="value">{{ stats ? (stats.totalBudgetProvisionne | number:'1.0-0') : '—' }} TND</div>
              <div class="status-indicator">Consolidation globale</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Suivi de mes dossiers</h2>
              <span class="badge info">{{ filterDossiers('CHARGE').length }} actifs</span>
            </div>
            <div class="actions-group">
              <button class="btn-secondary" routerLink="/nouvelle-demande-frais">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Nouvelle Demande de Frais
              </button>
              <button class="btn-primary" routerLink="/nouveau-dossier">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Nouveau Dossier
              </button>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'CHARGE' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD PRE-VALIDATEUR -->
      <!-- ============================================== -->
      <!-- ============================================== -->
      <!-- DASHBOARD PRE-VALIDATEUR -->
      <!-- ============================================== -->
      <ng-container *ngIf="isPreValidateur() || isAdmin()">
        <div class="role-welcome-banner warning">
          <div class="banner-content">
            <h2>Espace Pré-Validation</h2>
            <p>Vérification technique des dossiers et contrôle des bordereaux de frais.</p>
          </div>
          <div class="banner-actions">
            <button class="btn-primary white" (click)="onAction('Rapport Technique', 'Export')">Générer Rapport de Conformité</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers à Pré-valider</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="action-needed">Action technique requise</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Frais à Pré-valider</div>
              <div class="value">{{ stats ? stats.totalFraisPending : '—' }}</div>
              <div class="action-needed">Vérification bordereau</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon grey">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers Traités (Mois)</div>
              <div class="value">{{ stats ? stats.closedDossiers : '—' }}</div>
              <div class="status-indicator">Performance équipe</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>File d'Attente de Validation Technique</h2>
              <span class="badge warning">{{ dossiers.length }} à traiter</span>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'PRE_VALIDATOR' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD VALIDATEUR -->
      <!-- ============================================== -->
      <!-- ============================================== -->
      <!-- DASHBOARD VALIDATEUR -->
      <!-- ============================================== -->
      <ng-container *ngIf="isValidateur() || isAdmin()">
        <div class="role-welcome-banner danger">
          <div class="banner-content">
            <h2>Espace Approbation (Validateur)</h2>
            <p>Validation finale des règlements et ordonnancement des paiements Trésorerie.</p>
          </div>
          <div class="banner-actions">
            <button class="btn-primary white" (click)="onAction('Batch Paiement', 'Trésorerie')">Transmettre Batch Trésorerie</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Bons à Payer (BAP)</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="action-needed">Validation finale</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Montant Total à Valider</div>
              <div class="value">{{ stats ? (stats.totalFraisAmountPending | number:'1.0-0') : '—' }} TND</div>
              <div class="action-needed">Engagement financier</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Sécurité Système</div>
              <div class="value">99.9%</div>
              <div class="status-indicator">Audit conforme</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Approbations de Règlements</h2>
              <span class="badge danger">Urgent</span>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'VALIDATOR' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD ADMINISTRATION -->
      <!-- ============================================== -->
      <!-- ============================================== -->
      <!-- DASHBOARD ADMINISTRATION -->
      <!-- ============================================== -->
      <ng-container *ngIf="isAdmin()">
        <div class="role-welcome-banner bna">
          <div class="banner-content">
            <h2>Pannel d'Administration</h2>
            <p>Supervision globale du système, gestion des comptes et audit des logs.</p>
          </div>
          <div class="banner-actions">
            <button class="btn-primary white" (click)="onAction('Audit Logs', 'All')">Exporter Logs Audit</button>
            <button class="btn-primary white" (click)="onAction('Config', 'System')">Paramètres Système</button>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Gestion des Utilisateurs & Sécurité</h2>
              <span class="badge info">Live Audit</span>
            </div>
            <div class="actions-group">
              <button class="btn-primary">Nouveau Utilisateur</button>
            </div>
          </div>
          
          <div class="admin-grid">
            <div class="admin-card">
              <div class="admin-card-header">
                <span class="admin-card-title">Utilisateurs Récents</span>
                <span class="badge info">{{ users.length }} Utilisateurs</span>
              </div>
              <div class="user-list">
                <div class="user-row" *ngFor="let user of users?.slice(0, 5)">
                  <div class="user-info-brief">
                    <div class="user-avatar-small">{{ user.username.substring(0,2).toUpperCase() }}</div>
                    <div class="user-name-role">
                      <span class="user-name">{{ user.username }}</span>
                      <span class="user-role-tag">{{ user.roles[0].replace('ROLE_', '') }}</span>
                    </div>
                  </div>
                  <button class="btn-action" (click)="onAction('Modifier Utilisateur', user.username)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                </div>
              </div>
              <button class="btn-secondary" style="margin-top: 8px;">Voir tous les utilisateurs</button>
            </div>

            <div class="admin-card">
              <div class="admin-card-header">
                <span class="admin-card-title">Santé & Mémoire Système</span>
              </div>
              <div class="system-stats" style="display: flex; flex-direction: column; gap: 16px;">
                <div class="stat-item" style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
                    <span>Utilisation Base de Données</span>
                    <span>14%</span>
                  </div>
                  <div style="height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                    <div style="width: 14%; height: 100%; background: var(--bna-green);"></div>
                  </div>
                </div>
                <div class="stat-item" style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
                    <span>Stockage Documents</span>
                    <span>42%</span>
                  </div>
                  <div style="height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                    <div style="width: 42%; height: 100%; background: #3b82f6;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD REFERENTIEL (ADMIN ONLY) -->
      <!-- ============================================== -->
      <ng-container *ngIf="isAdmin()">
        <div class="role-welcome-banner info">
          <div class="banner-content">
            <h2>Espace Référentiel</h2>
            <p>Gestion de la base de données des auxiliaires de justice et des juridictions nationales.</p>
          </div>
          <div class="banner-actions">
            <button class="btn-primary white" (click)="onAction('Export', 'Referentiel')">Exporter Annuaire</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Avocats & Huissiers</div>
              <div class="value">{{ stats ? stats.totalAvocats + ' / ' + stats.totalHuissiers : '—' }}</div>
              <div class="status-indicator">Auxiliaires actifs</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Procédures Juridiques</div>
              <div class="value">{{ stats ? stats.totalProcedures : '—' }}</div>
              <div class="status-indicator">Types répertoriés</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Adversaires & Instances</div>
              <div class="value">{{ stats ? stats.totalAdversaires : '—' }}</div>
              <div class="status-indicator">Entités enregistrées</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
               <h2>Gestion du Référentiel National</h2>
               <span class="badge info">Données Justice</span>
            </div>
            <div class="actions-group">
              <button class="btn-secondary" (click)="onAction('Nouveau Tribunal', 'National')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg>
                Nouveau Tribunal
              </button>
              <button class="btn-primary" (click)="onAction('Ajouter Auxiliaire', 'Nouveau')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                Ajouter Auxiliaire
              </button>
            </div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Entité</th>
                  <th>Catégorie</th>
                  <th>Contact/Localisation</th>
                  <th>Statut</th>
                  <th>Date Ajout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let aux of auxiliaires">
                  <td><strong>{{ aux.nom }}</strong></td>
                  <td>{{ aux.type }}</td>
                  <td>{{ aux.adresse }} - {{ aux.telephone }}</td>
                  <td><span class="badge success">Actif</span></td>
                  <td>{{ aux.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action" title="Détails" (click)="onAction('Voir Auxiliaire', aux.nom)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="auxiliaires.length === 0">
                  <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Aucun auxiliaire enregistré.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- REUSABLE TABLE TEMPLATE FOR DOSSIERS & FRAIS -->
      <!-- ============================================== -->
      <ng-template #dossiersTable let-filter="filter">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Titre / Objet</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of filterDossiers(filter)">
                <td><strong>{{ d.reference }}</strong></td>
                <td>{{ d.titre }}</td>
                <td><span class="badge" [ngClass]="getPrioriteBadge(d.priorite)">{{ d.priorite || '—' }}</span></td>
                <td><span class="badge" [ngClass]="getBadgeClass(d.statut)">{{ d.statut }}</span></td>
                <td><strong>{{ d.budgetProvisionne != null ? (d.budgetProvisionne | number:'1.2-2') + ' TND' : '—' }}</strong></td>
                <td>
                  <div class="actions-cell">
                    <button class="btn-action" title="Voir" (click)="$event.stopPropagation(); onViewDossier(d)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn-action" title="Modifier" *ngIf="isChargeDossier() || isAdmin()" [routerLink]="['/modifier-dossier', d.reference]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-action warning-bg" title="Approuver" *ngIf="isPreValidateur() || isAdmin()" (click)="$event.stopPropagation(); onAction('Approuver', d.reference)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    </button>
                    <button class="btn-action danger-bg" title="Valider" *ngIf="isValidateur() || isAdmin()" (click)="$event.stopPropagation(); onAction('Valider', d.reference)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filterDossiers(filter).length === 0">
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  Aucun dossier correspondant à ce statut.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-template>

      <!-- DOSSIER DETAILS MODAL -->
      <div class="modal-overlay" *ngIf="selectedDossier" (click)="closeDossierModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Détails du Dossier: {{ selectedDossier.reference }}</h3>
            <button class="btn-close" (click)="closeDossierModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-group">
              <span class="detail-label">Titre / Objet</span>
              <span class="detail-value">{{ selectedDossier.titre }}</span>
            </div>
            <div class="grid-2-col">
              <div class="detail-group">
                <span class="detail-label">Statut</span>
                <span class="badge" [ngClass]="getBadgeClass(selectedDossier.statut)">{{ selectedDossier.statut }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Priorité</span>
                <span class="badge" [ngClass]="getPrioriteBadge(selectedDossier.priorite)">{{ selectedDossier.priorite || '—' }}</span>
              </div>
            </div>
            <div class="detail-group">
              <span class="detail-label">Budget Provisionné</span>
              <span class="detail-value font-mono">{{ selectedDossier.budgetProvisionne != null ? (selectedDossier.budgetProvisionne | number:'1.2-2') + ' TND' : 'Non défini' }}</span>
            </div>
            <div class="detail-group" *ngIf="selectedDossier.description">
              <span class="detail-label">Description / Notes</span>
                  <div class="detail-desc">{{ selectedDossier.description }}</div>
                </div>

                <!-- AI ANALYSIS SECTION -->
                <div class="ai-section" *ngIf="aiAnalysis || aiLoading">
                  <div class="ai-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>ANALYSE IA DEFENSE</span>
                  </div>
                  
                  <div *ngIf="aiLoading" class="ai-loader">
                    <div class="pulse-ring"></div>
                    <span>Intelligence Artificielle en cours de réflexion...</span>
                  </div>

                  <div *ngIf="aiAnalysis" class="ai-result slideIn">
                    <div class="ai-summary">{{ aiAnalysis.summary }}</div>
                    <div class="ai-meta">
                      <span class="ai-risk" [ngClass]="aiAnalysis.riskLevel.toLowerCase()">
                        Risque: {{ aiAnalysis.riskLevel }}
                      </span>
                      <span class="ai-conf">Confiance: {{ aiAnalysis.confidence * 100 }}%</span>
                    </div>
                    <div class="ai-suggestions">
                      <strong>Recommandations:</strong>
                      <ul>
                        <li *ngFor="let s of aiAnalysis.suggestions">{{ s }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-ai" (click)="analyzeWithAI()" [disabled]="aiLoading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                  {{ aiLoading ? 'Analyse...' : 'Analyse IA Profonde' }}
                </button>
                <button class="btn-secondary" (click)="closeDossierModal()">Fermer</button>
            <button class="btn-primary" *ngIf="isChargeDossier() || isAdmin()" [routerLink]="['/modifier-dossier', selectedDossier.reference]">
              Modifier ce dossier
            </button>
          </div>
        </div>
      </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --bg-color: #f0f4f8;
      --sidebar-width: 280px;
      --header-height: 90px;
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.08);
      --bna-green-hover: #007256;
      --bna-green-dark: #005641;
      --bna-grey: #40514e;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-color);
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    
    .nav-section-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin: 24px 0 12px 18px;
    }

    .fav-list { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .fav-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px 14px; 
      border-radius: 10px; font-size: 14px; color: var(--text-main); font-weight: 500;
      text-decoration: none; transition: all 0.2s;
    }
    .fav-item:hover { background: #f1f5f9; color: var(--bna-green); }
    .fav-dot { width: 8px; height: 8px; border-radius: 50%; }
    .fav-dot.green { background: #10b981; }
    .fav-dot.grey { background: #94a3b8; }

    .btn-action.danger-bg svg { stroke: white; }

    /* ROLE BANNERS */
    .role-welcome-banner {
      padding: 32px;
      border-radius: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
    }
    .role-welcome-banner.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .role-welcome-banner.danger { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
    .role-welcome-banner.bna { background: linear-gradient(135deg, var(--bna-green) 0%, var(--bna-green-dark) 100%); }
    .role-welcome-banner.info { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

    .banner-content h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; }
    .banner-content p { margin: 0; opacity: 0.9; font-size: 15px; }
    .banner-actions { display: flex; gap: 12px; }
    .btn-primary.white { background: white; color: var(--text-main); border: none; font-weight: 700; }
    .btn-primary.white:hover { background: #f8fafc; transform: translateY(-2px); }

    .title-with-badge { display: flex; align-items: center; gap: 16px; }

    .deadline-box { display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
    .deadline-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px; 
      background: rgba(255,255,255,0.5); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02);
    }
    .deadline-date { 
      font-size: 11px; font-weight: 800; color: white; background: var(--bna-green); 
      padding: 4px 6px; border-radius: 6px; min-width: 45px; text-align: center;
    }
    .deadline-text { font-size: 12px; font-weight: 600; color: var(--text-main); }
    /* PREMIUM MAIN CONTENT */
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
    }

    .user-info {
      text-align: right;
    }

    .user-email {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .user-role {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%);
      border-radius: 12px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(0,135,102,0.3);
    }

    .dashboard-content {
      padding: 32px 48px 48px 48px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .stat-card {
      background: white; padding: 32px; border-radius: 24px;
      display: flex; align-items: center; gap: 24px;
      border: 1px solid rgba(0,0,0,0.03);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    .stat-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); border-color: rgba(0, 135, 102, 0.1); }
    .stat-card::after {
      content: ''; position: absolute; top: 0; right: 0; width: 100px; height: 100px;
      background: radial-gradient(circle, rgba(0, 135, 102, 0.03) 0%, transparent 70%);
      border-radius: 50%; transform: translate(30%, -30%);
    }
    .stat-icon {
      width: 64px; height: 64px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s;
    }
    .stat-card:hover .stat-icon { transform: scale(1.1) rotate(5deg); }
    
    .stat-icon.green { background: linear-gradient(135deg, #008766 0%, #00a87f 100%); color: white; }
    .stat-icon.info { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; }
    .stat-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; }
    .stat-icon.danger { background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); color: white; }
    
    .stat-content .label { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .stat-content .value { font-size: 32px; font-weight: 850; color: #1e293b; letter-spacing: -1px; margin-bottom: 4px; }
    .stat-content .trend { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .trend.positive { color: #10b981; }
    .status-indicator, .action-needed { font-size: 12px; font-weight: 600; color: #64748b; }

    .role-welcome-banner {
      padding: 40px; border-radius: 32px; margin-bottom: 40px;
      display: flex; justify-content: space-between; align-items: center;
      position: relative; overflow: hidden; color: white;
      box-shadow: 0 20px 40px rgba(0, 135, 102, 0.15);
    }
    .role-welcome-banner.bna { background: linear-gradient(135deg, #005641 0%, #008766 100%); }
    .role-welcome-banner.warning { background: linear-gradient(135deg, #92400e 0%, #d97706 100%); }
    .role-welcome-banner.danger { background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); }
    .role-welcome-banner.info { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
    
    .role-welcome-banner::before {
      content: ''; position: absolute; width: 400px; height: 400px; 
      background: rgba(255,255,255,0.1); border-radius: 50%;
      top: -150px; right: -150px;
    }
    .banner-content { position: relative; z-index: 1; }
    .banner-content h2 { margin: 0 0 12px 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; }
    .banner-content p { margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500; }
    .banner-actions { position: relative; z-index: 1; display: flex; gap: 16px; }

    .recent-section { margin-top: 48px; }
    .section-header { 
      display: flex; justify-content: space-between; align-items: flex-end; 
      margin-bottom: 32px; padding: 0 8px;
    }
    .section-header h2 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin: 0; }
    .title-with-badge { display: flex; align-items: center; gap: 16px; }
    
    .table-container { 
      background: transparent; border-radius: 0; box-shadow: none; 
      overflow-x: auto; padding-bottom: 20px;
    }
    table { width: 100%; border-collapse: separate; border-spacing: 0 16px; margin-top: -16px; min-width: 900px; }
    th { padding: 16px 24px; color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
    td { 
      padding: 24px; background: white; border-top: 1px solid rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.03); 
      font-size: 15px; color: #334155; transition: all 0.2s ease;
    }
    td:first-child { border-left: 1px solid rgba(0,0,0,0.03); border-top-left-radius: 24px; border-bottom-left-radius: 24px; }
    td:last-child { border-right: 1px solid rgba(0,0,0,0.03); border-top-right-radius: 24px; border-bottom-right-radius: 24px; }
    
    tr:hover td { background: #f8fafc; transform: scale(1.002); }
    tr:hover td:first-child { box-shadow: -10px 0 20px rgba(0,0,0,0.02); }
    
    .badge {
      display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 12px;
      font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge.success { background: #ecfdf5; color: #059669; }
    .badge.info { background: #eff6ff; color: #2563eb; }
    .badge.warning { background: #fffbeb; color: #d97706; }
    .badge.danger { background: #fef2f2; color: #dc2626; }

    .btn-action {
      width: 44px; height: 44px; border-radius: 14px; background: #f1f5f9;
      color: #64748b; border: none; cursor: pointer; display: flex;
      align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-action:hover { background: #008766; color: white; transform: rotate(8deg) scale(1.1); }
    .btn-action.warning-bg:hover { background: #d97706; }
    .btn-action.danger-bg:hover { background: #059669; }

    .btn-primary { 
      background: linear-gradient(135deg, #008766 0%, #00a87f 100%); 
      color: white; border: none; padding: 12px 24px; 
      border-radius: 14px; font-weight: 700; cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      box-shadow: 0 4px 12px rgba(0, 135, 102, 0.3);
      display: inline-flex; align-items: center; gap: 10px; font-size: 14px;
    }
    .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 24px rgba(0, 135, 102, 0.4); }
    .btn-primary:active { transform: translateY(-1px) scale(0.98); }
    
    .btn-primary.white { background: white; color: #008766; }
    .btn-primary.white:hover { background: #f8fafc; color: #007256; transform: translateY(-4px); }

    .btn-secondary {
      background: white; color: #475569; border: 1.5px solid #e2e8f0; padding: 11px 24px;
      border-radius: 14px; font-weight: 700; cursor: pointer; 
      transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 10px; font-size: 14px;
    }
    .btn-secondary:hover { background: #f8fafc; border-color: #008766; color: #008766; transform: translateY(-2px); }
    .btn-secondary:active { transform: translateY(0); }
    .table-container { background: transparent; padding: 0; border: none; box-shadow: none; overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 12px; margin-top: -12px; min-width: 900px; }
    th { padding: 16px 24px; text-align: left; font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; border: none; }
    td { 
      padding: 24px; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: var(--text-main); transition: background 0.2s ease;
    }
    td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
    td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
    tr:hover td { background: #f8fafc; border-color: #e2e8f0; }
    
    .badge { padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; }
    .badge.warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge.info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .badge.danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    
    .actions-cell { display: flex; gap: 12px; justify-content: flex-start; }
    .btn-action { 
      background: white; 
      color: #64748b; 
      border: 1px solid rgba(0,0,0,0.06); 
      width: 46px; 
      height: 46px; 
      border-radius: 15px; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
    }
    .btn-action:hover { 
      color: var(--bna-green); 
      border-color: rgba(0, 135, 102, 0.2); 
      transform: translateY(-3px) scale(1.05); 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02); 
      background: white;
    }
    .btn-action svg { width: 20px; height: 20px; stroke-width: 2.2px; }
    
    .btn-action.warning-bg { color: #d97706; }
    .btn-action.warning-bg:hover { color: #b45309; border-color: #fcd34d; }
    .btn-action.danger-bg { color: #059669; }
    .btn-action.danger-bg:hover { color: #047857; border-color: #6ee7b7; }

    /* ADMINISTRATION */
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-top: 24px; }
    .admin-card { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); }
    .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .admin-card-title { font-size: 18px; font-weight: 800; color: #1e293b; }
    
    .user-list { display: flex; flex-direction: column; gap: 12px; }
    .user-row { 
      display: flex; justify-content: space-between; align-items: center; padding: 16px; 
      border-radius: 16px; background: #f8fafc; transition: all 0.2s;
    }
    .user-row:hover { background: #f1f5f9; transform: translateX(4px); }
    .user-info-brief { display: flex; align-items: center; gap: 16px; }
    .user-avatar-small { 
      width: 40px; height: 40px; border-radius: 12px; background: #008766; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
    }
    .user-name-role { display: flex; flex-direction: column; }
    .user-name { font-size: 15px; font-weight: 700; color: #1e293b; }
    .user-role-tag { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

    .loading-shimmer { animation: shimmer 1.5s infinite; background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%); background-size: 200% 100%; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .table-loading { display: flex; align-items: center; gap: 12px; padding: 40px 24px; color: var(--text-muted); font-size: 15px; }
    .spinner-sm { width: 24px; height: 24px; border: 3px solid var(--bna-green-light); border-top: 3px solid var(--bna-green); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .table-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 24px; color: var(--text-muted); text-align: center; }
    .link { color: var(--bna-green); font-weight: 700; text-decoration: none; }
    .link:hover { text-decoration: underline; }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; border-radius: 24px; width: 100%; max-width: 600px;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2); overflow: hidden;
      animation: slideUp 0.3s ease-out; margin: 20px;
    }
    .modal-header {
      padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
    .btn-close {
      background: none; border: none; cursor: pointer; color: #64748b;
      display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 50%;
      transition: all 0.2s;
    }
    .btn-close:hover { background: #f1f5f9; color: #ef4444; }
    .modal-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .grid-2-col-modal { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .detail-group { display: flex; flex-direction: column; gap: 8px; }
    .detail-label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 16px; font-weight: 500; color: #1e293b; }
    .detail-value.font-mono { font-family: 'Courier New', Courier, monospace; font-weight: 700; color: var(--bna-green); }
    .detail-desc { font-size: 15px; color: #475569; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .modal-footer {
      padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: flex-end; gap: 16px;
    }
    
    /* AI STYLES */
    .ai-section { 
      margin-top: 8px; padding: 24px; border-radius: 20px; 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1.5px solid #bae6fd;
    }
    .ai-header { display: flex; align-items: center; gap: 10px; color: #0369a1; font-weight: 800; font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; }
    .ai-loader { display: flex; align-items: center; gap: 12px; color: #0369a1; font-weight: 600; font-size: 14px; }
    .pulse-ring { width: 12px; height: 12px; background: #0ea5e9; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); } }
    
    .ai-result { display: flex; flex-direction: column; gap: 16px; }
    .ai-summary { font-size: 15px; line-height: 1.6; color: #1e293b; font-weight: 500; }
    .ai-meta { display: flex; gap: 16px; align-items: center; }
    .ai-risk { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .ai-risk.low { background: #dcfce7; color: #166534; }
    .ai-risk.medium { background: #fef9c3; color: #854d0e; }
    .ai-risk.high { background: #fee2e2; color: #991b1b; }
    .ai-conf { font-size: 12px; color: #64748b; font-weight: 600; }
    .ai-suggestions { background: white; padding: 16px; border-radius: 12px; border: 1px solid #e0f2fe; }
    .ai-suggestions strong { display: block; margin-bottom: 8px; font-size: 13px; color: #0369a1; }
    .ai-suggestions ul { margin: 0; padding-left: 20px; font-size: 14px; color: #475569; }
    .ai-suggestions li { margin-bottom: 4px; }
    
    .btn-ai {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white; border: none; padding: 12px 24px; border-radius: 14px;
      font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .btn-ai:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }
    .btn-ai:disabled { opacity: 0.6; cursor: wait; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .main-content { margin-left: 0; }
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
      .stats-grid { grid-template-columns: 1fr; }
    }
    `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  Math = Math;

  // Real API data
  stats: DashboardStats | null = null;
  statsLoading = false;

  // AI Analysis
  aiAnalysis: AIAnalysis | null = null;
  aiLoading = false;

  dossiers: Dossier[] = [];
  selectedDossier: Dossier | null = null;
  dossiersLoading = false;

  users: any[] = [];
  usersLoading = false;

  auxiliaires: Auxiliaire[] = [];
  auxiliairesLoading = false;

  constructor(
    private dossierService: DossierService,
    private fraisService: FraisService,
    private reportingService: ReportingService,
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private referentielService: ReferentielService,
    private aiService: AIService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadStats();
      this.loadDossiers();
      if (this.isAdmin()) {
        this.loadUsers();
      }
      if (this.isAdmin() || this.isChargeDossier()) {
        this.loadAuxiliaires();
      }
    }
  }

  loadAuxiliaires(): void {
    this.auxiliairesLoading = true;
    this.referentielService.getAuxiliaires().subscribe({
      next: (data) => {
        this.auxiliaires = data;
        this.auxiliairesLoading = false;
      },
      error: () => {
        this.auxiliairesLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.usersLoading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.usersLoading = false;
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.reportingService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  loadDossiers(): void {
    this.dossiersLoading = true;
    this.dossierService.getDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.dossiersLoading = false;
      },
      error: () => {
        this.dossiersLoading = false;
      }
    });
  }

  filterDossiers(type: string): Dossier[] {
    if (this.isAdmin()) return this.dossiers;

    switch (type) {
      case 'CHARGE':
        return this.dossiers.filter(d => d.statut === 'OUVERT' || d.statut === 'EN_COURS' || d.statut === 'A_PRE_VALIDER');
      case 'PRE_VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'A_PRE_VALIDER');
      case 'VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'A_VALIDER');
      default:
        return this.dossiers;
    }
  }

  getBadgeClass(statut: string | undefined): string {
    switch (statut) {
      case 'CLOTURE': return 'success';
      case 'EN_COURS': return 'warning';
      case 'OUVERT': return 'info';
      default: return 'info';
    }
  }

  getPrioriteBadge(priorite: string | undefined): string {
    switch (priorite) {
      case 'HAUTE': return 'danger';
      case 'MOYENNE': return 'warning';
      case 'BASSE': return 'success';
      default: return 'info';
    }
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  formatRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'Rôle';
    return this.currentUser.roles.map((r: string) => r.replace('ROLE_', '').replace('_', ' ')).join(', ');
  }

  isChargeDossier(): boolean {
    return this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  isPreValidateur(): boolean {
    return this.authService.hasRole('ROLE_PRE_VALIDATEUR');
  }

  isValidateur(): boolean {
    return this.authService.hasRole('ROLE_VALIDATEUR');
  }



  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  onViewDossier(d: Dossier): void {
    this.selectedDossier = d;
  }

  closeDossierModal(): void {
    this.selectedDossier = null;
    this.aiAnalysis = null;
    this.aiLoading = false;
  }

  analyzeWithAI(): void {
    if (!this.selectedDossier || !this.selectedDossier.description) {
      this.notificationService.addNotification("Description insuffisante pour une analyse IA.", "ROLE_ADMIN", "WARNING");
      return;
    }

    this.aiLoading = true;
    this.aiAnalysis = null;
    this.aiService.analyzeDossier(this.selectedDossier.description).subscribe({
      next: (result) => {
        this.aiAnalysis = result;
        this.aiLoading = false;
        this.notificationService.addNotification("Analyse IA terminée avec succès.", "ROLE_ADMIN", "SUCCESS");
      },
      error: () => {
        this.aiLoading = false;
        this.notificationService.addNotification("Erreur lors de l'analyse IA.", "ROLE_ADMIN", "WARNING");
      }
    });
  }

  onAction(type: string, ref: string): void {
    const dossier = this.dossiers.find(d => d.reference === ref);

    if ((type === 'Approuver' || type === 'Valider') && dossier && dossier.id) {
      const nextStatus = type === 'Approuver' ? 'A_VALIDER' : 'CLOTURE';

      this.dossierService.updateStatus(dossier.id, nextStatus).subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;
          this.loadStats(); // Refresh stats

          if (type === 'Approuver') {
            this.notificationService.addNotification(
              `Dossier ${ref} pré-validé avec succès. Transmis au validateur.`,
              'ROLE_PRE_VALIDATEUR', 'SUCCESS'
            );
          } else {
            this.notificationService.addNotification(
              `Dossier ${ref} validé et clôturé avec succès.`,
              'ROLE_VALIDATEUR', 'SUCCESS'
            );
          }
        },
        error: () => {
          this.notificationService.addNotification(
            `Erreur lors de la mise à jour du dossier ${ref}.`,
            'ROLE_ADMIN', 'WARNING'
          );
        }
      });
    } else if (type === 'Soumettre' && dossier && dossier.id) {
      this.dossierService.updateStatus(dossier.id, 'A_PRE_VALIDER').subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;
          this.notificationService.addNotification(`Dossier ${ref} soumis pour pré-validation.`, 'ROLE_CHARGE_DOSSIER', 'INFO');
        }
      });
    } else if (type === 'Batch Paiement') {
      this.batchSendToTreasury();
    } else if (type === 'Export' && ref === 'Referentiel') {
      this.exportAnnuaire();
    } else if (type === 'Nouveau Tribunal' || type === 'Ajouter Auxiliaire' || type.startsWith('Voir')) {
      this.notificationService.addNotification(
        `Ouverture du module: ${type}...`,
        'ROLE_ADMIN', 'SUCCESS'
      );
      this.router.navigate(['/referentiel'], { queryParams: { action: type } });
    } else {
      this.notificationService.addNotification(
        `${type} pour ${ref} : Cette fonctionnalité sera disponible dans la prochaine mise à jour.`,
        'ROLE_ADMIN', 'WARNING'
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getSpaceName(): string {
    if (this.isChargeDossier()) return 'Chargé de Dossier';
    if (this.isPreValidateur()) return 'Pré-Validateur';
    if (this.isValidateur()) return 'Validateur';
    if (this.isAdmin()) return 'Administrateur';
    return 'Action en Défense';
  }

  exportAnnuaire(): void {
    if (this.auxiliaires.length === 0) {
      this.notificationService.addNotification("Aucun auxiliaire à exporter.", "ROLE_ADMIN", "WARNING");
      return;
    }
    const headers = ['Nom', 'Type', 'Spécialité', 'Téléphone', 'Email', 'Adresse', 'Date Ajout'];
    const rows = this.auxiliaires.map(aux => [
      aux.nom,
      aux.type,
      aux.specialite || 'Généraliste',
      aux.telephone,
      aux.email,
      aux.adresse,
      aux.createdAt ? new Date(aux.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Add BOM for Excel UTF-8 display
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'annuaire_auxiliaires.csv';
    link.click();
    this.notificationService.addNotification("Annuaire exporté (CSV).", "ROLE_ADMIN", "SUCCESS");
  }

  batchSendToTreasury(): void {
    this.fraisService.batchSendToTreasury().subscribe({
      next: (result) => {
        if (result.count > 0) {
          this.notificationService.addNotification(
            `Batch Virement réussi : ${result.count} frais transmis à la Trésorerie.`,
            'ROLE_VALIDATEUR', 'SUCCESS'
          );
        } else {
          this.notificationService.addNotification(
            'Aucun frais validé à transmettre à la Trésorerie.',
            'ROLE_VALIDATEUR', 'WARNING'
          );
        }
        this.loadStats();
      },
      error: () => {
        this.notificationService.addNotification(
          'Erreur lors du batch virement vers la Trésorerie.',
          'ROLE_VALIDATEUR', 'WARNING'
        );
      }
    });
  }
}
