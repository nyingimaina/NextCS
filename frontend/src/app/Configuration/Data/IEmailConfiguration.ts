export interface IEmailConfiguration {
  enabled: boolean;
  to: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
}
