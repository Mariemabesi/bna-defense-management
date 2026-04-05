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
    statut: 'OUVERT' | 'EN_COURS' | 'EN_ATTENTE_PREVALIDATION' | 'EN_ATTENTE_VALIDATION' | 'REFUSE' | 'CLOTURE';
    riskScore?: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
    createdAt?: string;
    updatedAt?: string;
}
