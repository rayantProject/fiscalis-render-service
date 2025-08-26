import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import { testApp } from './setup/setup';
import { FECEntry } from '../src/interfaces/fec';

const baseUrl = '/fec';

const sampleFECEntry: FECEntry = {
  journalCode: 'VTE',
  journalLibelle: 'Ventes',
  ecritureNumero: 1001,
  ecritureDate: '20240101',
  compteNumero: '411000',
  compteLibelle: 'Clients',
  tiersNumero: 'CLI001',
  tiersLibelle: 'Client ABC',
  pieceRef: 'FAC-2024-001',
  pieceDate: '20240101',
  libelle: 'Vente de marchandises',
  debit: 1200.0,
  credit: 0.0,
  devise: 'EUR',
  montantDevise: 1200.0,
  lettrage: '',
  dateLettrage: '',
  ecritureLettrage: '',
};

describe('FEC routes', () => {
  it('should return an empty array when no FEC entries exist', async () => {
    const res = await testApp.inject({
      method: 'GET',
      url: baseUrl,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('should create FEC entries', async () => {
    const res = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [sampleFECEntry] },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].journalCode).toBe(sampleFECEntry.journalCode);
    expect(res.json()[0].journalLibelle).toBe(sampleFECEntry.journalLibelle);
    expect(res.json()[0].ecritureNumero).toBe(sampleFECEntry.ecritureNumero);
    expect(res.json()[0].compteNumero).toBe(sampleFECEntry.compteNumero);
    expect(res.json()[0].libelle).toBe(sampleFECEntry.libelle);
    expect(res.json()[0].debit).toBe(sampleFECEntry.debit);
    expect(res.json()[0].credit).toBe(sampleFECEntry.credit);
  });

  it('should get FEC entry by id', async () => {
    // Create an entry first
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [sampleFECEntry] },
    });

    const entryId = json()[0]._id;

    const res = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${entryId}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()._id).toBe(entryId);
    expect(res.json().journalCode).toBe(sampleFECEntry.journalCode);
    expect(res.json().compteNumero).toBe(sampleFECEntry.compteNumero);
    expect(res.json().libelle).toBe(sampleFECEntry.libelle);
  });

  it('should return 404 if FEC entry id is not found', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${fakeId}`,
    });

    expect(res.statusCode).toBe(404);
  });

  it('should update a FEC entry', async () => {
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [sampleFECEntry] },
    });

    const entryId = json()[0]._id;

    const updatedData = {
      entry: {
        libelle: 'Vente de services - Modifié',
        debit: 1500.0,
        compteLibelle: 'Clients - Modifié',
      },
    };

    const res = await testApp.inject({
      method: 'PATCH',
      url: `${baseUrl}/${entryId}`,
      payload: updatedData,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().libelle).toBe('Vente de services - Modifié');
    expect(res.json().debit).toBe(1500.0);
    expect(res.json().compteLibelle).toBe('Clients - Modifié');
  });

  it('should return 404 when updating non-existent FEC entry', async () => {
    const fakeId = new Types.ObjectId().toString();
    const updatedData = { entry: { libelle: 'Test Update' } };

    const res = await testApp.inject({
      method: 'PATCH',
      url: `${baseUrl}/${fakeId}`,
      payload: updatedData,
    });

    expect(res.statusCode).toBe(404);
  });

  it('should delete a FEC entry', async () => {
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [sampleFECEntry] },
    });

    const entryId = json()[0]._id;

    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/${entryId}`,
    });

    expect(res.statusCode).toBe(200);

    // Verify the entry was deleted
    const check = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${entryId}`,
    });

    expect(check.statusCode).toBe(404);
  });

  it('should return 404 when deleting non-existent FEC entry', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/${fakeId}`,
    });

    expect(res.statusCode).toBe(404);
  });

  // Tests pour la suppression en masse
  it('should delete multiple FEC entries', async () => {
    // Créer plusieurs entrées
    const multipleEntries = [
      { ...sampleFECEntry, ecritureNumero: 5001, libelle: 'Entrée 1' },
      { ...sampleFECEntry, ecritureNumero: 5002, libelle: 'Entrée 2' },
      { ...sampleFECEntry, ecritureNumero: 5003, libelle: 'Entrée 3' },
    ];

    const createRes = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: multipleEntries },
    });

    expect(createRes.statusCode).toBe(201);
    const createdEntries = createRes.json();
    const idsToDelete = createdEntries.map((entry: FECEntry & { _id: string }) => entry._id);

    // Supprimer les entrées en masse
    const deleteRes = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: { ids: idsToDelete },
    });

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.json().deletedCount).toBe(3);
    expect(deleteRes.json().requestedCount).toBe(3);
    expect(deleteRes.json().message).toContain('3 entrée(s) FEC supprimée(s)');

    // Vérifier que les entrées ont été supprimées
    for (const id of idsToDelete) {
      const checkRes = await testApp.inject({
        method: 'GET',
        url: `${baseUrl}/${id}`,
      });
      expect(checkRes.statusCode).toBe(404);
    }
  });

  it('should return 400 when deleting with empty IDs array', async () => {
    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: { ids: [] },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('IDs manquants');
  });

  it('should return 400 when deleting with invalid IDs', async () => {
    const invalidIds = ['invalid-id-1', 'invalid-id-2'];

    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: { ids: invalidIds },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('IDs invalides');
    expect(res.json().message).toContain('invalid-id-1, invalid-id-2');
  });

  it('should return 404 when deleting with non-existent IDs', async () => {
    const nonExistentIds = [new Types.ObjectId().toString(), new Types.ObjectId().toString()];

    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: { ids: nonExistentIds },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().deletedCount).toBe(0);
    expect(res.json().message).toContain('Aucune entrée FEC trouvée');
  });

  it('should delete only existing entries when mix of valid and non-existent IDs', async () => {
    // Créer une entrée
    const createRes = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [{ ...sampleFECEntry, ecritureNumero: 6001 }] },
    });

    const createdEntry = createRes.json()[0];
    const existingId = createdEntry._id;
    const nonExistentId = new Types.ObjectId().toString();

    // Tenter de supprimer l'ID existant et un ID inexistant
    const deleteRes = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: { ids: [existingId, nonExistentId] },
    });

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.json().deletedCount).toBe(1);
    expect(deleteRes.json().requestedCount).toBe(2);

    // Vérifier que l'entrée existante a été supprimée
    const checkRes = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${existingId}`,
    });
    expect(checkRes.statusCode).toBe(404);
  });

  it('should return 400 when no IDs provided for bulk delete', async () => {
    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/bulk-delete`,
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('IDs manquants');
  });

  it('should handle multiple FEC entries creation', async () => {
    const multipleFECEntries = [
      {
        journalCode: 'VTE',
        journalLibelle: 'Ventes',
        ecritureNumero: 2001,
        ecritureDate: '20240201',
        compteNumero: '411000',
        compteLibelle: 'Clients',
        tiersNumero: 'CLI001',
        tiersLibelle: 'Client ABC',
        pieceRef: 'FAC-2024-002',
        pieceDate: '20240201',
        libelle: 'Vente produit A',
        debit: 800.0,
        credit: 0.0,
      },
      {
        journalCode: 'ACH',
        journalLibelle: 'Achats',
        ecritureNumero: 2002,
        ecritureDate: '20240202',
        compteNumero: '401000',
        compteLibelle: 'Fournisseurs',
        tiersNumero: 'FOU001',
        tiersLibelle: 'Fournisseur XYZ',
        pieceRef: 'FACT-2024-100',
        pieceDate: '20240202',
        libelle: 'Achat de matières premières',
        debit: 0.0,
        credit: 500.0,
      },
      {
        journalCode: 'BQ',
        journalLibelle: 'Banque',
        ecritureNumero: 2003,
        ecritureDate: '20240203',
        compteNumero: '512000',
        compteLibelle: 'Banque',
        pieceRef: 'VIR-2024-050',
        pieceDate: '20240203',
        libelle: 'Virement reçu client',
        debit: 1200.0,
        credit: 0.0,
      },
    ];

    const res = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: multipleFECEntries },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveLength(3);
    expect(res.json().map((e: FECEntry & { _id: string }) => e.journalCode)).toEqual(['VTE', 'ACH', 'BQ']);
    expect(res.json().map((e: FECEntry & { _id: string }) => e.ecritureNumero)).toEqual([2001, 2002, 2003]);
  });

  it('should handle FEC entries with minimal data (required fields only)', async () => {
    const minimalFECEntry: FECEntry = {
      journalCode: 'OD',
      journalLibelle: 'Opérations Diverses',
      ecritureNumero: 3001,
      ecritureDate: '20240301',
      compteNumero: '601000',
      compteLibelle: 'Achats de matières premières',
      libelle: 'Écriture simple',
      debit: 100.0,
      credit: 0.0,
    };

    const res = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: [minimalFECEntry] },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].journalCode).toBe('OD');
    expect(res.json()[0].ecritureNumero).toBe(3001);
    expect(res.json()[0].debit).toBe(100.0);
    expect(res.json()[0].credit).toBe(0.0);
    // Optional fields should be undefined or null
    expect(res.json()[0].tiersNumero).toBeUndefined();
    expect(res.json()[0].devise).toBeUndefined();
  });

  it('should retrieve all FEC entries after multiple creations', async () => {
    // Create multiple entries
    const entries1 = [sampleFECEntry];
    const entries2 = [
      {
        ...sampleFECEntry,
        ecritureNumero: 4001,
        libelle: 'Autre écriture',
        debit: 750.0,
      },
    ];

    await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: entries1 },
    });

    await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { entries: entries2 },
    });

    const res = await testApp.inject({
      method: 'GET',
      url: baseUrl,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().length).toBeGreaterThanOrEqual(2);

    // Check that both entries exist
    const libelles = res.json().map((e: FECEntry) => e.libelle);
    expect(libelles).toContain('Vente de marchandises');
    expect(libelles).toContain('Autre écriture');
  });
});
