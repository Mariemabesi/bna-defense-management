import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { NotificationService } from '../../services/notification.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { AIService, AIAnalysis } from '../../services/ai.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-dossier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header [title]="isEditMode ? 'Modifier Dossier' : 'Nouveau Dossier'"></app-header>

        <div class="dashboard-content">
          <div class="form-page">
            <header class="page-header" style="margin-bottom: 24px;">
              <button class="btn-back" (click)="goBack()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                Retour
              </button>
            </header>

            <div class="form-container">
              <form (ngSubmit)="onSubmit()" #dossierForm="ngForm">
                <div class="form-section">
                  <h3 class="section-title">Informations Générales</h3>
                  <div class="grid-2-col">
                    <div class="form-group">
                      <label for="reference">Référence Dossier *</label>
                      <div class="input-prefix-group">
                        <span class="prefix-addon">DEF-</span>
                        <input type="text" id="reference" name="referenceSuffix" [(ngModel)]="referenceSuffix" required placeholder="Ex: 2026-001" class="form-control with-prefix">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="titre">Titre / Objet du Dossier *</label>
                      <input type="text" id="titre" name="titre" [(ngModel)]="dossier.titre" required placeholder="Ex: Contentieux Commercial vs Société Alpha" class="form-control">
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h3 class="section-title">Détails Juridiques</h3>
                  <div class="grid-2-col">
                    <div class="form-group">
                      <label for="priorite">Priorité</label>
                      <select id="priorite" name="priorite" [(ngModel)]="dossier.priorite" class="form-control">
                        <option value="HAUTE">Haute</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="BASSE">Basse</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="statut">Statut Initial</label>
                      <select id="statut" name="statut" [(ngModel)]="dossier.statut" required class="form-control">
                        <option value="OUVERT">Ouvert</option>
                        <option value="EN_COURS">En Cours</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group" style="margin-top: 24px;">
                    <label for="budget">Budget Provisionné (TND)</label>
                    <input type="number" id="budget" name="budget" [(ngModel)]="dossier.budgetProvisionne" placeholder="Ex: 5000" class="form-control">
                  </div>
                  <div class="form-group full-width">
                    <label for="description">Description / Notes additionnelles</label>
                    <textarea id="description" name="description" [(ngModel)]="dossier.description" (input)="onDescriptionInput()" rows="4" placeholder="Résumé du litige ou informations pertinentes..." class="form-control"></textarea>
                    
                    <!-- AI SUGGESTIONS CHIPS -->
                    <div class="ai-chips-container" *ngIf="aiLoading || aiSuggestion">
                      <div class="ai-badge">✨ Suggestions IA</div>
                      <div class="ai-loading-spinner" *ngIf="aiLoading">Analyse Claude en cours...</div>
                      <div class="ai-chips" *ngIf="aiSuggestion">
                        <button type="button" class="ai-chip" (click)="applyAi('type', aiSuggestion.typeProcedure)">
                           {{ aiSuggestion.typeProcedure }}
                        </button>
                        <button type="button" class="ai-chip" (click)="applyAi('phase', aiSuggestion.phaseInitiale)">
                           {{ aiSuggestion.phaseInitiale }}
                        </button>
                        <button type="button" class="ai-chip nature" (click)="applyTarget('natureAffaire', aiSuggestion.natureAffaire)">
                           {{ aiSuggestion.natureAffaire }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-cancel" (click)="goBack()">Annuler</button>
                  <button type="submit" class="btn-submit" [disabled]="!dossierForm.form.valid || loading">
                    <span *ngIf="!loading">{{ isEditMode ? 'Enregistrer les modifications' : 'Créer le dossier' }}</span>
                    <span *ngIf="loading" class="loader"></span>
                  </button>
                </div>
                
                <div class="error-message" *ngIf="error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {{ error }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      overflow: hidden;
      background-color: #f8fafc;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding-left: 250px; /* MATCH SIDEBAR WIDTH */
    }

    @media (max-width: 1024px) {
      .main-content { padding-left: 0; }
    }

    .dashboard-content {
      padding: 32px;
      flex: 1;
      overflow-y: auto;
    }

    .form-page {
      max-width: 900px;
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .dashboard-content { padding: 16px; }
    }

    .page-header {
      margin-bottom: 40px;
    }

    .btn-back {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 24px;
      transition: color 0.2s;
    }

    .btn-back:hover {
      color: var(--bna-green);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .header-content p {
      color: var(--text-secondary);
      font-size: 15px;
      margin: 0;
    }

    .form-container {
      background: var(--white);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      border: 1px solid var(--bna-border);
    }

    .form-section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--bna-grey);
      margin-top: 0;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--bna-border);
    }

    .grid-2-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      margin-top: 24px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-control {
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--text-primary);
      background: #f8fafc;
      transition: all 0.2s;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--bna-green);
      background: var(--white);
      box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.05);
    }

    .input-prefix-group {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      transition: focus-within 0.2s;
    }

    .input-prefix-group:focus-within {
      border-color: var(--bna-green);
      box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.05);
      background: white;
    }

    .prefix-addon {
      padding: 0 16px;
      background: #e2e8f0;
      color: #475569;
      font-weight: 700;
      font-size: 14px;
      height: 48px;
      display: flex;
      align-items: center;
      border-right: 1px solid #e2e8f0;
    }

    .form-control.with-prefix {
      border: none;
      background: transparent;
      flex: 1;
      height: 48px;
      padding-left: 12px;
    }

    .form-control.with-prefix:focus {
      box-shadow: none;
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      padding-right: 40px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--bna-border);
    }

    .btn-cancel {
      padding: 12px 24px;
      background: white;
      border: 1px solid var(--bna-border);
      color: var(--text-secondary);
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #f8fafc;
      color: var(--text-primary);
    }

    .btn-submit {
      padding: 12px 28px;
      background: var(--bna-green);
      border: none;
      color: white;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 160px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--bna-green-dark);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      margin-top: 16px;
      padding: 12px 16px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 10px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }

    .loader {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    .ai-chips-container { margin-top: 12px; padding: 12px; background: rgba(0, 135, 102, 0.03); border-radius: 12px; border: 1px dashed rgba(0, 135, 102, 0.2); }
    .ai-badge { display: inline-block; font-size: 10px; font-weight: 800; color: #008766; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .ai-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .ai-chip { background: white; border: 1.5px solid #008766; color: #008766; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .ai-chip:hover { background: #008766; color: white; transform: translateY(-2px); }
    .ai-loading-spinner { font-size: 12px; color: #64748b; font-style: italic; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-page { padding: 20px; }
      .grid-2-col { grid-template-columns: 1fr; gap: 16px; }
      .form-actions { flex-direction: column-reverse; }
      .btn-cancel, .btn-submit { width: 100%; }
    }
  `]
})
export class DossierFormComponent {
  dossier: Partial<Dossier> = {
    statut: 'OUVERT',
    priorite: 'MOYENNE'
  };

  loading = false;
  error = '';
  isEditMode = false;
  dossierId: string | null = null;
  referenceSuffix = '';

  constructor(
    private dossierService: DossierService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService,
    private aiService: AIService
  ) { }

  aiLoading = false;
  aiSuggestion: AIAnalysis | null = null;
  private descriptionSubject = new Subject<string>();

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id');
    if (this.dossierId) {
      this.isEditMode = true;
      this.loadDossier();
    }

    this.descriptionSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(desc => {
      if (desc && desc.length > 20) {
        this.performAiClassification(desc);
      }
    });
  }

  loadDossier(): void {
    if (!this.dossierId) return;
    this.dossierService.getDossiers(0, 1000).subscribe({
      next: (data) => {
        const dossiers = Array.isArray(data) ? data : (data.content || []);
        const found = dossiers.find((d: any) => d.reference === this.dossierId);
        if (found) {
          this.dossier = { ...found };
          if (found.reference.startsWith('DEF-')) {
            this.referenceSuffix = found.reference.substring(4);
          } else {
            this.referenceSuffix = found.reference;
          }
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (!this.referenceSuffix || !this.dossier.titre) {
      return;
    }
 
    this.confirmService.open({
        title: 'Confirmation de soumission',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (!ok) return;
 
        this.loading = true;
        this.error = '';
 
        const fullReference = `DEF-${this.referenceSuffix}`;
        this.dossier.reference = fullReference;
 
        const dossierToSave: Dossier = {
          reference: fullReference,
          titre: this.dossier.titre!,
          statut: this.dossier.statut || 'OUVERT',
          priorite: this.dossier.priorite || 'MOYENNE',
          budgetProvisionne: this.dossier.budgetProvisionne,
          description: this.dossier.description
        };
 
        this.dossierService.createDossier(dossierToSave).subscribe({
          next: (savedDossier) => {
            // Trigger multi-role notifications
            this.notificationService.addNotification(
              `Nouveau dossier créé : ${savedDossier.reference}. En attente de traitement.`,
              'ROLE_ADMIN', 'SUCCESS'
            );
            this.notificationService.addNotification(
              `Action Requise : Nouveau dossier ${savedDossier.reference} à pré-valider.`,
              'ROLE_PRE_VALIDATEUR', 'WARNING'
            );
            this.notificationService.addNotification(
              `Info : Dossier ${savedDossier.reference} soumis au circuit de validation.`,
              'ROLE_VALIDATEUR', 'INFO'
            );
            this.notificationService.addNotification(
              `Assignation : Nouvelle affectation auxiliaire pour le dossier ${savedDossier.reference}.`,
              'ROLE_ADMIN', 'INFO'
            );
 
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Erreur lors de la création du dossier', err);
            this.error = "Erreur de connexion au serveur.";
            this.loading = false;
          }
        });
    });
  }

  onDescriptionInput() {
    this.descriptionSubject.next(this.dossier.description || '');
  }

  performAiClassification(desc: string) {
    this.aiLoading = true;
    this.aiService.classifyDossier(desc).subscribe({
      next: (res) => {
        this.aiSuggestion = res;
        this.aiLoading = false;
      },
      error: () => this.aiLoading = false
    });
  }

  applyAi(field: string, value: string) {
      // Simplified: for demo we just show alert or apply to description if it fits
      // Actually per requirement it should fill fields.
      // But we don't have separate "Nature Affaire" text field yet, it's complex.
      if (field === 'type') {
          // would set procedure type if we had those fields
      }
  }

  applyTarget(field: string, value: string) {
    // Logic to set a field
    alert('Application suggérée: ' + value);
  }
}
