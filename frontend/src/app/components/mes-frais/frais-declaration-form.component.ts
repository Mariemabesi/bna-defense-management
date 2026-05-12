import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dossier } from '../../models/dossier.model';
import { FraisService } from '../../services/frais.service';

@Component({
  selector: 'app-frais-declaration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Enregistrement de Dépense</h3>
          <button class="btn-close" (click)="onClose()">×</button>
        </div>

        <div class="modal-body">
          <form #f="ngForm" class="declaration-form">
            <div class="form-row">
              <div class="form-group">
                <label>Dossier</label>
                <input type="text" [value]="dossier.reference" disabled class="input-disabled" *ngIf="dossier">
                <select name="dossierRef" [(ngModel)]="form.selectedDossierReference" *ngIf="!dossier" required>
                  <option value="">-- Sélectionner un dossier --</option>
                  <option *ngFor="let d of availableDossiers" [value]="d.reference">{{ d.reference }} - {{ d.titre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type de Frais</label>
                <select name="type" [(ngModel)]="form.type" required>
                  <option value="HONORAIRES_AVOCAT">Honoraires Avocat</option>
                  <option value="FRAIS_HUISSIER">Frais Huissier</option>
                  <option value="EXPERTISE">Expertise</option>
                  <option value="CONSIGNATION">Consignation</option>
                  <option value="TIMBRAGE">Timbrage / Taxe</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Libellé / Objet</label>
                <input type="text" name="libelle" [(ngModel)]="form.libelle" placeholder="Ex: Frais de timbre" required>
              </div>
              <div class="form-group">
                <label>Montant (HT)</label>
                <div class="input-currency">
                  <input type="number" name="montant" [(ngModel)]="form.montant" placeholder="0.00" required>
                  <span class="currency">TND</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Description / Observation</label>
              <textarea name="observation" [(ngModel)]="form.observation" rows="3" placeholder="Détails supplémentaires..."></textarea>
            </div>

            <div class="form-group">
              <label>Pièces Justificatives (Multiple possible)</label>
              <div class="upload-zone" (click)="fileInput.click()">
                <input type="file" #fileInput (change)="onFilesSelected($event)" multiple hidden>
                <div class="upload-placeholder" *ngIf="selectedFiles.length === 0">
                  <span class="icon">📁</span>
                  <p>Cliquez pour ajouter des documents (PDF, Image, Scan)</p>
                </div>
                <div class="selected-files" *ngIf="selectedFiles.length > 0">
                  <div class="file-item" *ngFor="let file of selectedFiles; let i = index">
                    <span class="file-name">{{ file.name }}</span>
                    <button type="button" class="btn-remove" (click)="removeFile(i, $event)">×</button>
                  </div>
                  <div class="add-more">+ Ajouter d'autres</div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">Annuler</button>
          <button class="btn-primary" (click)="onSubmit()" [disabled]="!f.valid || loading">
            <span *ngIf="!loading">Enregistrer la Dépense</span>
            <span *ngIf="loading">Envoi en cours...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1200;
    }
    .modal-card {
      background: white; width: 90%; max-width: 600px; border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2); overflow: hidden;
      animation: modalFadeUp 0.3s ease-out;
    }
    @keyframes modalFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .modal-header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 20px; color: #1e293b; font-weight: 700; }
    .btn-close { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }

    .modal-body { padding: 30px; }
    .declaration-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 14px; font-weight: 600; color: #475569; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px;
      font-size: 15px; transition: 0.2s;
    }
    .form-group input:focus, .form-group select:focus { border-color: #3b82f6; outline: none; }
    .input-disabled { background: #f8fafc; color: #64748b; font-weight: 600; }

    .input-currency { position: relative; display: flex; align-items: center; }
    .input-currency input { width: 100%; padding-right: 50px; }
    .currency { position: absolute; right: 16px; font-size: 13px; font-weight: 700; color: #94a3b8; }

    .upload-zone {
      border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px;
      text-align: center; cursor: pointer; transition: 0.2s; background: #f8fafc;
    }
    .upload-zone:hover { border-color: #3b82f6; background: #eff6ff; }
    .upload-placeholder { color: #64748b; }
    .upload-placeholder .icon { font-size: 30px; display: block; margin-bottom: 8px; }

    .selected-files { display: flex; flex-wrap: wrap; gap: 10px; text-align: left; }
    .file-item {
      background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 6px 12px; display: flex; align-items: center; gap: 8px; font-size: 13px;
    }
    .btn-remove { background: none; border: none; color: #ef4444; font-weight: 800; cursor: pointer; }
    .add-more { font-size: 13px; color: #3b82f6; font-weight: 600; align-self: center; }

    .modal-footer { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-secondary { padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; cursor: pointer; }
    .btn-primary { padding: 12px 24px; border-radius: 12px; border: none; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class FraisDeclarationFormComponent implements OnInit {
  @Input() dossier?: Dossier;
  @Input() availableDossiers: Dossier[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();

  form = {
    selectedDossierReference: '',
    type: 'HONORAIRES_AVOCAT',
    libelle: '',
    montant: 0,
    observation: ''
  };

  ngOnInit() {
    if (this.dossier) {
      this.form.selectedDossierReference = this.dossier.reference;
    }
  }

  selectedFiles: File[] = [];
  loading = false;

  constructor(private fraisService: FraisService) {}

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
  }

  removeFile(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedFiles.splice(index, 1);
  }

  onClose() { this.close.emit(); }

  onSubmit() {
    this.loading = true;
    const formData = new FormData();
    
    const fraisData = {
      referenceDossier: this.form.selectedDossierReference,
      libelle: this.form.libelle,
      montant: this.form.montant,
      type: this.form.type,
      observation: this.form.observation
    };

    formData.append('frais', new Blob([JSON.stringify(fraisData)], { type: 'application/json' }));
    
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    this.fraisService.createFraisWithFiles(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.success.emit(res);
      },
      error: (err) => {
        this.loading = false;
        console.error('Upload failed', err);
        alert('Erreur lors de l\'enregistrement des frais');
      }
    });
  }
}
