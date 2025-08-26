export interface GetFECByIdReq {
  Params: {
    id: string;
  };
}

export interface CreateFECReq {
  Body: {
    entries: FECEntry[];
  };
}

export interface UpdateFECReq {
  Params: {
    id: string;
  };
  Body: {
    entry: Partial<FECEntry>;
  };
}

export interface DeleteFECReq {
  Params: {
    id: string;
  };
}

export interface DeleteManyFECReq {
  Body: {
    ids: string[];
  };
}

export interface ImportFECFileReq {
  Body: {
    options?: {
      separator?: string;
      encoding?: BufferEncoding;
      skipFirstLine?: boolean;
    };
  };
}

export interface FECEntry {
  journalCode: string;
  journalLibelle: string;
  ecritureNumero?: number;
  ecritureDate: string;
  compteNumero: string;
  compteLibelle: string;
  tiersNumero?: string;
  tiersLibelle?: string;
  pieceRef?: string;
  pieceDate?: string;
  libelle: string;
  debit: number;
  credit: number;
  devise?: string;
  montantDevise?: number;
  lettrage?: string;
  dateLettrage?: string;
  ecritureLettrage?: string;
}

export interface FECFile {
  fec: FECEntry[];
}
