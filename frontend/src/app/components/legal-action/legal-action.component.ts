import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalActionService, Procedure, Audience, Jugement } from '../../services/legal-action.service';
import { AffaireService } from '../../services/affaire.service';

@Component({
  selector: 'app-legal-action',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="legal-page-wrapper">
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="legal-action-container animate-fade-in">
        <header class="page-header">
          <div class="header-content">
            <div class="icon-box pulse">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <div class="title-group">
              <h1>Gestion des Actions en Justice</h1>
              <p class="subtitle">Pilotez vos dossiers juridiques avec précision et automatisation.</p>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-value">{{ procedures.length }}</span>
              <span class="stat-label">Procédures</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getValidatedCount() }}</span>
              <span class="stat-label">Validées</span>
            </div>
          </div>
        </header>

        <div class="action-grid">
          <!-- Create Section -->
          <section class="config-pane">
            <div class="glass-card form-card">
              <div class="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
                <h3>Nouvelle Procédure</h3>
              </div>
              <form (ngSubmit)="onCreateProcedure()" class="premium-form">
                <div class="input-wrapper">
                  <label>Affaire Référente</label>
                  <div class="select-container">
                    <select [(ngModel)]="newProcedure.affaireId" name="affaireId" required>
                      <option [ngValue]="null" disabled>Sélectionner une affaire...</option>
                      <option *ngFor="let a of affaires" [value]="a.id">{{ a.referenceJudiciaire }} ({{ a.type }})</option>
                    </select>
                  </div>
                </div>

                <div class="input-wrapper">
                  <label>Titre descriptif</label>
                  <input type="text" [(ngModel)]="newProcedure.titre" name="titre" placeholder="Assignation, Référé, Appel..." required>
                </div>

                <div class="row">
                  <div class="input-wrapper full">
                    <label>Type de Procédure</label>
                    <select [(ngModel)]="newProcedure.type" name="type">
                      <option value="ASSIGNATION">⚖️ Assignation</option>
                      <option value="REQUETE">📝 Requête</option>
                      <option value="APPEL">🔄 Appel</option>
                      <option value="REFERE">⚡ Référé</option>
                      <option value="CASSATION">🏛️ Cassation</option>
                      <option value="AUTRE">➕ Autre</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!newProcedure.affaireId || !newProcedure.titre">
                   <span>Démarrer l'Action</span>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </button>
              </form>
            </div>

            <div class="glass-card tip-card">
              <div class="tip-icon">💡</div>
              <p>La validation d'une procédure génère automatiquement une demande de frais d'honoraires dans le module financier.</p>
            </div>
          </section>

          <!-- List Section -->
          <section class="list-pane">
            <div class="glass-card list-card">
              <div class="card-header flex-between">
                <div class="h-text">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <h3>Suivi des Dossiers Actifs</h3>
                </div>
                <button class="refresh-btn" (click)="loadProcedures()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>

              <div class="empty-state" *ngIf="procedures.length === 0">
                <div class="empty-icon">📂</div>
                <p>Aucune procédure en cours. Initiez-en une à gauche.</p>
              </div>

              <div class="procedure-items">
                <div *ngFor="let p of procedures" class="p-row animate-slide-up" [class.is-validated]="p.statut === 'VALIDEE'">
                  <div class="p-main-info">
                    <div class="type-indicator" [ngClass]="p.type"></div>
                    <div class="txt">
                      <div class="top">
                        <span class="p-title">{{ p.titre }}</span>
                        <span class="p-stat-badge" [ngClass]="p.statut">{{ p.statut }}</span>
                      </div>
                      <div class="btm">
                        <span class="p-meta">#{{ p.id }} • {{ p.type }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="p-actions">
                    <button *ngIf="p.statut !== 'VALIDEE'" (click)="onValidate(p.id!)" class="action-btn validate">
                       Valider & Payer
                    </button>
                    <div *ngIf="p.statut === 'VALIDEE'" class="validated-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#48bb78" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Frais Émis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page-wrapper {
      position: relative;
      min-height: 100vh;
      background: #0f172a;
      overflow: hidden;
      font-family: 'Outfit', sans-serif;
    }

    .background-blobs {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      width: 500px; height: 500px;
      filter: blur(80px);
      border-radius: 50%;
      opacity: 0.15;
    }
    .blob-1 { top: -100px; right: -100px; background: #3b82f6; animation: drift 20s infinite alternate; }
    .blob-2 { bottom: -100px; left: -100px; background: #10b981; animation: drift 25s infinite alternate-reverse; }

    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to { transform: translate(100px, 50px) scale(1.1); }
    }

    .legal-action-container {
      position: relative;
      z-index: 1;
      padding: 3rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* HEADER */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3.5rem;
    }

    .header-content {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .icon-box {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      display: flex;
      align-items: center; justify-content: center;
      color: #3b82f6;
    }

    .title-group h1 {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 0.2rem 0 0;
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .header-stats {
      display: flex;
      gap: 2rem;
    }
    .stat-item {
      text-align: right;
    }
    .stat-value {
      display: block; font-size: 1.8rem; font-weight: 700; color: #10b981;
    }
    .stat-label {
      font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
    }

    /* CARDS */
    .action-grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 2rem;
      color: #3b82f6;
    }
    .card-header h3 {
      margin: 0; font-size: 1.25rem; font-weight: 600; color: white;
    }

    /* FORM */
    .premium-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .input-wrapper { display: flex; flex-direction: column; gap: 0.6rem; }
    .input-wrapper label { font-size: 0.85rem; font-weight: 500; color: #94a3b8; }
    
    input, select {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      color: white;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    input:focus, select:focus {
      outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .submit-btn {
      margin-top: 1rem;
      background: #3b82f6;
      border: none;
      border-radius: 12px;
      padding: 1rem;
      color: white;
      font-weight: 600;
      display: flex;
      align-items: center; justify-content: center;
      gap: 0.8rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .submit-btn:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
    }
    .submit-btn:disabled {
      opacity: 0.5; cursor: not-allowed; filter: grayscale(1);
    }

    .tip-card {
      margin-top: 1.5rem;
      padding: 1.2rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      font-size: 0.9rem;
      color: #94a3b8;
    }
    .tip-icon { font-size: 1.5rem; }

    /* LIST */
    .list-card { min-height: 600px; display: flex; flex-direction: column; }
    .flex-between { justify-content: space-between; }
    .h-text { display: flex; align-items: center; gap: 0.8rem; }
    
    .refresh-btn {
      background: none; border: none; color: #64748b; cursor: pointer; transition: 0.3s;
    }
    .refresh-btn:hover { color: #3b82f6; transform: rotate(180deg); }

    .procedure-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .p-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      transition: all 0.3s;
    }
    .p-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(59, 130, 246, 0.3);
      transform: translateX(5px);
    }

    .p-main-info {
      display: flex;
      gap: 1.2rem;
      align-items: center;
    }

    .type-indicator {
      width: 4px; height: 40px; border-radius: 2px;
      background: #64748b;
    }
    .type-indicator.ASSIGNATION { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
    .type-indicator.REFERE { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
    .type-indicator.APPEL { background: #8b5cf6; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }

    .p-title {
      font-size: 1.1rem; font-weight: 600; color: white; display: block; margin-bottom: 0.2rem;
    }
    .p-meta { font-size: 0.85rem; color: #64748b; }

    .p-stat-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-left: 0.8rem;
    }
    .p-stat-badge.VALIDEE { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .p-stat-badge.EN_COURS { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

    .action-btn.validate {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn.validate:hover {
      background: #10b981; color: white;
    }

    .validated-label {
      display: flex; align-items: center; gap: 0.6rem; color: #10b981; font-weight: 600; font-size: 0.9rem;
    }

    .empty-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #64748b; opacity: 0.6;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }

    /* ANIMATIONS */
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    .animate-slide-up { animation: slideUp 0.5s ease-out both; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .pulse { animation: flex-pulse 2s infinite; }
    @keyframes flex-pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
  `]
})
export class LegalActionComponent implements OnInit {
  procedures: Procedure[] = [];
  affaires: any[] = [];
  newProcedure: any = {
    titre: '',
    type: 'ASSIGNATION',
    statut: 'EN_COURS',
    affaireId: null
  };

  constructor(
    private legalActionService: LegalActionService,
    private affaireService: AffaireService
  ) { }

  ngOnInit(): void {
    this.loadProcedures();
    this.loadAffaires();
  }

  loadProcedures() {
    this.legalActionService.getAllProcedures().subscribe(data => this.procedures = data);
  }

  loadAffaires() {
    this.affaireService.getAllAffaires().subscribe(data => this.affaires = data);
  }

  getValidatedCount(): number {
    return this.procedures.filter(p => p.statut === 'VALIDEE').length;
  }

  onCreateProcedure() {
    if (!this.newProcedure.affaireId) return;
    this.legalActionService.createProcedure(this.newProcedure).subscribe({
      next: () => {
        this.loadProcedures();
        this.newProcedure = { titre: '', type: 'ASSIGNATION', statut: 'EN_COURS', affaireId: null };
      }
    });
  }

  onValidate(id: number) {
    this.legalActionService.validateProcedure(id).subscribe(() => this.loadProcedures());
  }
}

