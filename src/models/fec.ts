import { FECEntry } from '@/interfaces/fec';
import { Schema, QueryWithHelpers, HydratedDocument, model, Model } from 'mongoose';

interface FECInterfaceMethods {
  display(): string;
}

type FECDocument = HydratedDocument<FECEntry, FECInterfaceMethods>;

interface FECQueryHelpers {
  findByJournalCode(journalCode: string): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers>;
  findByCompteNumero(compteNumero: string): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers>;
  findByEcritureNumero(ecritureNumero: number): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers>;
}

export interface FECModel extends Model<FECDocument, FECQueryHelpers> {
  getAll(): QueryWithHelpers<FECDocument[], FECDocument, FECQueryHelpers>;
  getById(id: string): QueryWithHelpers<FECDocument | null, FECDocument, FECQueryHelpers>;
  createEntry(entry: FECEntry): Promise<FECDocument>;
  createManyEntries(entries: FECEntry[]): Promise<FECDocument[]>;
  updateEntry(id: string, entry: Partial<FECEntry>): Promise<FECDocument | null>;
  deleteEntry(id: string): Promise<FECDocument | null>;
}

export const FECSchema = new Schema<FECEntry, FECModel, FECDocument, FECQueryHelpers>({
  journalCode: { type: String, required: true },
  journalLibelle: { type: String, required: true },
  ecritureNumero: { type: Number, required: false }, // Optional since some FEC entries may not have a number
  ecritureDate: { type: String, required: true },
  compteNumero: { type: String, required: true },
  compteLibelle: { type: String, required: true },
  tiersNumero: { type: String, required: false },
  tiersLibelle: { type: String, required: false },
  pieceRef: { type: String, required: false },
  pieceDate: { type: String, required: false },
  libelle: { type: String, required: true },
  debit: { type: Number, required: true },
  credit: { type: Number, required: true },
  devise: { type: String, required: false },
  montantDevise: { type: Number, required: false },
  lettrage: { type: String, required: false },
  dateLettrage: { type: String, required: false },
  ecritureLettrage: { type: String, required: false },
});

FECSchema.methods.display = function (): string {
  const ecritureInfo = this.ecritureNumero ? `, Écriture: ${this.ecritureNumero}` : '';
  return `Journal: ${this.journalCode}${ecritureInfo}, Compte: ${this.compteNumero}, Libellé: ${this.libelle}`;
};

FECSchema.query.findByJournalCode = function (
  journalCode: string
): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers> {
  return this.where({ journalCode });
};

FECSchema.query.findByCompteNumero = function (
  compteNumero: string
): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers> {
  return this.where({ compteNumero });
};

FECSchema.query.findByEcritureNumero = function (
  ecritureNumero: number
): QueryWithHelpers<HydratedDocument<FECEntry>, FECEntry, FECQueryHelpers> {
  return this.where({ ecritureNumero });
};

FECSchema.statics.getAll = function () {
  return this.find();
};

FECSchema.statics.getById = function (id: string) {
  return this.findById(id);
};

FECSchema.statics.createEntry = async function (entry: FECEntry) {
  const newEntry = new this(entry);
  return await newEntry.save();
};

FECSchema.statics.createManyEntries = async function (entries: FECEntry[]) {
  return await this.insertMany(entries);
};

FECSchema.statics.updateEntry = async function (id: string, entry: Partial<FECEntry>) {
  return await this.findByIdAndUpdate(id, entry, { new: true });
};

FECSchema.statics.deleteEntry = async function (id: string) {
  return await this.findByIdAndDelete(id);
};

export const fecModel = model<FECEntry, FECModel>('FEC', FECSchema);
