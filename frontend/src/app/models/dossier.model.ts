export interface Dossier {
    id?: number;
    reference: string;
    titre: string;
    priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE';
    budgetProvisionne?: number;
    fraisInitial?: number;
    fraisReel?: number;
    depassement?: number;
    description?: string;
    motifRefus?: string;
    statut: string;
    riskScore?: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
    avocat?: any;
    huissier?: any;
    expert?: any;
    partieLitige?: any;
    createdAt?: string;
    updatedAt?: string;
    affaires?: any[];
    
    // Financial Workflow
    financialStatut?: string;
    honorairesAvocatFinal?: number;
    fraisHuissierFinal?: number;
    autresFraisFinal?: number;
    motifRefusFinancier?: string;
    assignedCharge?: any;
    archived?: boolean;

    // AI Prediction results
    verdict?: string; // GAGNÉ / PERDU
    probabilitySuccess?: number;
    probabilityFailure?: number;
    aiAnalysis?: string;
}
