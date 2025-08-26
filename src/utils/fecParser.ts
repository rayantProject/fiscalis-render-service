import { FECEntry } from '@/interfaces/fec';

/**
 * Interface pour les options de parsing du fichier FEC
 */
export interface FECParseOptions {
  separator?: string; // Séparateur de colonnes (par défaut: '\t' pour les fichiers FEC standard)
  encoding?: BufferEncoding; // Encodage du fichier (par défaut: 'utf8')
  skipFirstLine?: boolean; // Ignorer la première ligne si elle contient des en-têtes
}

/**
 * Erreur personnalisée pour les erreurs de parsing FEC
 */
export class FECParseError extends Error {
  constructor(
    message: string,
    public line?: number,
    public field?: string
  ) {
    super(message);
    this.name = 'FECParseError';
  }
}

/**
 * Fonction qui transforme le contenu d'un fichier FEC en tableau d'entrées FEC
 *
 * Format FEC standard (18 colonnes séparées par des tabulations) :
 * 1. JournalCode
 * 2. JournalLib
 * 3. EcritureNum
 * 4. EcritureDate
 * 5. CompteNum
 * 6. CompteLib
 * 7. CompAuxNum
 * 8. CompAuxLib
 * 9. PieceRef
 * 10. PieceDate
 * 11. EcritureLib
 * 12. Debit
 * 13. Credit
 * 14. EcritureLet
 * 15. DateLet
 * 16. ValidDate
 * 17. Montantdevise
 * 18. Idevise
 */
export function parseFECFileContent(content: string, options: FECParseOptions = {}): FECEntry[] {
  const { separator = '\t', skipFirstLine = false } = options;

  const lines = content.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    throw new FECParseError('Le fichier FEC est vide');
  }

  const startIndex = skipFirstLine ? 1 : 0;
  const entries: FECEntry[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue; // Skip truly empty lines but don't trim the line for parsing

    try {
      const entry = parseFECLine(line, separator, i + 1);
      entries.push(entry);
    } catch (error) {
      if (error instanceof FECParseError) {
        throw error;
      }
      throw new FECParseError(`Erreur lors du parsing de la ligne ${i + 1}: ${error}`, i + 1);
    }
  }

  return entries;
}

function parseFECLine(line: string, separator: string, lineNumber: number): FECEntry {
  const columns = line.split(separator);

  if (columns.length < 13) {
    throw new FECParseError(
      `Ligne ${lineNumber}: nombre de colonnes insuffisant (${columns.length} au lieu d'au moins 13)`,
      lineNumber
    );
  }

  try {
    // Validation et conversion des champs obligatoires
    const journalCode = validateRequired(columns[0]?.trim(), 'JournalCode', lineNumber);
    const journalLibelle = validateRequired(columns[1]?.trim(), 'JournalLibelle', lineNumber);
    const ecritureNumero = parseOptionalNumber(columns[2]?.trim(), 'EcritureNumero', lineNumber);
    const ecritureDate = validateDate(columns[3]?.trim(), 'EcritureDate', lineNumber);
    const compteNumero = validateRequired(columns[4]?.trim(), 'CompteNumero', lineNumber);
    const compteLibelle = validateRequired(columns[5]?.trim(), 'CompteLibelle', lineNumber);
    const libelle = validateRequired(columns[10]?.trim(), 'Libelle', lineNumber);
    const debit = parseAmount(columns[11]?.trim(), 'Debit', lineNumber);
    const credit = parseAmount(columns[12]?.trim(), 'Credit', lineNumber);

    // Champs optionnels
    const tiersNumero = columns[6]?.trim() || undefined;
    const tiersLibelle = columns[7]?.trim() || undefined;
    const pieceRef = columns[8]?.trim() || undefined;
    const pieceDate = columns[9]?.trim() ? validateDate(columns[9].trim(), 'PieceDate', lineNumber) : undefined;
    const lettrage = columns[13]?.trim() || undefined;
    const dateLettrage = columns[14]?.trim() ? validateDate(columns[14].trim(), 'DateLettrage', lineNumber) : undefined;
    const montantDevise = columns[16]?.trim()
      ? parseAmount(columns[16].trim(), 'MontantDevise', lineNumber)
      : undefined;
    const devise = columns[17]?.trim() || undefined;

    return {
      journalCode,
      journalLibelle,
      ecritureNumero,
      ecritureDate,
      compteNumero,
      compteLibelle,
      tiersNumero,
      tiersLibelle,
      pieceRef,
      pieceDate,
      libelle,
      debit,
      credit,
      devise,
      montantDevise,
      lettrage,
      dateLettrage,
      ecritureLettrage: lettrage,
    };
  } catch (error) {
    if (error instanceof FECParseError) {
      throw error;
    }
    throw new FECParseError(`Erreur lors du parsing de la ligne ${lineNumber}: ${error}`, lineNumber);
  }
}

