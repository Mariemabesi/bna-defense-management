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
        <app-header title="Nouvelle Demande de Frais"></app-header>

        <div class="dashboard-content">
          <div class="form-page">
            <header class="page-header" style="margin-bottom: 24px;">
              <div class="header-left">
                <button class="btn-back" routerLink="/dashboard">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Retour
                </button>
              </div>
            </header>

            <div class="form-container">
              <form [formGroup]="fraisForm" (ngSubmit)="onSubmit()">
                
                <div class="form-section">
                  <h2 class="section-title">Informations sur la Demande</h2>
                  
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="numeroDossier">Numéro de Dossier Associé</label>
                      <select id="numeroDossier" formControlName="numeroDossier" class="form-control" [ngClass]="{'is-invalid': submitted && f['numeroDossier'].errors}">
                        <option value="">Sélectionnez un dossier</option>
                        <option *ngFor="let d of dossiers" [value]="d.reference">
                          {{ d.reference }} - {{ d.titre }}
                        </option>
                      </select>
                      <div *ngIf="submitted && f['numeroDossier'].errors" class="invalid-feedback">
                        Le dossier est requis.
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="typeFrais">Type de Frais</label>
                      <select id="typeFrais" formControlName="typeFrais" class="form-control" [ngClass]="{'is-invalid': submitted && f['typeFrais'].errors}">
                        <option value="">Sélectionnez un type</option>
                        <option value="HONORAIRES_AVOCAT">Honoraires d'Avocat</option>
                        <option value="FRAIS_HUISSIER">Frais d'Huissier</option>
                        <option value="EXPERTISE">Frais d'Expertise</option>
                        <option value="TIMBRAGE">Frais d'Enregistrement / Timbrage</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                      <div *ngIf="submitted && f['typeFrais'].errors" class="invalid-feedback">
                        Le type de frais est requis.
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="montant">Montant (TND)</label>
                      <div class="input-group">
                        <input type="number" id="montant" formControlName="montant" class="form-control" placeholder="0.00" step="0.01" [ngClass]="{'is-invalid': submitted && f['montant'].errors}">
                      </div>
                      <div *ngIf="submitted && f['montant'].errors" class="invalid-feedback">
                        Un montant valide est requis.
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="dateFacture">Date de la Facture / Bordereau</label>
                      <input type="date" id="dateFacture" formControlName="dateFacture" class="form-control" [ngClass]="{'is-invalid': submitted && f['dateFacture'].errors}">
                      <div *ngIf="submitted && f['dateFacture'].errors" class="invalid-feedback">
                        La date est requise.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h2 class="section-title">Bénéficiaire</h2>
                  <div class="form-grid">
                    <div class="form-group" style="grid-column: span 2;">
                      <label for="beneficiaire">Nom de l'Auxiliaire / Bénéficiaire</label>
                      <input type="text" id="beneficiaire" formControlName="beneficiaire" class="form-control" placeholder="Ex: Cabinet Me. Ben Youssef" [ngClass]="{'is-invalid': submitted && f['beneficiaire'].errors}">
                      <div *ngIf="submitted && f['beneficiaire'].errors" class="invalid-feedback">
                        Le bénéficiaire est requis.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h2 class="section-title">Pièces Jointes & Justificatifs</h2>
                  <div class="form-group">
                    <div class="file-upload-zone">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--bna-grey); margin-bottom: 12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <p>Glissez-déposez vos factures scannées (PDF, JPG, PNG)</p>
                      <span style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; display: block;">Taille max: 5Mo par fichier</span>
                      <input type="file" id="piecesJointes" multiple class="file-input">
                      <label for="piecesJointes" class="btn-secondary">Parcourir</label>
                    </div>
                    <p class="file-help-text">Veuillez obligatoirement attacher la copie de la facture, du reçu ou du bordereau correspondant pour permettre la Pré-validation.</p>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" routerLink="/dashboard">Annuler</button>
                  <button type="submit" class="btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner"></span>
                    Soumettre à la Pré-validation
                  </button>
                </div>
                
                <div *ngIf="error" class="alert alert-error mt-4">
                  {{ error }}
                </div>
                <div *ngIf="successMsg" class="alert alert-success mt-4">
                  {{ successMsg }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 280px;
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .form-page { padding: 40px; max-width: 900px; margin: 0 auto; }
    
    .page-header { margin-bottom: 32px; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .header-left h1 { font-size: 24px; font-weight: 600; color: var(--bna-grey); margin: 0; }
    
    .btn-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; font-size: 15px; color: var(--text-secondary); cursor: pointer; padding: 0; font-weight: 500; transition: color 0.2s; }
    .btn-back:hover { color: var(--bna-green); }
    
    .form-container { background: var(--white); border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid var(--bna-border); padding: 40px; }
    
    .form-section { margin-bottom: 40px; }
    .form-section:last-child { margin-bottom: 0; }
    
    .section-title { font-size: 16px; font-weight: 600; color: var(--bna-green); margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--bna-border); text-transform: uppercase; letter-spacing: 0.5px; }
    
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; font-weight: 500; color: var(--text-primary); }
    
    .form-control { width: 100%; box-sizing: border-box; padding: 12px 16px; border: 1.5px solid var(--bna-border); border-radius: 10px; font-size: 15px; transition: all 0.2s; font-family: inherit; background-color: #f8fafc; }
    .form-control:focus { outline: none; border-color: var(--bna-green); box-shadow: 0 0 0 3px rgba(0, 135, 102, 0.1); background-color: var(--white); }
    .form-control.is-invalid { border-color: #ef4444; }
    
    .invalid-feedback { color: #ef4444; font-size: 13px; margin-top: 4px; }
    
    .file-upload-zone { border: 2px dashed var(--bna-border); border-radius: 12px; padding: 32px; text-align: center; background: #f8fafc; transition: all 0.2s; }
    .file-upload-zone:hover { border-color: var(--bna-green); background: rgba(0, 135, 102, 0.02); }
    .file-upload-zone p { color: var(--text-primary); font-weight: 500; margin: 0 0 4px 0; }
    .file-input { display: none; }
    
    .file-help-text { font-size: 13px; color: var(--text-secondary); margin-top: 12px; font-style: italic; }

    .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--bna-border); }
    
    .btn-primary { background: var(--bna-green); color: white; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary:hover:not(:disabled) { background: var(--bna-green-dark); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .btn-secondary { background: var(--white); color: var(--text-primary); border: 1.5px solid var(--bna-border); padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #f8fafc; border-color: var(--bna-grey); }
    
    .alert { padding: 16px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-top: 24px; }
    .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; }
    
    .mt-4 { margin-top: 1rem; }

    @media (max-width: 768px) {
      .form-page { padding: 20px; }
      .form-grid { grid-template-columns: 1fr; }
      .form-container { padding: 24px; }
      .form-actions { flex-direction: column-reverse; }
      .btn-primary, .btn-secondary { width: 100%; }
      .form-group[style] { grid-column: auto !important; }
    }
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
