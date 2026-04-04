export interface Dossier {
    id?: number;
    reference: string;
    titre: string;
    priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE';
    budgetProvisionne?: number;
    description?: string;
    statut: 'OUVERT' | 'EN_COURS' | 'CLOTURE' | 'A_PRE_VALIDER' | 'A_VALIDER';
    riskScore?: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
    createdAt?: string;
    updatedAt?: string;
}
