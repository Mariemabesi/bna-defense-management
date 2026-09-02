import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dossier } from '../../models/dossier.model';
import { AuthService } from '../../services/auth.service';
import { FactureFormComponent } from './facture-form.component';

@Component({
  selector: 'app-frais-finalisation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FactureFormComponent],
  template: `
    <div class="invoice-overlay" (click)="onClose()">
      <div class="invoice-container" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="invoice-header">
          <div class="header-left">
            <span class="badge-status" [ngClass]="dossier.financialStatut">{{ getStatutLabel() }}</span>
            <h2>Workflow Financier (v1.2) / Financial Finalization</h2>
          </div>
          <button class="btn-close-circle" (click)="onClose()">×</button>
        </div>

        <div class="invoice-scroll-area">
          
          <!-- REJECTION MESSAGE -->
          <div class="rejection-banner" *ngIf="dossier.motifRefusFinancier">
             <div class="r-icon">⚠️</div>
             <div class="r-content">
               <strong>Dernier Rejet :</strong> {{ dossier.motifRefusFinancier }}
             </div>
          </div>

          <!-- SECTION 1: BENEFICIAIRES -->
          <div class="invoice-section">
            <h4 class="section-title">Sélection du Bénéficiaire (Automatique)</h4>
            <div class="beneficiary-grid">
              <div class="beneficiary-card clickable" 
                   [class.active]="activeBeneficiary === 'avocat'"
                   (click)="onSelectBeneficiary('avocat')">
                <div class="b-icon">⚖️</div>
                <div class="b-info">
                  <span class="b-role">Avocat</span>
                  <span class="b-name">{{ getBeneficiaryName('avocat') }}</span>
                  <span class="b-action-hint">Générer Facture →</span>
                </div>
              </div>
              <div class="beneficiary-card clickable" 
                   [class.active]="activeBeneficiary === 'huissier'"
                   (click)="onSelectBeneficiary('huissier')">
                <div class="b-icon">📜</div>
                <div class="b-info">
                  <span class="b-role">Huissier</span>
                  <span class="b-name">{{ getBeneficiaryName('huissier') }}</span>
                  <span class="b-action-hint">Générer Facture →</span>
                </div>
              </div>
              <div class="beneficiary-card clickable" 
                   [class.active]="activeBeneficiary === 'expert'"
                   (click)="onSelectBeneficiary('expert')">
                <div class="b-icon">🔍</div>
                <div class="b-info">
                  <span class="b-role">Expert</span>
                  <span class="b-name">{{ getBeneficiaryName('expert') }}</span>
                  <span class="b-action-hint">Générer Facture →</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: DOSSIER INFO -->
          <div class="invoice-section">
            <h4 class="section-title">Informations sur le Dossier (Auto-rempli)</h4>
            <div class="form-grid-3">
              <div class="form-field">
                <label>Référence du Dossier</label>
                <input type="text" [value]="dossier.reference" disabled>
              </div>
              <div class="form-field">
                <label>Tribunal / Instance</label>
                <input type="text" value="Tribunal de Grande Instance" disabled>
              </div>
              <div class="form-field">
                <label>Statut Actuel</label>
                <input type="text" [value]="dossier.statut" disabled>
              </div>
            </div>
          </div>

          <!-- SECTION 3: DEPENSES HT -->
          <div class="invoice-section">
            <h4 class="section-title">Section des Dépenses (HT)</h4>
            <div class="form-grid-3">
              <div class="form-field">
                <label>Honoraires Avocat</label>
                <div class="input-with-symbol">
                  <input type="number" [(ngModel)]="form.honorairesAvocatFinal" (input)="calculate()" [disabled]="!canEdit()">
                  <span class="symbol">TND</span>
                </div>
              </div>
              <div class="form-field">
                <label>Frais Huissier</label>
                <div class="input-with-symbol">
                  <input type="number" [(ngModel)]="form.fraisHuissierFinal" (input)="calculate()" [disabled]="!canEdit()">
                  <span class="symbol">TND</span>
                </div>
              </div>
              <div class="form-field">
                <label>Autres frais</label>
                <div class="input-with-symbol">
                  <input type="number" [(ngModel)]="form.autresFraisFinal" (input)="calculate()" [disabled]="!canEdit()">
                  <span class="symbol">TND</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: CALCUL -->
          <div class="invoice-section">
            <h4 class="section-title">Calcul Financier</h4>
            <div class="calculation-row">
              <div class="calc-box">
                <span class="calc-label">Total HT</span>
                <span class="calc-value">{{ totalHt | number:'1.2-2' }} TND</span>
              </div>
              <div class="calc-box">
                <span class="calc-label">TVA (19%)</span>
                <span class="calc-value">{{ tvaAmount | number:'1.2-2' }} TND</span>
              </div>
              <div class="calc-box highlight">
                <span class="calc-label">Total TTC</span>
                <span class="calc-value">{{ currentTotal | number:'1.2-2' }} TND</span>
              </div>
            </div>
          </div>

          <!-- SECTION 5: ATTACHMENTS (Only for submission) -->
          <div class="invoice-section" *ngIf="canEdit()">
            <h4 class="section-title">Pièces Jointes</h4>
            <div class="upload-dropzone" (click)="fileInput.click()">
              <input type="file" #fileInput (change)="onFileSelected($event)" hidden>
              <div class="upload-icon">📤</div>
              <p>Cliquez pour parcourir ou glissez-déposez</p>
              <span class="upload-sub">PDF, Image (max 10 MB)</span>
            </div>
            
            <div class="file-list" *ngIf="form.pieceJointe">
              <div class="file-item">
                <div class="f-icon">📄</div>
                <div class="f-name">{{ form.pieceJointe }}</div>
                <button class="btn-delete" (click)="form.pieceJointe = ''">🗑️</button>
              </div>
            </div>
          </div>

          <!-- SECTION 6: COMMENTAIRE (For validation/rejection) -->
          <div class="invoice-section" *ngIf="!canEdit()">
            <h4 class="section-title">Observations / Commentaires</h4>
            <textarea class="comment-area" [(ngModel)]="commentaire" placeholder="Ajouter un commentaire ici..."></textarea>
          </div>

        </div>

        <app-facture-form
          *ngIf="showFacture"
          [dossier]="dossier"
          [beneficiaryType]="activeBeneficiary"
          (close)="showFacture = false">
        </app-facture-form>

        <!-- FOOTER ACTIONS -->
        <div class="invoice-footer">
          <button class="btn-cancel" (click)="onClose()">Fermer</button>
          
          <div class="footer-main-actions">
            <!-- Case 1: Chargé submits -->
            <ng-container *ngIf="canEdit()">
              <button class="btn-confirm" (click)="onAction('SUBMIT')" [disabled]="currentTotal <= 0">
                 Soumettre pour Prévalidation
              </button>
            </ng-container>

            <!-- Case 2: Pre-validateur approves/rejects -->
            <ng-container *ngIf="canPreValidate()">
              <button class="btn-reject" (click)="onAction('REJECT_PRE')">Rejeter</button>
              <button class="btn-confirm" (click)="onAction('APPROVE_PRE')">Pré-valider</button>
            </ng-container>

            <!-- Case 3: Validator approves/rejects -->
            <ng-container *ngIf="canValidate()">
              <button class="btn-reject" (click)="onAction('REJECT_FINAL')">Rejeter Définitivement</button>
              <button class="btn-confirm" (click)="onAction('APPROVE_FINAL')">Valider Définitivement</button>
            </ng-container>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .invoice-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; z-index: 1500;
    }
    .invoice-container {
      background: #ffffff; width: 95%; max-width: 900px; height: 90vh;
      border-radius: 32px; box-shadow: 0 50px 100px rgba(0,0,0,0.25);
      display: flex; flex-direction: column; overflow: hidden;
      animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    @keyframes modalFadeIn { from { transform: scale(0.95) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

    .invoice-header {
      padding: 32px 48px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
      background: white;
    }
    .header-left h2 { margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .badge-status { 
      font-size: 11px; font-weight: 800; color: #64748b; background: #f1f5f9; 
      padding: 6px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .badge-status.EN_ATTENTE_PREVALIDATION { background: #fff7ed; color: #c2410c; }
    .badge-status.PRE_VALIDE { background: #eff6ff; color: #1d4ed8; }
    .badge-status.REJETE_PAR_PREVALIDATION { background: #fef2f2; color: #b91c1c; }
    .badge-status.VALIDE { background: #f0fdf4; color: #15803d; }
    
    .btn-close-circle { 
      width: 40px; height: 40px; border-radius: 50%; border: none; 
      background: #f8fafc; color: #64748b; font-size: 24px; cursor: pointer; 
      display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .btn-close-circle:hover { background: #fee2e2; color: #ef4444; transform: scale(1.1); }

    .invoice-scroll-area { flex: 1; overflow-y: auto; padding: 40px 48px; background: #ffffff; }

    .rejection-banner { 
      background: #fef2f2; border: 1px solid #fee2e2; border-radius: 20px; 
      padding: 20px 24px; margin-bottom: 40px; display: flex; gap: 20px; align-items: center;
      color: #991b1b; font-size: 15px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
    }
    .r-icon { font-size: 28px; }

    .invoice-section { margin-bottom: 48px; }
    .section-title { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.1em; }

    .beneficiary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .beneficiary-card { 
      background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 24px; padding: 24px;
      display: flex; align-items: center; gap: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .beneficiary-card.active { border-color: var(--bna-green); background: var(--bna-green-light); box-shadow: 0 10px 25px rgba(0, 135, 102, 0.1); }
    .beneficiary-card.active::after {
      content: '✓'; position: absolute; top: 12px; right: 12px;
      width: 20px; height: 20px; background: var(--bna-green); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;
    }
    .beneficiary-card.clickable { cursor: pointer; }
    .beneficiary-card.clickable:hover { border-color: var(--bna-green); transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
    
    .b-action-hint { font-size: 11px; font-weight: 800; color: var(--bna-green); margin-top: 6px; text-transform: uppercase; }

    .b-icon { font-size: 28px; width: 56px; height: 56px; background: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .b-info { display: flex; flex-direction: column; }
    .b-role { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
    .b-name { font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: -0.01em; }

    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
    .form-field { display: flex; flex-direction: column; gap: 10px; }
    .form-field label { font-size: 13px; font-weight: 700; color: #475569; margin-left: 4px; }
    .form-field input { 
      padding: 16px 20px; border: 1.5px solid #e2e8f0; border-radius: 16px;
      font-size: 15px; font-weight: 600; color: #1e293b; background: #f8fafc;
      transition: all 0.2s;
    }
    .form-field input:focus { outline: none; border-color: var(--bna-green); box-shadow: 0 0 0 5px rgba(0, 135, 102, 0.1); background: white; }
    .form-field input:disabled { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; cursor: not-allowed; }

    .input-with-symbol { position: relative; display: flex; align-items: center; }
    .input-with-symbol input { width: 100%; padding-right: 55px; }
    .symbol { position: absolute; right: 16px; font-size: 11px; font-weight: 800; color: #94a3b8; }

    .calculation-row { 
      display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 20px;
    }
    .calc-box { 
      background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; gap: 6px; transition: 0.3s;
    }
    .calc-box:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .calc-box.highlight { background: #1e293b; border-color: #1e293b; box-shadow: 0 20px 40px rgba(30, 41, 59, 0.2); }
    .calc-box.highlight .calc-label { color: #94a3b8; }
    .calc-box.highlight .calc-value { color: white; font-size: 26px; }
    
    .calc-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .calc-value { font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.02em; }

    .upload-dropzone {
      border: 2px dashed #cbd5e1; background: #f8fafc; border-radius: 24px; padding: 48px;
      text-align: center; cursor: pointer; transition: 0.3s;
    }
    .upload-dropzone:hover { border-color: var(--bna-green); background: var(--bna-green-light); }
    .upload-icon { font-size: 40px; margin-bottom: 16px; }
    .upload-dropzone p { margin: 0; font-weight: 800; color: #1e293b; font-size: 16px; }
    .upload-sub { font-size: 13px; font-weight: 500; color: #64748b; margin-top: 4px; display: block; }

    .comment-area {
      width: 100%; min-height: 120px; padding: 20px; border-radius: 20px; border: 1.5px solid #e2e8f0;
      font-size: 15px; font-weight: 500; color: #1e293b; background: #f8fafc; resize: vertical; outline: none; transition: 0.2s;
    }
    .comment-area:focus { border-color: var(--bna-green); background: white; box-shadow: 0 0 0 5px rgba(0, 135, 102, 0.1); }

    .invoice-footer {
      padding: 32px 48px; border-top: 1px solid #f1f5f9; background: white;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-main-actions { display: flex; gap: 16px; }
    
    .btn-cancel { padding: 14px 28px; border-radius: 16px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; }
    .btn-cancel:hover { background: #f1f5f9; color: #1e293b; }
    
    .btn-confirm { 
      padding: 14px 36px; border-radius: 16px; border: none; 
      background: var(--bna-green); color: white; font-weight: 800; cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 135, 102, 0.3); transition: all 0.3s;
    }
    .btn-confirm:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0, 135, 102, 0.4); }
    .btn-confirm:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; transform: none; }
    
    .btn-reject { 
      padding: 14px 28px; border-radius: 16px; border: 1.5px solid #ef4444; 
      background: white; color: #ef4444; font-weight: 800; cursor: pointer; transition: 0.2s;
    }
    .btn-reject:hover { background: #fef2f2; }
  `]
})
export class FraisFinalisationFormComponent implements OnInit {
  @Input() dossier!: Dossier;
  @Input() initialBeneficiary?: 'avocat' | 'huissier' | 'expert';
  @Output() close = new EventEmitter<void>();
  @Output() workflowAction = new EventEmitter<any>();

