/* eslint-disable @typescript-eslint/no-empty-object-type */
import ModuleStateManager from "module-state-manager";
import RepositoryBase from "./RepositoryBase";
import AsyncProxy from "@/musketeer/AsyncProxy/AsyncProxy";

export default abstract class LogicBase<
  TRepository extends RepositoryBase,
  TModel extends object = {}
> extends ModuleStateManager<TRepository, TModel> {
  protected proxyRunner = new AsyncProxy((busy) => {
    this.repository.busy = busy;
    this.rerender();
  });
}
