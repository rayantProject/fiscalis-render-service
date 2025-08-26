import { ExempleUser } from '@/interfaces/exempleUser';
import { Schema, QueryWithHelpers, HydratedDocument, model, Model } from 'mongoose';

interface ExempleInterfaceMethods {
  display(): string;
}

type ExempleUserDocument = HydratedDocument<ExempleUser, ExempleInterfaceMethods>;

interface ExempleUserQueryHelpers {
  findByNames(name: string): QueryWithHelpers<HydratedDocument<ExempleUser>, ExempleUser, ExempleUserQueryHelpers>;
}

export interface ExempleUserModel extends Model<ExempleUserDocument, ExempleUserQueryHelpers> {
  getAll(): QueryWithHelpers<ExempleUserDocument[], ExempleUserDocument, ExempleUserQueryHelpers>;
  getById(id: string): QueryWithHelpers<ExempleUserDocument | null, ExempleUserDocument, ExempleUserQueryHelpers>;
  createUser(user: ExempleUser): Promise<ExempleUserDocument>;
  createManyUsers(users: ExempleUser[]): Promise<ExempleUserDocument[]>;
  updateUser(id: string, user: Partial<ExempleUser>): Promise<ExempleUserDocument | null>;
  deleteUser(id: string): Promise<ExempleUserDocument | null>;
}

export const ExempleUserSchema = new Schema<
  ExempleUser,
  ExempleUserModel,
  ExempleUserDocument,
  ExempleUserQueryHelpers
>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
});

ExempleUserSchema.methods.display = function (): string {
  return `Name: ${this.name}, Age: ${this.age}`;
};

ExempleUserSchema.query.findByNames = function (
  name: string
): QueryWithHelpers<HydratedDocument<ExempleUser>, ExempleUser, ExempleUserQueryHelpers> {
  return this.where({ name });
};

ExempleUserSchema.statics.getAll = function () {
  return this.find();
};

ExempleUserSchema.statics.getById = function (id: string) {
  return this.findById(id);
};

ExempleUserSchema.statics.createUser = async function (user: ExempleUser) {
  const newUser = new this(user);
  return await newUser.save();
};

ExempleUserSchema.statics.createManyUsers = async function (users: ExempleUser[]) {
  return await this.insertMany(users);
};

ExempleUserSchema.statics.updateUser = async function (id: string, user: Partial<ExempleUser>) {
  return await this.findByIdAndUpdate(id, user, { new: true });
};

ExempleUserSchema.statics.deleteUser = async function (id: string) {
  return await this.findByIdAndDelete(id);
};

export const exempleUserModel = model<ExempleUser, ExempleUserModel>('ExempleUser', ExempleUserSchema);
