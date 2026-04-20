import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-affaire-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Nouvelle Affaire"></app-header>

        <div class="dashboard-content">
          <div class="form-container-premium slideIn">
            
            <div class="header-section animate-fade-in">
              <div class="title-block">
                <h1>🛠️ Création d'une Nouvelle Affaire</h1>
                <p>Initialisation du dossier judiciaire et rattachement administratif.</p>
              </div>
              <div class="step-indicator">
                <div class="step" [class.active]="step >= 1">1</div>
                <div class="step-line" [class.active]="step >= 2"></div>
                <div class="step" [class.active]="step >= 2">2</div>
              </div>
            </div>

            <!-- STEP 1: INFORMATIONS -->
            <div class="form-card animate-fade-in" *ngIf="step === 1">
              <div class="card-title">
                <span class="icon-wrap">⚖️</span>
                <h3>Phase 1: Identification Judiciaire</h3>
              </div>

              <div class="premium-grid">
                <div class="form-group">
                  <label>Référence Judiciaire (N° Affaire)</label>
                  <div class="input-wrapper">
                    <input type="text" [(ngModel)]="affaire.referenceJudiciaire" placeholder="ex: 2024/CIV/1234" required>
                  </div>
                </div>

                <div class="form-group">
                  <label>Titre / Objet de l'Affaire</label>
                  <div class="input-wrapper">
                    <input type="text" [(ngModel)]="affaire.titre" placeholder="ex: Recouvrement prêt immo..." required>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label>Description détaillée</label>
                  <textarea [(ngModel)]="affaire.description" placeholder="Contexte et enjeux de l'affaire..." rows="4"></textarea>
                </div>

                <div class="form-group">
                  <label>Type de Litige</label>
                  <select [(ngModel)]="affaire.type">
                    <option value="CIVIL">🏦 Civil</option>
                    <option value="PENAL">🚨 Pénal</option>
                    <option value="CREDIT">💰 Crédit</option>
                    <option value="LITIGE">⚖️ Litige</option>
                    <option value="GARANTIE">🛡️ Garantie</option>
                    <option value="PRUDHOMME">👔 Prud'homme</option>
                    <option value="PATRIMOINE_IMMOBILIER">🏠 Patrimoine / Immobilier</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Date d'Ouverture</label>
                  <div class="input-wrapper">
                    <input type="date" [(ngModel)]="affaire.dateOuverture">
                  </div>
                </div>
              </div>

              <div class="form-footer">
                <button class="btn-secondary" (click)="onCancel()">Annuler</button>
                <button class="btn-primary" [disabled]="!affaire.referenceJudiciaire || !affaire.titre" (click)="goToStep2()">
                  Suivant: Rattachement Dossier 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>

            <!-- STEP 2: RATTACHEMENT -->
            <div class="form-card animate-fade-in" *ngIf="step === 2">
              <div class="card-title">
                <span class="icon-wrap">📂</span>
                <h3>Phase 2: Rattachement Administrative</h3>
              </div>

              <div class="selector-box">
                <label>Sélectionnez le Dossier Administratif de référence</label>
                <div class="premium-autocomplete">
                  <div class="search-field">
                    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" 
                           placeholder="Rechercher par référence (DOSS-...) ou titre..." 
                           [(ngModel)]="searchTerm" 
                           (input)="onSearch()"
                           (focus)="onFocus()"
                           (blur)="onBlur()">
                  </div>

                  <!-- RESULTS DROPDOWN -->
                  <div class="results-dropdown shadow-premium" *ngIf="showDropdown">
                    <div class="result-item" *ngFor="let d of filteredDossiers" 
                         [class.selected]="affaire.dossierId === d.id"
                         (mousedown)="selectDossier(d)">
                      <div class="item-content">
                        <span class="item-ref">{{ d.reference }}</span>
                        <span class="item-title">{{ d.titre }}</span>
                      </div>
                      <svg *ngIf="affaire.dossierId === d.id" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008766" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="no-results" *ngIf="filteredDossiers.length === 0">
                      Aucun dossier ne correspond à "{{ searchTerm }}"
                    </div>
                  </div>
                </div>

                <!-- SELECTION FEEDBACK -->
                <div class="selection-feedback slide-in-top" *ngIf="selectedDossier">
                  <div class="feedback-card">
                    <div class="feedback-icon">✓</div>
                    <div class="feedback-text">
                      <span class="small">Dossier sélectionné</span>
                      <strong>{{ selectedDossier.reference }} — {{ selectedDossier.titre }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-footer">
                <button class="btn-secondary" (click)="step = 1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Retour
                </button>
                <button class="btn-primary" [disabled]="!affaire.dossierId" (click)="requestConfirmation()">
                  Finaliser la Création
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CONFIRMATION MODAL -->
        <div class="modal-overlay" *ngIf="showConfirmModal">
          <div class="modal-card slide-in-bottom">
            <div class="modal-header">
              <div class="warning-icon">!</div>
              <h3>Confirmer la Création</h3>
            </div>
            <div class="modal-body">
              <p>Vous êtes sur le point de créer l'affaire <strong>{{ affaire.referenceJudiciaire }}</strong>.</p>
              <p>Elle sera irrévocablement rattachée au dossier <strong>{{ selectedDossier?.reference }}</strong>.</p>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showConfirmModal = false">Annuler</button>
              <button class="btn-primary" (click)="saveAffaire()">Confirmer et Créer</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-content { padding: 40px; display: flex; justify-content: center; }
    .form-container-premium { width: 100%; max-width: 850px; }

    /* Header Section */
    .header-section {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;
    }
    .title-block h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
    .title-block p { font-size: 14px; color: #64748b; margin-top: 6px; }

    .step-indicator { display: flex; align-items: center; gap: 8px; }
    .step {
      width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px; color: #94a3b8; transition: 0.3s;
    }
    .step.active { background: #008766; color: white; }
    .step-line { width: 40px; height: 2px; background: #f1f5f9; transition: 0.3s; }
    .step-line.active { background: #008766; }

    /* Form Card */
    .form-card {
      background: white; border-radius: 24px; border: 1px solid #e2e8f0;
      padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    .card-title { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .icon-wrap { font-size: 24px; }
    .card-title h3 { font-size: 18px; font-weight: 800; color: #334155; margin: 0; }

    /* Layout */
    .premium-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .full-width { grid-column: span 2; }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .input-wrapper { position: relative; }
    input, select, textarea {
      width: 100%; padding: 12px 16px; border-radius: 12px; border: 2px solid #f1f5f9;
      background: #f8fafc; font-size: 15px; color: #1e293b; transition: all 0.2s;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus {
      outline: none; border-color: #008766; background: white;
      box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.08);
    }

    /* Footer */
    .form-footer {
      display: flex; justify-content: flex-end; gap: 16px;
      margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9;
    }

    /* Buttons */
    .btn-primary {
      background: #008766; color: white; border: none; padding: 12px 28px;
      border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: 0.3s;
    }
    .btn-primary:hover:not(:disabled) { background: #00684d; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,135,102,0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary {
      background: #f1f5f9; color: #475569; border: none; padding: 12px 24px;
      border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }

    /* Autocomplete */
    .selector-box { display: flex; flex-direction: column; gap: 12px; }
    .premium-autocomplete { position: relative; }
    .search-field { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 16px; color: #94a3b8; }
    .search-field input { padding-left: 48px; }

    .results-dropdown {
      position: absolute; top: calc(100% + 8px); left: 0; right: 0;
      background: white; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 8px; z-index: 100; max-height: 300px; overflow-y: auto;
    }
    .result-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-radius: 10px; cursor: pointer; transition: 0.2s;
    }
    .result-item:hover { background: #f8fafc; }
    .result-item.selected { background: #f0fdf4; }
    .item-content { display: flex; flex-direction: column; }
    .item-ref { font-weight: 800; font-size: 13px; color: #008766; }
    .item-title { font-size: 14px; color: #475569; margin-top: 2px; }
    .no-results { padding: 24px; text-align: center; color: #94a3b8; font-size: 14px; }

    .feedback-card {
      display: flex; align-items: center; gap: 16px;
      background: #f0fdf4; border: 1.5px solid #bcf0da;
      padding: 16px 24px; border-radius: 16px; margin-top: 16px;
    }
    .feedback-icon {
      width: 24px; height: 24px; background: #008766; color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px;
    }
    .feedback-text { display: flex; flex-direction: column; }
    .small { font-size: 11px; font-weight: 700; color: #008766; text-transform: uppercase; }
    .feedback-text strong { font-size: 15px; color: #1e293b; margin-top: 2px; }

    /* Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      z-index: 2000; display: flex; align-items: center; justify-content: center;
    }
    .modal-card {
      background: white; border-radius: 28px; width: 440px; padding: 40px;
      text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .warning-icon {
      width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: #d97706;
      font-size: 28px; font-weight: 800; margin: 0 auto 24px;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-card h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
    .modal-body p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 12px; }
    .modal-actions { display: flex; gap: 12px; margin-top: 32px; }
    .modal-actions button { flex: 1; }

    /* Animations */
    .slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    
    .slide-in-top { animation: slideInTop 0.3s ease-out both; }
    @keyframes slideInTop { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .slide-in-bottom { animation: slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideInBottom { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AffaireFormComponent implements OnInit {
  step: number = 1;
  affaire: Partial<Affaire> = {
    referenceJudiciaire: '',
    type: 'CIVIL',
    dateOuverture: new Date().toISOString().split('T')[0]
  };
  dossiers: Dossier[] = [];
  filteredDossiers: Dossier[] = [];
  selectedDossier: Dossier | null = null;
  searchTerm: string = '';
  showDropdown: boolean = false;
  showConfirmModal: boolean = false;

  constructor(
    private affaireService: AffaireService,
    private dossierService: DossierService,
    private notification: NotificationService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers() {
    this.dossierService.getDossiers(0, 100).subscribe(data => {
      this.dossiers = data.content || [];
      this.filteredDossiers = data.content || [];
    });
  }

  onFocus() {
    this.showDropdown = true;
    this.onSearch();
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 250);
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredDossiers = this.dossiers;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDossiers = this.dossiers.filter(d => 
        (d.reference && d.reference.toLowerCase().includes(term)) ||
        (d.titre && d.titre.toLowerCase().includes(term))
      );
    }
  }

  goToStep2() {
    this.step = 2;
  }

  selectDossier(d: Dossier) {
    this.affaire.dossierId = d.id;
    this.selectedDossier = d;
    this.searchTerm = `${d.reference} - ${d.titre}`;
    this.showDropdown = false;
  }

  onCancel() {
    this.router.navigate(['/affaires']);
  }

  requestConfirmation() {
    if (this.affaire.dossierId) {
      this.showConfirmModal = true;
    }
  }

  saveAffaire() {
    this.showConfirmModal = false;
    this.affaireService.createAffaire(this.affaire).subscribe({
      next: (res) => {
        this.notification.addNotification('Affaire créée et rattachée avec succès !', 'ROLE_CHARGE_DOSSIER', 'SUCCESS');
        this.router.navigate(['/affaires']);
      },
      error: () => this.notification.addNotification('Erreur lors de la création de l\'affaire', 'ROLE_CHARGE_DOSSIER', 'WARNING')
    });
  }
}
