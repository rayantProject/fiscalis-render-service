export interface GetExempleUserByIdReq {
  Params: {
    id: string;
  };
}

export interface CreateExempleUserReq {
  Body: {
    users: ExempleUser[];
  };
}

export interface UpdateExempleUserReq {
  Params: {
    id: string;
  };
  Body: {
    user: Partial<ExempleUser>;
  };
}

export interface DeleteExempleUserReq {
  Params: {
    id: string;
  };
}

export interface ExempleUser {
  name: string;
  age: number;
}