/**
 * Valide qu'un champ obligatoire n'est pas vide
 */
function validateRequired(value: string | undefined, fieldName: string, lineNumber: number): string {
  if (!value || value === '') {
    throw new FECParseError(`Ligne ${lineNumber}: le champ ${fieldName} est obligatoire`, lineNumber, fieldName);
  }
  return value;
}

/**
 * Parse un nombre optionnel et valide sa validité si présent
 */
function parseOptionalNumber(value: string | undefined, fieldName: string, lineNumber: number): number | undefined {
  if (!value || value === '') {
    return undefined; // Field is optional, return undefined
  }

  const parsed = parseInt(value.replace(/\s/g, ''), 10);
  if (isNaN(parsed)) {
    throw new FECParseError(
      `Ligne ${lineNumber}: le champ ${fieldName} doit être un nombre valide`,
      lineNumber,
      fieldName
    );
  }

  return parsed;
}

/**
 * Parse un montant (peut être avec des décimales)
 */
function parseAmount(value: string | undefined, fieldName: string, lineNumber: number): number {
  if (!value || value === '') {
    return 0; // Les montants peuvent être à zéro
  }

  // Remplace la virgule par un point pour les décimales françaises
  const normalizedValue = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalizedValue);

  if (isNaN(parsed)) {
    throw new FECParseError(
      `Ligne ${lineNumber}: le champ ${fieldName} doit être un montant valide`,
      lineNumber,
      fieldName
    );
  }

  return parsed;
}

/**
 * Valide le format d'une date (format attendu: YYYYMMDD)
 */
function validateDate(value: string | undefined, fieldName: string, lineNumber: number): string {
  if (!value || value === '') {
    throw new FECParseError(`Ligne ${lineNumber}: le champ ${fieldName} est obligatoire`, lineNumber, fieldName);
  }

  // Vérifie le format YYYYMMDD
  const dateRegex = /^\d{8}$/;
  if (!dateRegex.test(value)) {
    throw new FECParseError(
      `Ligne ${lineNumber}: le champ ${fieldName} doit être au format YYYYMMDD`,
      lineNumber,
      fieldName
    );
  }

  // Vérifie que la date est valide
  const year = parseInt(value.substring(0, 4), 10);
  const month = parseInt(value.substring(4, 6), 10);
  const day = parseInt(value.substring(6, 8), 10);

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new FECParseError(
      `Ligne ${lineNumber}: le champ ${fieldName} contient une date invalide`,
      lineNumber,
      fieldName
    );
  }

  return value;
}

/**
 * Fonction utilitaire pour lire et parser un fichier FEC depuis un buffer
 */
export function parseFECFromBuffer(buffer: Buffer, options: FECParseOptions = {}): FECEntry[] {
  const { encoding = 'utf8' } = options;
  const content = buffer.toString(encoding);
  return parseFECFileContent(content, options);
}

/**
 * Fonction utilitaire pour valider la cohérence d'une entrée FEC
 */
export function validateFECEntry(entry: FECEntry, lineNumber?: number): void {
  const errors: string[] = [];

  // Validation métier: une écriture ne peut pas avoir à la fois un débit et un crédit
  if (entry.debit > 0 && entry.credit > 0) {
    errors.push('Une écriture ne peut pas avoir à la fois un débit et un crédit');
  }

  // Validation métier: une écriture doit avoir au moins un débit ou un crédit
  if (entry.debit === 0 && entry.credit === 0) {
    errors.push('Une écriture doit avoir au moins un débit ou un crédit');
  }

  // Validation des montants négatifs
  if (entry.debit < 0 || entry.credit < 0) {
    errors.push('Les montants de débit et crédit ne peuvent pas être négatifs');
  }

  if (errors.length > 0) {
    const lineInfo = lineNumber ? ` (ligne ${lineNumber})` : '';
    throw new FECParseError(`Erreur de validation${lineInfo}: ${errors.join(', ')}`, lineNumber);
  }
}

/**
 * Fonction pour valider un tableau d'entrées FEC
 */
export function validateFECEntries(entries: FECEntry[]): void {
  entries.forEach((entry, index) => {
    validateFECEntry(entry, index + 1);
  });
}
