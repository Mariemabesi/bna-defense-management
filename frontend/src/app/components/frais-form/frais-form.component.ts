import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FraisService } from '../../services/frais.service';
import { DossierService } from '../../services/dossier.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-frais-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Commandement de Frais"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN FORM HEADER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Nouvelle Requête de Frais</h1>
                <p>Enregistrez une demande d'honoraires ou de débours pour validation N1/N2.</p>
             </div>
             <button class="btn-back-ghost" routerLink="/dashboard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                RETOUR DASHBOARD
             </button>
          </div>

          <!-- SOVEREIGN BENTO FORM -->
          <div class="form-bento shadow-premium fade-in">
             <form [formGroup]="fraisForm" (ngSubmit)="onSubmit()" class="executive-form">
                
                <!-- SECTION 1: CONTEXT -->
                <div class="bento-section">
                   <div class="section-badge">CONTEXTE JUDICIAIRE</div>
                   <div class="input-grid">
                      <div class="input-unit">
                         <label>Dossier BNA Associé</label>
                         <select formControlName="numeroDossier" class="glass-select" [ngClass]="{'is-invalid': submitted && f['numeroDossier'].errors}">
                            <option value="">Sélectionnez un dossier actif</option>
                            <option *ngFor="let d of dossiers" [value]="d.reference">
                               {{ d.reference }} - {{ d.titre }}
                            </option>
                         </select>
                      </div>
                      <div class="input-unit">
                         <label>Nature du Débours</label>
                         <select formControlName="typeFrais" class="glass-select" [ngClass]="{'is-invalid': submitted && f['typeFrais'].errors}">
                            <option value="">Sélectionnez une catégorie</option>
                            <option value="HONORAIRES_AVOCAT">Honoraires d'Avocat</option>
                            <option value="FRAIS_HUISSIER">Frais d'Huissier</option>
                            <option value="EXPERTISE">Frais d'Expertise</option>
                            <option value="TIMBRAGE">Frais d'Enregistrement</option>
                            <option value="AUTRE">Autre</option>
                         </select>
                      </div>
                   </div>
                </div>

                <!-- SECTION 2: FINANCIALS -->
                <div class="bento-section">
                   <div class="section-badge">DÉTAILS FINANCIERS</div>
                   <div class="input-grid triple">
                      <div class="input-unit">
                         <label>Montant TTC (TND)</label>
                         <input type="number" formControlName="montant" placeholder="0.00" step="0.01" class="glass-field" [ngClass]="{'is-invalid': submitted && f['montant'].errors}">
                      </div>
                      <div class="input-unit">
                         <label>Date Pièce Jointe</label>
                         <input type="date" formControlName="dateFacture" class="glass-field" [ngClass]="{'is-invalid': submitted && f['dateFacture'].errors}">
                      </div>
                      <div class="input-unit">
                         <label>Identité du Bénéficiaire</label>
                         <input type="text" formControlName="beneficiaire" placeholder="Ex: Cabinet Me. X" class="glass-field" [ngClass]="{'is-invalid': submitted && f['beneficiaire'].errors}">
                      </div>
                   </div>
                </div>

                <!-- SECTION 3: JUSTIFICATION -->
                <div class="bento-section full">
                   <div class="section-badge">PIÈCES JUSTIFICATIVES</div>
                   <div class="upload-aura-zone">
                      <div class="aura-icon">
                         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </div>
                      <p>Glissez-déposez la facture scannée (PDF/IMG)</p>
                      <input type="file" id="pi" multiple class="hidden-input">
                      <label for="pi" class="btn-ghost-executive">PARCOURIR LE SYSTÈME</label>
                   </div>
                </div>

                <!-- FORM ACTIONS -->
                <div class="form-footer">
                   <button type="button" routerLink="/dashboard" class="btn-executive secondary">ANNULER</button>
                   <button type="submit" [disabled]="loading" class="btn-executive primary">
                      <span *ngIf="!loading">SOUMETTRE À L'AUDIT</span>
                      <div *ngIf="loading" class="executive-loader"></div>
                   </button>
                </div>

                <div *ngIf="error" class="error-toast fade-in">{{ error }}</div>
                <div *ngIf="successMsg" class="success-toast fade-in">{{ successMsg }}</div>
             </form>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }

    .header-banner { 
      background: white; border-radius: 32px; padding: 40px; border-left: 5px solid var(--bna-emerald);
      display: flex; justify-content: space-between; align-items: center; 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
    .banner-info h1 { font-size: 32px; font-weight: 850; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -1px; }
    .banner-info p { font-size: 15px; color: #64748b; margin: 0; font-weight: 600; }
    
    .btn-back-ghost { display: flex; align-items: center; gap: 10px; background: none; border: none; color: #94a3b8; font-weight: 850; font-size: 11px; cursor: pointer; transition: 0.2s; letter-spacing: 1px; }
    .btn-back-ghost:hover { color: var(--bna-emerald); transform: translateX(-5px); }

    .form-bento { background: white; border-radius: 32px; padding: 48px; }
    .bento-section { margin-bottom: 48px; }
    .section-badge { display: inline-block; font-size: 10px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; width: 100%; }
    
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .input-grid.triple { grid-template-columns: 1fr 1fr 1fr; }
    .input-unit { display: flex; flex-direction: column; gap: 10px; }
    .input-unit label { font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
    
    .glass-field, .glass-select { padding: 16px; border-radius: 14px; border: 2.5px solid #f1f5f9; background: #f8fafc; font-family: inherit; font-size: 14px; font-weight: 700; color: #1e293b; transition: 0.3s; width: 100%; box-sizing: border-box; }
    .glass-field:focus, .glass-select:focus { outline: none; border-color: var(--bna-emerald); background: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.05); }
    .glass-field.is-invalid, .glass-select.is-invalid { border-color: #ef4444; }

    .upload-aura-zone { border: 2.5px dashed #e2e8f0; border-radius: 20px; padding: 40px; text-align: center; background: #fafafa; transition: 0.3s; }
    .upload-aura-zone:hover { border-color: var(--bna-emerald); background: #ecfdf5; }
    .aura-icon { color: #94a3b8; margin-bottom: 16px; }
    .upload-aura-zone p { font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 16px; }
    .hidden-input { display: none; }
    .btn-ghost-executive { display: inline-block; padding: 10px 24px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 11px; font-weight: 900; letter-spacing: 1px; cursor: pointer; transition: 0.2s; }
    .btn-ghost-executive:hover { border-color: var(--bna-emerald); color: var(--bna-emerald); }

    .form-footer { margin-top: 32px; padding-top: 32px; border-top: 2px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 20px; }
    .btn-executive { padding: 16px 32px; border-radius: 16px; border: none; font-weight: 850; letter-spacing: 1px; font-size: 12px; cursor: pointer; transition: 0.3s; }
    .btn-executive.primary { background: var(--bna-emerald); color: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.2); }
    .btn-executive.secondary { background: #f8fafc; color: #64748b; }
    .btn-executive:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.1); }
    .btn-executive:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }

    .error-toast { margin-top: 24px; padding: 16px; background: #fef2f2; color: #ef4444; border-radius: 12px; font-weight: 800; font-size: 13px; text-align: center; }
    .success-toast { margin-top: 24px; padding: 16px; background: #ecfdf5; color: #10b981; border-radius: 12px; font-weight: 800; font-size: 13px; text-align: center; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .executive-loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class FraisFormComponent implements OnInit {
  fraisForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMsg = '';

  dossiers: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private fraisService: FraisService,
    private dossierService: DossierService
  ) {
    this.fraisForm = this.formBuilder.group({
      numeroDossier: ['', Validators.required],
      typeFrais: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      dateFacture: ['', Validators.required],
      beneficiaire: ['', Validators.required]
    });
  }

  get f() { return this.fraisForm.controls; }

  ngOnInit() {
    this.loadDossiers();
  }

  loadDossiers() {
    this.dossierService.getDossiers(0, 100).subscribe({
      next: (data) => this.dossiers = data.content ? data.content : (Array.isArray(data) ? data : []),
      error: (err) => console.error("Could not load dossiers", err)
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.successMsg = '';

    if (this.fraisForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = this.fraisForm.value;
    const description = `${formData.typeFrais} pour ${formData.beneficiaire} (Facture du ${formData.dateFacture})`;

    this.fraisService.createFrais({
      referenceDossier: formData.numeroDossier,
      libelle: description,
      montant: formData.montant,
      type: formData.typeFrais,
      statut: 'ATTENTE'
    } as any).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = "Demande de frais soumise avec succès.";
        setTimeout(() => this.router.navigate(['/mes-frais']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = "Session expirée. Veuillez vous reconnecter.";
        } else {
          this.error = "Erreur lors de l'envoi de la demande. Vérifiez que le dossier existe.";
        }
      }
    });
  }
}
