import IValidationError from "./IValidationError";

export default interface IValidationResponse<T> {
  entity?: T;
  validationErrors: IValidationError[];
  hasErrors: boolean;
}