  form: any = {
    honorairesAvocatFinal: 0,
    fraisHuissierFinal: 0,
    autresFraisFinal: 0,
    pieceJointe: '',
    observation: ''
  };

  commentaire: string = '';
  activeBeneficiary: 'avocat' | 'huissier' | 'expert' = 'avocat';
  showFacture = false;
  initialTtc = 0;
  totalHt = 0;
  tvaAmount = 0;
  currentTotal = 0;
  ecart = 0;
  Math = Math;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.initialTtc = (this.dossier.fraisInitial || this.dossier.budgetProvisionne || 0) * 1.19;
    
    // Fill with existing values if any
    this.form.honorairesAvocatFinal = this.dossier.honorairesAvocatFinal || 0;
    this.form.fraisHuissierFinal = this.dossier.fraisHuissierFinal || 0;
    this.form.autresFraisFinal = this.dossier.autresFraisFinal || 0;
    
    this.calculate();

    if (this.initialBeneficiary) {
      this.activeBeneficiary = this.initialBeneficiary;
      this.showFacture = true;
    }
  }

  getStatutLabel(): string {
    const s = this.dossier.financialStatut;
    if (!s || s === 'NONE') return 'Prêt pour Finalisation';
    if (s === 'EN_ATTENTE_PREVALIDATION') return 'En attente de prévalidation';
    if (s === 'PRE_VALIDE') return 'Prévalidé';
    if (s === 'REJETE_PAR_PREVALIDATION') return 'Rejeté par prévalidation';
    if (s === 'VALIDE') return 'Validé';
    if (s === 'REJETE') return 'Rejeté';
    return s;
  }

  isValide(): boolean {
    const s = this.dossier.financialStatut;
    if (!s) return false;
    // Handle both string and object enum representations
    const statusStr = s ? (typeof s === 'string' ? s : (s as any).name || String(s)) : '';
    return statusStr.toUpperCase().includes('VALIDE');
  }

  onSelectBeneficiary(type: 'avocat' | 'huissier' | 'expert') {
    console.log("Card clicked:", type, "Current Status:", this.dossier.financialStatut);
    this.activeBeneficiary = type;
    this.showFacture = true;
  }

  canEdit(): boolean {
    const s = this.dossier.financialStatut;
    return this.authService.hasRole('ROLE_CHARGE_DOSSIER') && 
           (!s || s === 'NONE' || s === 'REJETE_PAR_PREVALIDATION' || s === 'REJETE');
  }

  canPreValidate(): boolean {
    return this.authService.hasRole('ROLE_PRE_VALIDATEUR') && 
           this.dossier.financialStatut === 'EN_ATTENTE_PREVALIDATION';
  }

  canValidate(): boolean {
    return this.authService.hasRole('ROLE_VALIDATEUR') && 
           this.dossier.financialStatut === 'PRE_VALIDE';
  }

  getBeneficiaryName(type: 'avocat' | 'huissier' | 'expert'): string {
    const ben = (this.dossier as any)[type];
    if (ben?.nom) return ben.nom;
    if (this.dossier.affaires && this.dossier.affaires.length > 0) {
      const affaireWithAux = this.dossier.affaires.find(a => a[type]?.nom);
      if (affaireWithAux) return (affaireWithAux as any)[type].nom;
    }
    return 'Non assigné';
  }

  calculate() {
    this.totalHt = (this.form.honorairesAvocatFinal || 0) + 
                    (this.form.fraisHuissierFinal || 0) + 
                    (this.form.autresFraisFinal || 0);
    
    this.tvaAmount = this.totalHt * 0.19;
    this.currentTotal = this.totalHt + this.tvaAmount;
    this.ecart = this.currentTotal - this.initialTtc;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.pieceJointe = file.name;
    }
  }

  onClose() { this.close.emit(); }

  onAction(type: string) {
    this.workflowAction.emit({
      type,
      form: this.form,
      commentaire: this.commentaire
    });
  }
}
