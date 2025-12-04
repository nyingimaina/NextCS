using System.Data;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Rocket.Libraries.DatabaseIntegrator;

namespace {{your-app-name}}.Database
{
    public class DatabaseConnectionProvider : IConnectionProvider
    {
        private readonly string connectionString;

        public DatabaseConnectionProvider(
            IOptions<DatabaseConnectionSettings> databaseOptions)
        {

            connectionString = databaseOptions.Value.ConnectionString;
        }

        public IDbConnection Get(string connectionString)
        {
            var connection = new MySqlConnection(connectionString);
            
            return connection;
        }
    }
}