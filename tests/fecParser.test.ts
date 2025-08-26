import { describe, it, expect } from 'vitest';
import { parseFECFileContent, parseFECFromBuffer, validateFECEntry, FECParseError } from '../src/utils/fecParser';

describe('FEC Parser', () => {
  const sampleFECLine =
    'VT\tVentes\t1\t20240101\t411000\tClients\t\t\tFAC001\t20240101\tVente produit\t1000\t0\t\t\t\t\t';
  const sampleFECContent = `${sampleFECLine}\nAC\tAchats\t2\t20240102\t401000\tFournisseurs\t\t\tFAC002\t20240102\tAchat matière\t0\t500`;

  describe('parseFECFileContent', () => {
    it('should parse a valid FEC file content', () => {
      const entries = parseFECFileContent(sampleFECContent);

      expect(entries).toHaveLength(2);

      // Première entrée
      expect(entries[0]).toEqual({
        journalCode: 'VT',
        journalLibelle: 'Ventes',
        ecritureNumero: 1,
        ecritureDate: '20240101',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        tiersNumero: undefined,
        tiersLibelle: undefined,
        pieceRef: 'FAC001',
        pieceDate: '20240101',
        libelle: 'Vente produit',
        debit: 1000,
        credit: 0,
        devise: undefined,
        montantDevise: undefined,
        lettrage: undefined,
        dateLettrage: undefined,
        ecritureLettrage: undefined,
      });

      // Deuxième entrée
      expect(entries[1]).toEqual({
        journalCode: 'AC',
        journalLibelle: 'Achats',
        ecritureNumero: 2,
        ecritureDate: '20240102',
        compteNumero: '401000',
        compteLibelle: 'Fournisseurs',
        tiersNumero: undefined,
        tiersLibelle: undefined,
        pieceRef: 'FAC002',
        pieceDate: '20240102',
        libelle: 'Achat matière',
        debit: 0,
        credit: 500,
        devise: undefined,
        montantDevise: undefined,
        lettrage: undefined,
        dateLettrage: undefined,
        ecritureLettrage: undefined,
      });
    });

    it('should skip first line when skipFirstLine option is true', () => {
      const contentWithHeader = `JournalCode\tJournalLib\tEcritureNum\tEcritureDate\n${sampleFECLine}`;
      const entries = parseFECFileContent(contentWithHeader, { skipFirstLine: true });

      expect(entries).toHaveLength(1);
      expect(entries[0].journalCode).toBe('VT');
    });

    it('should handle custom separator', () => {
      const csvContent = sampleFECLine.replace(/\t/g, ';');
      const entries = parseFECFileContent(csvContent, { separator: ';' });

      expect(entries).toHaveLength(1);
      expect(entries[0].journalCode).toBe('VT');
    });

    it('should throw error for empty file', () => {
      expect(() => parseFECFileContent('')).toThrow(FECParseError);
      expect(() => parseFECFileContent('   \n  \n')).toThrow(FECParseError);
    });

    it('should throw error for insufficient columns', () => {
      const invalidLine = 'VT\tVentes\t1';
      expect(() => parseFECFileContent(invalidLine)).toThrow(FECParseError);
    });

    it('should throw error for invalid date format', () => {
      const invalidDateLine =
        'VT\tVentes\t1\t2024-01-01\t411000\tClients\t\t\tFAC001\t20240101\tVente produit\t1000\t0\t\t\t\t\t';
      expect(() => parseFECFileContent(invalidDateLine)).toThrow(FECParseError);
    });

    it('should throw error for invalid number', () => {
      const invalidNumberLine =
        'VT\tVentes\tABC\t20240101\t411000\tClients\t\t\tFAC001\t20240101\tVente produit\t1000\t0\t\t\t\t\t';
      expect(() => parseFECFileContent(invalidNumberLine)).toThrow(FECParseError);
    });

    it('should handle decimal amounts with comma', () => {
      const decimalLine =
        'VT\tVentes\t1\t20240101\t411000\tClients\t\t\tFAC001\t20240101\tVente produit\t1000,50\t0\t\t\t\t\t';
      const entries = parseFECFileContent(decimalLine);

      expect(entries[0].debit).toBe(1000.5);
    });

    it('should handle optional fields', () => {
      const fullLine =
        'VT\tVentes\t1\t20240101\t411000\tClients\tCLI001\tClient ABC\tFAC001\t20240101\tVente produit\t1000\t0\tLET001\t20240115\t\t1000,50\tEUR';
      const entries = parseFECFileContent(fullLine);

      expect(entries[0].tiersNumero).toBe('CLI001');
      expect(entries[0].tiersLibelle).toBe('Client ABC');
      expect(entries[0].lettrage).toBe('LET001');
      expect(entries[0].dateLettrage).toBe('20240115');
      expect(entries[0].montantDevise).toBe(1000.5);
      expect(entries[0].devise).toBe('EUR');
    });
  });

  describe('parseFECFromBuffer', () => {
    it('should parse buffer content', () => {
      const buffer = Buffer.from(sampleFECContent, 'utf8');
      const entries = parseFECFromBuffer(buffer);

      expect(entries).toHaveLength(2);
      expect(entries[0].journalCode).toBe('VT');
    });

    it('should handle different encodings', () => {
      const buffer = Buffer.from(sampleFECLine, 'latin1');
      const entries = parseFECFromBuffer(buffer, { encoding: 'latin1' });

      expect(entries).toHaveLength(1);
      expect(entries[0].journalCode).toBe('VT');
    });
  });

  describe('validateFECEntry', () => {
    it('should validate a correct entry', () => {
      const validEntry = {
        journalCode: 'VT',
        journalLibelle: 'Ventes',
        ecritureNumero: 1,
        ecritureDate: '20240101',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        libelle: 'Vente produit',
        debit: 1000,
        credit: 0,
      };

      expect(() => validateFECEntry(validEntry)).not.toThrow();
    });

    it('should throw error for entry with both debit and credit', () => {
      const invalidEntry = {
        journalCode: 'VT',
        journalLibelle: 'Ventes',
        ecritureNumero: 1,
        ecritureDate: '20240101',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        libelle: 'Vente produit',
        debit: 1000,
        credit: 500,
      };

      expect(() => validateFECEntry(invalidEntry)).toThrow(FECParseError);
    });

    it('should throw error for entry with no debit or credit', () => {
      const invalidEntry = {
        journalCode: 'VT',
        journalLibelle: 'Ventes',
        ecritureNumero: 1,
        ecritureDate: '20240101',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        libelle: 'Vente produit',
        debit: 0,
        credit: 0,
      };

      expect(() => validateFECEntry(invalidEntry)).toThrow(FECParseError);
    });

    it('should throw error for negative amounts', () => {
      const invalidEntry = {
        journalCode: 'VT',
        journalLibelle: 'Ventes',
        ecritureNumero: 1,
        ecritureDate: '20240101',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        libelle: 'Vente produit',
        debit: -1000,
        credit: 0,
      };

      expect(() => validateFECEntry(invalidEntry)).toThrow(FECParseError);
    });
  });

  describe('Error handling', () => {
    it('should provide detailed error information', () => {
      try {
        parseFECFileContent('invalid\tline');
      } catch (error) {
        expect(error).toBeInstanceOf(FECParseError);
        const fecError = error as FECParseError;
        expect(fecError.line).toBe(1);
        expect(fecError.message).toContain('nombre de colonnes insuffisant');
      }
    });

    it('should handle missing required fields', () => {
      const missingFieldLine =
        '\tVentes\t1\t20240101\t411000\tClients\t\t\tFAC001\t20240101\tVente produit\t1000\t0\t\t\t\t\t';

      try {
        parseFECFileContent(missingFieldLine);
      } catch (error) {
        expect(error).toBeInstanceOf(FECParseError);
        const fecError = error as FECParseError;
        expect(fecError.field).toBe('JournalCode');
      }
    });
  });
});
