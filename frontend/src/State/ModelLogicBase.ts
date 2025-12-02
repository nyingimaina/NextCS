/* eslint-disable @typescript-eslint/no-empty-object-type */
import LogicBase from "./LogicBase";
import RepositoryBase from "./RepositoryBase";

export default abstract class ModelLogicBase<
  TRepository extends RepositoryBase,
  TModel extends object = {}
> extends LogicBase<TRepository, TModel> {
  protected abstract get modelTemplate(): TModel;

  public initialize(args: { model?: TModel }) {
    this.model = { ...this.modelTemplate, ...args.model } as TModel;
    this.repository.initialized = true;
    this.rerender();
  }
}
