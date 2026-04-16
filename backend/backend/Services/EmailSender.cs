using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }

    public class EmailSender : IEmailSender
    {
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _senderEmail;
        private readonly string _senderName;
        private readonly string _smtpUser;
        private readonly string _smtpPassword;

        public EmailSender(string smtpServer, int smtpPort, string senderEmail,
            string senderName, string smtpUser, string smtpPassword)
        {
            _smtpServer = smtpServer;
            _smtpPort = smtpPort;
            _senderEmail = senderEmail;
            _senderName = senderName;
            _smtpUser = smtpUser;
            _smtpPassword = smtpPassword;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_senderName, _senderEmail));
            message.To.Add(MailboxAddress.Parse(email));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlMessage };

            using var client = new SmtpClient();

            await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(_smtpUser, _smtpPassword);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}