using System.Collections.Immutable;
using Rocket.Libraries.DatabaseIntegrator;
using Rocket.Libraries.Qurious;

namespace {{your-app-name}}.Database
{
    public static class QBuilderExtensions
    {
        public static QBuilder HandleDeletedRecords<TModel>(
            this QBuilder qBuilder,
            bool showDeleted)
             where TModel : Model
        {
            if (showDeleted == true)
            {
                return qBuilder;
            }
            else
            {
                qBuilder
                    .UseTableBoundFilter<TModel>()
                    .WhereEqualTo(table => table.Deleted, 0);
                return qBuilder;
            }
        }

        public static async Task<TModel?> GetSingleAsync<TModel>(
            this QBuilder qBuilder,
            IDatabaseHelper<Guid> databaseHelper
        )
            where TModel : Model
        {
            var results = await GetManyAsync<TModel>(
                qBuilder,
                databaseHelper
            );

            if(results == null)
            {
                return null;
            }
            else if(results.Count > 1)
            {
                throw new Exception($"Too many results {results.Count} expected only 1 record");   
            }
            return results.SingleOrDefault();
        }

        public static async Task<ImmutableList<TModel>> GetManyAsync<TModel>(
            this QBuilder qBuilder,
            IDatabaseHelper<Guid> databaseHelper
        )
            where TModel : Model
        {
            var builtQuery = qBuilder.BuildWithParameters();
            return await databaseHelper.GetManyAsync<TModel>(
                query: builtQuery.ParameterizedSql,
                parameters: builtQuery.Parameters
            );
        }

       


        public static QBuilder GetQBuilder()
        {
            return new QBuilder(parameterize: true);
        }
    }
}