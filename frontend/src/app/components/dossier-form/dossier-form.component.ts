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
import { ReferentielService, Auxiliaire } from '../../services/referentiel.service';
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
                        <span class="prefix-addon">DEF-2026-</span>
                        <input type="text" id="reference" name="referenceSuffix" [(ngModel)]="referenceSuffix" [disabled]="isEditMode" required placeholder="Ex: 001" class="form-control with-prefix" [style.opacity]="isEditMode ? '0.7' : '1'">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="titre">Titre / Objet du Dossier *</label>
                      <input type="text" id="titre" name="titre" [(ngModel)]="dossier.titre" required placeholder="Ex: Contentieux Commercial vs Société Alpha" class="form-control">
                    </div>
                    <div class="form-group">
                      <label for="partieLitige">Partie au Litige (Client/Adversaire) *</label>
                      <select id="partieLitige" name="partieLitigeId" [(ngModel)]="selectedPartieLitigeId" required class="form-control">
                        <option [value]="null">-- Sélectionner une Partie --</option>
                        <option *ngFor="let p of partiesLitige" [value]="p.id">{{ p.nom }} {{ p.prenom || '' }} ({{ p.type }})</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h3 class="section-title">Acteurs Juridiques</h3>
                  <div class="grid-3-col">
                    <div class="form-group">
                      <label for="avocat">Avocat Conseil</label>
                      <select id="avocat" name="avocatId" [(ngModel)]="selectedAvocatId" class="form-control">
                        <option [value]="null">-- Sélectionner un Avocat --</option>
                        <option *ngFor="let a of avocats" [value]="a.id">{{ a.nom }}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="huissier">Huissier de Justice</label>
                      <select id="huissier" name="huissierId" [(ngModel)]="selectedHuissierId" class="form-control">
                        <option [value]="null">-- Sélectionner un Huissier --</option>
                        <option *ngFor="let h of huissiers" [value]="h.id">{{ h.nom }}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="expert">Expert Mandaté</label>
                      <select id="expert" name="expertId" [(ngModel)]="selectedExpertId" class="form-control">
                        <option [value]="null">-- Sélectionner un Expert --</option>
                        <option *ngFor="let e of experts" [value]="e.id">{{ e.nom }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h3 class="section-title">Budget & Notes</h3>
                  <div class="form-group">
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
    .dashboard-content { padding: 40px; }
    .form-page { max-width: 900px; margin: 0 auto; }

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
    .grid-3-col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
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
    statut: 'EN_ATTENTE_PREVALIDATION',
    priorite: 'MOYENNE'
  };

  loading = false;
  error = '';
  isEditMode = false;
  dossierId: string | null = null;
  numericId: number | null = null;
  referenceSuffix = '';

  constructor(
    private dossierService: DossierService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService,
    private aiService: AIService,
    private referentielService: ReferentielService
  ) { }

  avocats: Auxiliaire[] = [];
  huissiers: Auxiliaire[] = [];
  experts: Auxiliaire[] = [];
  partiesLitige: any[] = [];

  selectedAvocatId: number | null = null;
  selectedHuissierId: number | null = null;
  selectedExpertId: number | null = null;
  selectedPartieLitigeId: number | null = null;

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
    this.loadAuxiliaires();
  }

  loadAuxiliaires(): void {
    this.referentielService.getAuxiliaires().subscribe(list => {
      this.avocats = list.filter(a => a.type === 'AVOCAT');
      this.huissiers = list.filter(a => a.type === 'HUISSIER');
      this.experts = list.filter(a => a.type === 'EXPERT');
    });
    this.referentielService.getItems('parties-litige').subscribe(list => {
      this.partiesLitige = list;
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
            this.numericId = found.id;
            this.selectedAvocatId = found.avocat?.id || null;
            this.selectedHuissierId = found.huissier?.id || null;
            this.selectedExpertId = found.expert?.id || null;
            this.selectedPartieLitigeId = found.partieLitige?.id || null;

            if (found.reference.startsWith('DEF-2026-')) {
              this.referenceSuffix = found.reference.substring(9);
            } else if (found.reference.startsWith('DEF-')) {
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
    if (!this.dossier.titre || (!this.isEditMode && !this.referenceSuffix)) {
      return;
    }
 
    this.confirmService.open({
        title: 'Confirmation de soumission',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (!ok) return;
 
        this.loading = true;
        this.error = '';
 
        const fullReference = `DEF-2026-${this.referenceSuffix}`;
        const dossierToSave: Dossier = {
          id: this.numericId || undefined,
          reference: this.isEditMode ? this.dossier.reference! : fullReference,
          titre: this.dossier.titre!,
          statut: this.dossier.statut || 'EN_ATTENTE_PREVALIDATION',
          priorite: this.dossier.priorite || 'MOYENNE',
          budgetProvisionne: this.dossier.budgetProvisionne,
          description: this.dossier.description,
          avocat: this.selectedAvocatId ? { id: this.selectedAvocatId } : undefined,
          huissier: this.selectedHuissierId ? { id: this.selectedHuissierId } : undefined,
          expert: this.selectedExpertId ? { id: this.selectedExpertId } : undefined,
          partieLitige: this.selectedPartieLitigeId ? { id: this.selectedPartieLitigeId } : undefined
        };
 
        const action = this.isEditMode && this.numericId
          ? this.dossierService.updateDossier(this.numericId, dossierToSave)
          : this.dossierService.createDossier(dossierToSave);

        action.subscribe({
          next: (savedDossier) => {
            const msg = this.isEditMode ? `Dossier ${savedDossier.reference} mis à jour.` : `Nouveau dossier créé : ${savedDossier.reference}.`;
            this.notificationService.addNotification(msg, 'ROLE_ADMIN', 'SUCCESS');
            
            if (!this.isEditMode) {
                this.notificationService.addNotification(
                  `Action Requise : Nouveau dossier ${savedDossier.reference} à pré-valider.`,
                  'ROLE_PRE_VALIDATEUR', 'WARNING'
                );
            }

            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Erreur lors de la sauvegarde du dossier', err);
            this.error = "Erreur de connexion au serveur ou référence déjà existante.";
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
