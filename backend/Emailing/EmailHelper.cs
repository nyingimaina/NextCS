using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace {{your-app-name}}.Emailing
{
    public interface IEmailHelper
    {
        void SendEmail(string subject, string body, IEnumerable<string>? attachments = null, bool isHtml = false);
    }

    public class EmailHelper : IEmailHelper
    {
        EmailConfiguration emailConfiguration;

        public EmailHelper(IOptions<EmailConfiguration> options)
        {
            emailConfiguration = options.Value;
        }

        public void SendEmail(
            string subject,
            string body,
            IEnumerable<string>? attachments = null,
            bool isHtml = false)
        {
            var message = BuildMessage(subject, body, attachments, isHtml);
            Send(message);
        }

        private MimeMessage BuildMessage(
            string subject,
            string body,
            IEnumerable<string>? attachments,
            bool isHtml)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(emailConfiguration.FromName, emailConfiguration.Username));

            Action<string,Action<InternetAddress>> appendAddresses = (addressType, appenderAction) =>
            {
                if (string.IsNullOrEmpty(addressType))
                {
                    return;
                }
                var addresses = addressType.Split(',').Select(x => x.Trim()).ToList();
                foreach (var specificTo in addresses)
                {
                    appenderAction(MailboxAddress.Parse(specificTo));
                }
            };

            appendAddresses(emailConfiguration.To, message.To.Add);
            appendAddresses(emailConfiguration.Cc, message.Cc.Add);
            appendAddresses(emailConfiguration.Bcc, message.Bcc.Add);

            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = isHtml ? body : null,
                TextBody = isHtml ? null : body
            };

            if (attachments != null)
            {
                foreach (var filePath in attachments)
                {
                    if (File.Exists(filePath))
                        builder.Attachments.Add(filePath);
                    else
                        Console.WriteLine($"Attachment not found: {filePath}");
                }
            }

            message.Body = builder.ToMessageBody();
            return message;
        }

        private void Send(MimeMessage message)
        {
            if (!emailConfiguration.Enabled)
            {
                Console.WriteLine("Email sending is disabled via config.");
                return;
            }

            using var client = new SmtpClient();
            client.Connect(emailConfiguration.SmtpHost, emailConfiguration.SmtpPort, SecureSocketOptions.StartTls);
            client.Authenticate(emailConfiguration.Username, emailConfiguration.Password);
            client.Send(message);
            client.Disconnect(true);

            Console.WriteLine("Email sent successfully!");
        }
    }

}