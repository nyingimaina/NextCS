import ApiServiceBase from "@/musketeer/ApiService/ApiServiceBase";
import IConfiguration from "./IConfiguration";

export default class ConfigurationApiService extends ApiServiceBase {
  protected route: string = "configuration";

  public async upsertAsync(
    configuration: IConfiguration
  ): Promise<IConfiguration | undefined> {
    return await this.postOrThrowAsync<IConfiguration>({
      endpoint: "upsert",
      body: configuration,
    });
  }

  public async getConfigurationAsync(): Promise<IConfiguration> {
    return await this.getOrThrowAsync<IConfiguration>({
      endpoint: "get",
    });
  }
}
