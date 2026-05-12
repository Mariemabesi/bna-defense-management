import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dossier } from '../../models/dossier.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoice-overlay" (click)="onClose()">
      <div class="invoice-container facture-modal" (click)="$event.stopPropagation()">
        
        <div class="invoice-header">
          <div class="header-left">
            <span class="badge-status">Génération de Facture</span>
            <h2>Facture — {{ beneficiaryType | uppercase }}</h2>
          </div>
          <button class="btn-close-circle" (click)="onClose()">×</button>
        </div>

        <div class="invoice-scroll-area">
          <!-- SECTION 1: BENEFICIAIRE (AUTO) -->
          <div class="invoice-section">
            <h4 class="section-title">Informations du Bénéficiaire (Automatique)</h4>
            <div class="beneficiary-info-card">
              <div class="b-icon-large">{{ getIcon() }}</div>
              <div class="b-details">
                <h3>{{ beneficiaryData?.nom || 'Nom non renseigné' }}</h3>
                <div class="contact-row">
                  <span>📞 {{ beneficiaryData?.telephone || '—' }}</span>
                  <span>✉️ {{ beneficiaryData?.email || '—' }}</span>
                </div>
                <div class="contact-row">
                  <span>📍 {{ beneficiaryData?.adresse || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: DOSSIER (AUTO) -->
          <div class="invoice-section">
            <h4 class="section-title">Détails du Dossier</h4>
            <div class="form-grid-3">
              <div class="form-field">
                <label>Référence</label>
                <input type="text" [value]="dossier.reference" disabled>
              </div>
              <div class="form-field">
                <label>Tribunal</label>
                <input type="text" value="Tribunal de Grande Instance" disabled>
              </div>
              <div class="form-field">
                <label>Responsable</label>
                <input type="text" [value]="dossier.assignedCharge?.fullName || '—'" disabled>
              </div>
            </div>
          </div>

          <!-- SECTION 3: PAIEMENT -->
          <div class="invoice-section">
            <h4 class="section-title">Mode de Paiement</h4>
            <div class="payment-selector">
              <label class="pay-option" [class.active]="paymentMode === 'VIREMENT'">
                <input type="radio" name="pay" value="VIREMENT" [(ngModel)]="paymentMode">
                <div class="opt-content">
                  <span class="opt-title">Virement (RIB)</span>
                  <span class="opt-sub">Utiliser le RIB enregistré</span>
                </div>
              </label>
              <label class="pay-option" [class.active]="paymentMode === 'CHEQUE'">
                <input type="radio" name="pay" value="CHEQUE" [(ngModel)]="paymentMode">
                <div class="opt-content">
                  <span class="opt-title">Chèque BCT</span>
                  <span class="opt-sub">Saisie manuelle du numéro</span>
                </div>
              </label>
            </div>

            <div class="cheque-details" *ngIf="paymentMode === 'CHEQUE'">
              <div class="form-grid-2">
                <div class="form-field">
                  <label>Numéro de Chèque</label>
                  <input type="text" [(ngModel)]="chequeNumber" placeholder="Ex: 12345678">
                </div>
                <div class="form-field">
                  <label>Date du Chèque</label>
                  <input type="date" [(ngModel)]="chequeDate">
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: ATTACHMENTS -->
          <div class="invoice-section">
            <h4 class="section-title">Justificatifs</h4>
            <div class="upload-dropzone" (click)="fileInput.click()">
              <input type="file" #fileInput (change)="onFileSelected($event)" hidden multiple>
              <div class="upload-icon">📁</div>
              <p>Glissez vos fichiers ici ou cliquez pour parcourir</p>
            </div>
            
            <div class="file-list" *ngIf="uploadedFiles.length > 0">
              <div class="file-item" *ngFor="let f of uploadedFiles; let i = index">
                <span class="f-name">{{ f.name }}</span>
                <button class="btn-delete" (click)="removeFile(i)">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div class="invoice-footer">
          <button class="btn-cancel" (click)="onClose()">Annuler</button>
          <div class="footer-main-actions">
            <button class="btn-action-outline" (click)="generateInvoice()">Générer Facture</button>
            <button class="btn-action-outline" (click)="downloadPdf()">Télécharger PDF</button>
            <button class="btn-confirm" (click)="generateCheque()" *ngIf="paymentMode === 'CHEQUE'">
              Générer Chèque BCT
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .invoice-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
      animation: fadeInOverlay 0.3s ease-out;
    }
    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }

    .invoice-container {
      background: white; width: 90%; max-width: 700px; max-height: 85vh;
      border-radius: 28px; box-shadow: 0 50px 100px rgba(0, 0, 0, 0.2);
      display: flex; flex-direction: column; overflow: hidden;
      animation: slideInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    @keyframes slideInModal { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .invoice-header {
      padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
      background: #ffffff;
    }
    .header-left h2 { margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .badge-status { font-size: 10px; font-weight: 800; color: var(--bna-green); background: var(--bna-green-light); padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .btn-close-circle { 
      width: 36px; height: 36px; border-radius: 50%; border: none; 
      background: #f8fafc; color: #64748b; font-size: 20px; cursor: pointer; 
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .btn-close-circle:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

    .invoice-scroll-area { flex: 1; overflow-y: auto; padding: 32px; background: #ffffff; }

    .invoice-section { margin-bottom: 32px; }
    .section-title { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.1em; }

    .beneficiary-info-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px;
      padding: 24px; display: flex; gap: 24px; align-items: center;
      transition: all 0.3s ease;
    }
    .beneficiary-info-card:hover { border-color: var(--bna-green); background: #f0fdf4; }
    
    .b-icon-large {
      width: 70px; height: 70px; background: white; border-radius: 18px;
      display: flex; align-items: center; justify-content: center; font-size: 36px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }
    .b-details h3 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #1e293b; }
    .contact-row { display: flex; gap: 20px; font-size: 14px; font-weight: 500; color: #64748b; margin-top: 6px; }

    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; gap: 8px; }
    .form-field label { font-size: 13px; font-weight: 700; color: #475569; margin-left: 4px; }
    .form-field input { 
      padding: 14px 16px; border: 1.5px solid #e2e8f0; border-radius: 14px;
      font-size: 14px; font-weight: 600; color: #1e293b; background: #f8fafc;
      transition: all 0.2s;
    }
    .form-field input:disabled { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; cursor: not-allowed; }

    .payment-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .pay-option {
      border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px;
      cursor: pointer; display: flex; align-items: flex-start; gap: 16px; transition: 0.3s;
      background: white;
    }
    .pay-option.active { border-color: var(--bna-green); background: var(--bna-green-light); box-shadow: 0 10px 30px rgba(0, 135, 102, 0.1); }
    .pay-option input { margin-top: 5px; accent-color: var(--bna-green); width: 18px; height: 18px; }
    .opt-title { display: block; font-weight: 800; color: #1e293b; font-size: 15px; margin-bottom: 2px; }
    .opt-sub { font-size: 12px; font-weight: 500; color: #64748b; line-height: 1.4; }

    .cheque-details { background: #f1f5f9; padding: 24px; border-radius: 20px; margin-top: 12px; animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .upload-dropzone {
      border: 2px dashed #cbd5e1; background: #f8fafc; border-radius: 20px; padding: 40px 20px;
      text-align: center; cursor: pointer; transition: all 0.3s;
    }
    .upload-dropzone:hover { border-color: var(--bna-green); background: var(--bna-green-light); }
    .upload-icon { font-size: 40px; margin-bottom: 12px; }
    .upload-dropzone p { margin: 0; font-weight: 800; color: #1e293b; font-size: 15px; }
    
    .file-list { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
    .file-item { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;
      display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .f-name { font-size: 14px; font-weight: 600; color: #334155; }
    .btn-delete { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; transition: 0.2s; }
    .btn-delete:hover { color: #ef4444; background: #fee2e2; }

    .invoice-footer {
      padding: 24px 32px; border-top: 1px solid #f1f5f9; background: white;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-main-actions { display: flex; gap: 12px; }
    
    .btn-cancel { padding: 12px 24px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; }
    .btn-cancel:hover { background: #f1f5f9; color: #1e293b; }
    
    .btn-action-outline {
      padding: 12px 24px; border-radius: 14px; border: 1.5px solid var(--bna-green);
      background: white; color: var(--bna-green); font-weight: 800; cursor: pointer; transition: all 0.2s;
    }
    .btn-action-outline:hover { background: var(--bna-green); color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 135, 102, 0.2); }

    .btn-confirm { 
      padding: 12px 28px; border-radius: 14px; border: none; 
      background: #1e293b; color: white; font-weight: 800; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 10px 20px rgba(30, 41, 59, 0.2);
    }
    .btn-confirm:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 12px 25px rgba(30, 41, 59, 0.3); }
  `]
})
export class FactureFormComponent implements OnInit {
  @Input() dossier!: Dossier;
  @Input() beneficiaryType!: 'avocat' | 'huissier' | 'expert';
  @Output() close = new EventEmitter<void>();

  beneficiaryData: any;
  paymentMode: 'VIREMENT' | 'CHEQUE' = 'VIREMENT';
  chequeNumber: string = '';
  chequeDate: string = '';
  uploadedFiles: File[] = [];

  constructor() {}

  ngOnInit() {
    this.loadBeneficiaryData();
    this.chequeDate = new Date().toISOString().split('T')[0];
  }

  loadBeneficiaryData() {
    this.beneficiaryData = (this.dossier as any)[this.beneficiaryType];
    // If not directly on dossier, look in affaires
    if (!this.beneficiaryData?.nom && this.dossier.affaires?.length) {
       const aff = this.dossier.affaires.find(a => a[this.beneficiaryType]?.nom);
       if (aff) this.beneficiaryData = aff[this.beneficiaryType];
    }
  }

  getIcon() {
    if (this.beneficiaryType === 'avocat') return '⚖️';
    if (this.beneficiaryType === 'huissier') return '📜';
    return '🔍';
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  onClose() { this.close.emit(); }

  generateInvoice() { alert('Facture générée avec succès!'); }
  downloadPdf() { alert('Téléchargement du PDF en cours...'); }
  generateCheque() { alert('Chèque BCT généré: ' + this.chequeNumber); }
}
