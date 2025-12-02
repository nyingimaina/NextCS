import { IEmailConfiguration } from "./IEmailConfiguration";
import { IMFilesConfiguration } from "./IMFilesConfiguration";
import ITaillogCredentials from "./ITaillogCredentials";

export default interface IConfiguration {
  taillogConfiguration: ITaillogCredentials;
  emailConfiguration: IEmailConfiguration;
  mFilesConfiguration: IMFilesConfiguration;
}
