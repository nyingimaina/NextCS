import LogicBase from "@/State/LogicBase";
import ConfigurationRepository from "./ConfigurationRepository";
import IConfiguration from "../Data/IConfiguration";
import ConfigurationApiService from "../Data/ConfigurationApiService";

export default class ConfigurationLogic extends LogicBase<
  ConfigurationRepository,
  IConfiguration
> {
  repository = new ConfigurationRepository();
  model = {} as IConfiguration;

  public async upsertAsync(): Promise<boolean> {
    await this.proxyRunner.runAsync(async () => {
      await new ConfigurationApiService().upsertAsync(this.model);
    });
    return true;
  }

  public async initializeAsync() {
    this.updateModel(
      await new ConfigurationApiService().getConfigurationAsync()
    );
  }

  public get canSave(): boolean {
    return this.model &&
      this.#hasTaillogConfiguration &&
      this.#hasMFilesConfiguration &&
      this.#emailProperlyConfigured
      ? true
      : false;
  }

  get #hasTaillogConfiguration(): boolean {
    return this.model.taillogConfiguration &&
      this.model.taillogConfiguration.username &&
      this.model.taillogConfiguration.password &&
      this.model.taillogConfiguration.baseUrl
      ? true
      : false;
  }

  get #hasMFilesConfiguration(): boolean {
    return this.model &&
      this.model.mFilesConfiguration &&
      this.model.mFilesConfiguration.baseUrl &&
      this.model.mFilesConfiguration.vaultGuid &&
      this.model.mFilesConfiguration.username &&
      this.model.mFilesConfiguration.password
      ? true
      : false;
  }

  get #emailProperlyConfigured(): boolean {
    debugger;
    const noConfig = !this.model || !this.model.emailConfiguration;
    if (noConfig) {
      return true;
    }
    if (this.model.emailConfiguration.enabled !== true) {
      return true;
    }
    return this.model.emailConfiguration.to &&
      this.model.emailConfiguration.smtpHost &&
      this.model.emailConfiguration.smtpPort &&
      this.model.emailConfiguration.username &&
      this.model.emailConfiguration.password
      ? true
      : false;
  }
}
