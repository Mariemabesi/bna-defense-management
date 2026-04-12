import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-affaire-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-page-container">
      <div class="glass-header shadow-premium">
        <h1>🛠️ Création d'une Nouvelle Affaire</h1>
        <p>Phase 1: Identification Judiciaire • Phase 2: Rattachement Administrative</p>
      </div>

      <div class="stepper-content animate-fade-in">
        <!-- STEP 1: AFFAIRE DETAILS -->
        <div class="form-card glass-card" *ngIf="step === 1">
          <div class="card-header">
            <span class="step-badge">Étape 1/2</span>
            <h3>Informations de l'Affaire</h3>
          </div>
          
          <div class="grid-layout">
            <div class="form-group">
              <label>Référence Judiciaire (N° Affaire)</label>
              <input type="text" [(ngModel)]="affaire.referenceJudiciaire" placeholder="ex: 2024/CIV/1234" required>
            </div>
            
            <div class="form-group">
              <label>Titre / Objet de l'Affaire</label>
              <input type="text" [(ngModel)]="affaire.titre" placeholder="ex: Recouvrement prêt immo..." required>
            </div>

            <div class="form-group full">
              <label>Description détaillée</label>
              <textarea [(ngModel)]="affaire.description" placeholder="Contexte et enjeux de l'affaire..." rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <label>Type de Litige</label>
              <select [(ngModel)]="affaire.type">
                <option value="CREDIT">💰 Crédit</option>
                <option value="LITIGE">⚖️ Litige</option>
                <option value="GARANTIE">🛡️ Garantie</option>
                <option value="CIVIL">🏦 Civil</option>
                <option value="PENAL">🚨 Pénal</option>
                <option value="PRUDHOMME">👔 Prud'homme</option>
                <option value="PATRIMOINE_IMMOBILIER">🏠 Patrimoine / Immobilier</option>
              </select>
            </div>

            <div class="form-group">
              <label>Date d'Ouverture</label>
              <input type="date" [(ngModel)]="affaire.dateOuverture">
            </div>
          </div>

          <div class="footer-actions">
            <button class="btn-cancel" (click)="onCancel()">Annuler</button>
            <button class="btn-next" [disabled]="!affaire.referenceJudiciaire" (click)="goToStep2()">
              Suivant: Choisir le Dossier →
            </button>
          </div>
        </div>

        <!-- STEP 2: DOSSIER ASSIGNMENT -->
        <div class="form-card glass-card" *ngIf="step === 2">
          <div class="card-header">
            <span class="step-badge">Étape 2/2</span>
            <h3>Rattachement au Dossier Administratif</h3>
          </div>

          <div class="dossier-selector-box">
             <label>Sélectionnez un Dossier Existant</label>
             <div class="autocomplete-wrapper">
                <div class="search-input-wrapper">
                   <input type="text" 
                          placeholder="Rechercher par référence ou titre..." 
                          [(ngModel)]="searchTerm" 
                          (input)="onSearch()"
                          (focus)="onFocus()"
                          (blur)="onBlur()">
                   <div class="input-icon">🔍</div>
                </div>

                <!-- AUTOCOMPLETE DROPDOWN -->
                <div class="autocomplete-dropdown shadow-premium animate-slide-up" *ngIf="showDropdown">
                   <div class="dossier-results">
                      <div class="dossier-item" *ngFor="let d of filteredDossiers" 
                           [class.selected]="affaire.dossierId === d.id"
                           (mousedown)="selectDossier(d)">
                         <div class="d-info">
                            <span class="d-ref">{{ d.reference }}</span>
                            <span class="d-title">{{ d.titre }}</span>
                         </div>
                         <div class="d-check" *ngIf="affaire.dossierId === d.id">✅</div>
                      </div>
                      <div class="empty-results" *ngIf="filteredDossiers.length === 0">
                         Aucun dossier trouvé pour "{{ searchTerm }}"
                      </div>
                   </div>
                </div>
             </div>

             <!-- Selection Summary -->
             <div class="selection-summary animate-fade-in" *ngIf="selectedDossier">
                <div class="summary-card">
                   <div class="summary-label">Dossier sélectionné :</div>
                   <div class="summary-value">{{ selectedDossier.reference }} - {{ selectedDossier.titre }}</div>
                </div>
             </div>
          </div>

          <div class="footer-actions">
            <button class="btn-back" (click)="step = 1">← Retour</button>
            <button class="btn-submit" [disabled]="!affaire.dossierId" (click)="requestConfirmation()">
              Finaliser l'Affaire
            </button>
          </div>
        </div>
      </div>

      <!-- PREMIUM CONFIRMATION MODAL -->
      <div class="modal-overlay animate-fade-in" *ngIf="showConfirmModal">
        <div class="modal-card glass-card animate-slide-up">
          <div class="modal-icon">⚠️</div>
          <h2>Confirmation de création</h2>
          <p>Êtes-vous sûr de vouloir créer cette affaire et la rattacher au dossier <strong>{{ selectedDossier?.reference }}</strong> ?</p>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showConfirmModal = false">Annuler</button>
            <button class="btn-confirm" (click)="saveAffaire()">Confirmer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page-container { padding: 40px; max-width: 900px; margin: 0 auto; min-height: 100vh; }
    .glass-header { 
      background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); 
      padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 40px;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .glass-header h1 { margin: 0; font-size: 24px; color: #1e293b; }
    .glass-header p { margin: 10px 0 0; color: #64748b; font-weight: 500; }

    .glass-card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
    .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
    .step-badge { background: #008766; color: white; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .card-header h3 { margin: 0; font-size: 18px; color: #1e293b; }

    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .full { grid-column: span 2; }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 13px; font-weight: 700; color: #64748b; }
    input, select, textarea { padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 15px; transition: 0.2s; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #008766; box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.1); }

    .footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; }
    button { padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; border: none; }
    .btn-next, .btn-submit { background: #008766; color: white; }
    .btn-next:hover, .btn-submit:hover { background: #00684d; transform: translateY(-2px); }
    .btn-cancel, .btn-back { background: #f1f5f9; color: #64748b; }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

    .dossier-selector-box { display: flex; flex-direction: column; gap: 20px; }
    .autocomplete-wrapper { position: relative; }
    .autocomplete-dropdown {
      position: absolute; top: calc(100% + 8px); left: 0; right: 0;
      background: white; border-radius: 16px; border: 1px solid #e2e8f0;
      box-shadow: 0 15px 30px rgba(0,0,0,0.1); z-index: 100;
      max-height: 300px; overflow-y: auto;
    }
    
    .dossier-results { display: flex; flex-direction: column; padding: 10px; }
    .dossier-item { 
      display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;
      border-radius: 12px; cursor: pointer; transition: 0.2s;
    }
    .dossier-item:hover { background: #f8fafc; color: #008766; }
    .dossier-item.selected { background: #f0fdf4; color: #008766; }
    .d-ref { font-weight: 800; display: block; }
    .d-title { font-size: 13px; opacity: 0.7; }

    .search-input-wrapper { position: relative; display: flex; align-items: center; }
    .search-input-wrapper input { width: 100%; padding-right: 45px; }
    .input-icon { position: absolute; right: 15px; color: #94a3b8; font-size: 18px; }

    .empty-results { padding: 30px; text-align: center; color: #64748b; font-size: 14px; }

    .selection-summary { margin-top: 20px; }
    .summary-card { padding: 15px 25px; background: #f0fdf4; border: 1px solid #bcf0da; border-radius: 16px; }
    .summary-label { font-size: 11px; font-weight: 800; color: #008766; text-transform: uppercase; margin-bottom: 4px; }
    .summary-value { font-size: 15px; font-weight: 700; color: #1e293b; }

    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-card { width: 450px; text-align: center; padding: 40px; }
    .modal-icon { font-size: 48px; margin-bottom: 20px; }
    .modal-card h2 { font-size: 22px; color: #1e293b; margin-bottom: 12px; }
    .modal-card p { color: #64748b; line-height: 1.6; margin-bottom: 30px; }
    .modal-footer { display: flex; gap: 12px; justify-content: center; }
    .btn-confirm { background: #008766; color: white; padding: 12px 30px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; }
    .btn-confirm:hover { background: #00684d; }
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
    private router: Router
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
    this.router.navigate(['/mes-dossiers']);
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
        this.router.navigate(['/mes-dossiers']);
      },
      error: () => this.notification.addNotification('Erreur lors de la création de l\'affaire', 'ROLE_CHARGE_DOSSIER', 'WARNING')
    });
  }
}
