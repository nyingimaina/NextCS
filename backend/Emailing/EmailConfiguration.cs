namespace {{your-app-name}}.Emailing
{
    public class EmailConfiguration
    {
        public bool Enabled { get; set; }
        public string FromName { get; set; } = string.Empty;
        public string Username { get; set; }  = string.Empty;
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public string Password { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string Cc { get; set; } = string.Empty;
        public string Bcc { get; set; } = string.Empty;
    }
}