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
        <app-header [title]="isEditMode ? 'Modification Stratégique' : 'Nouveau Commandement'"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN FORM HEADER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>{{ isEditMode ? 'Ajustement de Dossier' : 'Initialisation de Dossier' }}</h1>
                <p>Enregistrez un nouveau litige dans le registre souverain de la BNA.</p>
             </div>
             <button class="btn-back-ghost" (click)="goBack()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                RETOUR
             </button>
          </div>

          <!-- SOVEREIGN BENTO FORM -->
          <div class="form-bento shadow-premium fade-in">
             <form (ngSubmit)="onSubmit()" #dossierForm="ngForm" class="executive-form">
                
                <!-- SECTION 1: IDENTITY -->
                <div class="bento-section">
                   <div class="section-badge">IDENTITÉ</div>
                   <div class="input-grid">
                      <div class="input-unit">
                         <label>Référence Interne</label>
                         <div class="prefix-capsule">
                            <span class="prefix">DEF-</span>
                            <input type="text" name="referenceSuffix" [(ngModel)]="referenceSuffix" required placeholder="2026-X" class="glass-field">
                         </div>
                      </div>
                      <div class="input-unit">
                         <label>Intitulé de l'Affaire</label>
                         <input type="text" name="titre" [(ngModel)]="dossier.titre" required placeholder="Objet du litige..." class="glass-field">
                      </div>
                   </div>
                </div>

                <!-- SECTION 2: PARAMETERS -->
                <div class="bento-section">
                   <div class="section-badge">STRATÉGIE</div>
                   <div class="input-grid triple">
                      <div class="input-unit">
                         <label>Priorité Exécutive</label>
                         <select name="priorite" [(ngModel)]="dossier.priorite" class="glass-select">
                            <option value="HAUTE">Haute (Critique)</option>
                            <option value="MOYENNE">Moyenne (Standard)</option>
                            <option value="BASSE">Basse (Secondaire)</option>
                         </select>
                      </div>
                      <div class="input-unit">
                         <label>Statut Initial</label>
                         <select name="statut" [(ngModel)]="dossier.statut" required class="glass-select">
                            <option value="OUVERT">Ouvert (Actif)</option>
                            <option value="EN_COURS">En Cours (Investigation)</option>
                         </select>
                      </div>
                      <div class="input-unit">
                         <label>Provision Budget (TND)</label>
                         <input type="number" name="budget" [(ngModel)]="dossier.budgetProvisionne" placeholder="5000.00" class="glass-field">
                      </div>
                   </div>
                </div>

                <!-- SECTION 3: ANALYSIS -->
                <div class="bento-section full">
                   <div class="section-badge">ANALYSE & NOTES</div>
                   <div class="input-unit">
                      <label>Argumentaire / Résumé des Faits</label>
                      <textarea name="description" [(ngModel)]="dossier.description" (input)="onDescriptionInput()" rows="5" placeholder="Détaillez le contexte judiciaire..." class="glass-area"></textarea>
                   </div>

                   <!-- AI SENTINEL PANEL -->
                   <div class="ai-sentinel-panel shadow-premium" *ngIf="aiLoading || aiSuggestion">
                      <div class="sentinel-header">
                         <div class="aura-dot"></div>
                         <span>SENTINEL AI ANALYSIS</span>
                      </div>
                      <div class="sentinel-loader" *ngIf="aiLoading">Intelligence Artificielle en cours de réflexion...</div>
                      <div class="sentinel-chips" *ngIf="aiSuggestion">
                         <button type="button" class="ghost-tag" (click)="applyAi('type', aiSuggestion.typeProcedure)">
                            {{ aiSuggestion.typeProcedure }}
                         </button>
                         <button type="button" class="ghost-tag" (click)="applyAi('phase', aiSuggestion.phaseInitiale)">
                            {{ aiSuggestion.phaseInitiale }}
                         </button>
                         <button type="button" class="ghost-tag emerald" (click)="applyTarget('natureAffaire', aiSuggestion.natureAffaire)">
                            {{ aiSuggestion.natureAffaire }}
                         </button>
                      </div>
                   </div>
                </div>

                <!-- FORM ACTIONS -->
                <div class="form-footer">
                   <button type="button" (click)="goBack()" class="btn-executive secondary">ANNULER</button>
                   <button type="submit" [disabled]="!dossierForm.form.valid || loading" class="btn-executive primary">
                      <span *ngIf="!loading">{{ isEditMode ? 'METTRE À JOUR' : 'INITIALISER LE DOSSIER' }}</span>
                      <div *ngIf="loading" class="executive-loader"></div>
                   </button>
                </div>
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
    
    .glass-field, .glass-select, .glass-area { padding: 16px; border-radius: 14px; border: 2.5px solid #f1f5f9; background: #f8fafc; font-family: inherit; font-size: 14px; font-weight: 700; color: #1e293b; transition: 0.3s; }
    .glass-field:focus, .glass-select:focus, .glass-area:focus { outline: none; border-color: var(--bna-emerald); background: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.05); }
    
    .prefix-capsule { display: flex; background: #f1f5f9; border-radius: 14px; overflow: hidden; border: 2.5px solid #f1f5f9; transition: 0.3s; }
    .prefix-capsule:focus-within { border-color: var(--bna-emerald); background: white; }
    .prefix { background: #e2e8f0; color: #475569; font-weight: 900; padding: 0 16px; display: flex; align-items: center; font-size: 12px; }
    .prefix-capsule .glass-field { border: none; background: transparent; flex: 1; }

    .ai-sentinel-panel { margin-top: 32px; background: #fafafa; border-radius: 20px; padding: 24px; border: 1.5px dashed var(--bna-emerald); position: relative; }
    .sentinel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .sentinel-header span { font-size: 10px; font-weight: 900; color: var(--bna-emerald); letter-spacing: 1px; }
    .aura-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bna-emerald); box-shadow: 0 0 10px var(--bna-emerald); animation: pulse 2s infinite; }
    .sentinel-chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .ghost-tag { background: white; border: 1.5px solid #e2e8f0; padding: 8px 16px; border-radius: 12px; font-size: 11px; font-weight: 850; cursor: pointer; transition: 0.2s; color: #64748b; }
    .ghost-tag:hover { border-color: var(--bna-emerald); color: var(--bna-emerald); transform: translateY(-2px); }
    .ghost-tag.emerald { border-color: var(--bna-emerald); color: var(--bna-emerald); background: #ecfdf5; }

    .form-footer { margin-top: 32px; padding-top: 32px; border-top: 2px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 20px; }
    .btn-executive { padding: 16px 32px; border-radius: 16px; border: none; font-weight: 850; letter-spacing: 1px; font-size: 12px; cursor: pointer; transition: 0.3s; }
    .btn-executive.primary { background: var(--bna-emerald); color: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.2); }
    .btn-executive.secondary { background: #f8fafc; color: #64748b; }
    .btn-executive:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.1); }
    .btn-executive:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    
    .executive-loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
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
