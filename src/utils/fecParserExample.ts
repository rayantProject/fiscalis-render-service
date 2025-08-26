import { parseFECFileContent, validateFECEntries } from './fecParser';
import { FECEntry } from '../interfaces/fec';

/**
 * Exemple d'utilisation du parser FEC
 */
export async function exempleUtilisationParser() {
  // Exemple 1: Parser du contenu FEC en texte
  const fecContent = `VT	Ventes	1	20240101	411000	Clients		FAC001	20240101	Vente produit	1000	0			
AC	Achats	2	20240102	401000	Fournisseurs		FAC002	20240102	Achat matière	0	500			
BQ	Banque	3	20240103	512000	Banque		VIR001	20240103	Virement	0	1000			
BQ	Banque	4	20240103	411000	Clients		VIR001	20240103	Virement	1000	0			`;

  try {
    console.log('=== Parsing du contenu FEC ===');
    const entries = parseFECFileContent(fecContent);
    console.log(`${entries.length} entrées parsées avec succès`);

    // Valider les entrées
    validateFECEntries(entries);
    console.log('Validation réussie');

    // Afficher quelques détails
    entries.forEach((entry: FECEntry, index: number) => {
      console.log(
        `Entrée ${index + 1}: ${entry.journalCode} - ${entry.libelle} - Débit: ${entry.debit}€ - Crédit: ${entry.credit}€`
      );
    });

    return entries;
  } catch (error) {
    console.error('Erreur lors du parsing:', error);
    throw error;
  }
}

/**
 * Exemple avec gestion des erreurs
 */
export async function exempleGestionErreurs() {
  // Exemple avec données invalides
  const fecInvalide = `VT	Ventes	ABC	20240101	411000	Clients		FAC001	20240101	Vente produit	1000	0			`;

  try {
    console.log('=== Test avec données invalides ===');
    parseFECFileContent(fecInvalide);
  } catch (error) {
    console.log('Erreur capturée (attendue):', error.message);
    if (error.line) {
      console.log(`Ligne en erreur: ${error.line}`);
    }
    if (error.field) {
      console.log(`Champ en erreur: ${error.field}`);
    }
  }
}

/**
 * Exemple avec options de parsing
 */
export async function exempleAvecOptions() {
  // Contenu avec en-tête et séparateur personnalisé
  const fecAvecEntete = `JournalCode;JournalLib;EcritureNum;EcritureDate;CompteNum;CompteLib;CompAuxNum;CompAuxLib;PieceRef;PieceDate;EcritureLib;Debit;Credit;EcritureLet;DateLet;ValidDate;Montantdevise;Idevise
VT;Ventes;1;20240101;411000;Clients;;;FAC001;20240101;Vente produit;1000;0;;;;;
AC;Achats;2;20240102;401000;Fournisseurs;;;FAC002;20240102;Achat matière;0;500;;;;;`;

  try {
    console.log('=== Parsing avec options personnalisées ===');
    const entries = parseFECFileContent(fecAvecEntete, {
      separator: ';',
      skipFirstLine: true,
    });

    console.log(`${entries.length} entrées parsées avec séparateur personnalisé`);
    entries.forEach((entry: FECEntry, index: number) => {
      console.log(`Entrée ${index + 1}: ${entry.journalCode} - ${entry.libelle}`);
    });

    return entries;
  } catch (error) {
    console.error('Erreur lors du parsing avec options:', error);
    throw error;
  }
}

// Exécuter les exemples si le fichier est exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await exempleUtilisationParser();
      console.log('\n');
      await exempleGestionErreurs();
      console.log('\n');
      await exempleAvecOptions();
    } catch (error) {
      console.error('Erreur dans les exemples:', error);
    }
  })();
}
