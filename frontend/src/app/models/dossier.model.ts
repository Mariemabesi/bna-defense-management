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
    statut: 'OUVERT' | 'EN_COURS' | 'EN_ATTENTE_PREVALIDATION' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REFUSE' | 'CLOTURE';
    riskScore?: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
    avocat?: any;
    huissier?: any;
    expert?: any;
    partieLitige?: any;
    createdAt?: string;
    updatedAt?: string;
}
