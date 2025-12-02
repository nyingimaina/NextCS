export default interface IFormProps<TModel> {
  model?: TModel;
  onSaved?: (model: TModel) => void;
}
