
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace LahanShop.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailConfig;

        // Патерн Dependency Injection: .NET сам передасть сюди налаштування з appsettings.json
        public EmailService(IOptions<EmailConfiguration> emailConfig)
        {
            _emailConfig = emailConfig.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            // --- ЕТАП 1: Формування листа (MimeMessage) ---
            var emailMessage = new MimeMessage();

            // Хто відправляє
            emailMessage.From.Add(new MailboxAddress(_emailConfig.SenderName, _emailConfig.SenderEmail));

            // Кому відправляємо (ім'я залишаємо пустим, передаємо лише email)
            emailMessage.To.Add(new MailboxAddress("", toEmail));

            // Тема листа
            emailMessage.Subject = subject;

            // Тіло листа (вказуємо TextFormat.Html, щоб працювали <b>, <a>, кнопки тощо)
            emailMessage.Body = new TextPart(TextFormat.Html) { Text = message };

            // --- ЕТАП 2: Робота з мережею (SMTP Клієнт) ---
            using var client = new SmtpClient();
            try
            {
                // 1. Підключаємось до сервера (StartTls гарантує зашифроване з'єднання)
                await client.ConnectAsync(_emailConfig.SmtpServer, _emailConfig.Port, SecureSocketOptions.StartTls);

                // 2. Авторизуємось за допомогою нашої пошти та паролю додатку
                await client.AuthenticateAsync(_emailConfig.SenderEmail, _emailConfig.Password);

                // 3. Відправляємо сформований лист
                await client.SendAsync(emailMessage);
            }
            catch (Exception ex)
            {
                // Якщо Google чи Azure заблокує запит, помилка впаде сюди
                // Тут в майбутньому можна додати логування (наприклад, ILogger)
                Console.WriteLine($"Помилка відправки листа: {ex.Message}");
                throw;
            }
            finally
            {
                // 4. Гарантовано відключаємось від сервера, навіть якщо була помилка
                await client.DisconnectAsync(true);
            }
        }
    
}
}
