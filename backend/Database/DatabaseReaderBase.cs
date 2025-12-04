using System.Collections.Immutable;
using System.Linq.Expressions;
using {{your-app-name}}.Database.Paging;
using Rocket.Libraries.DatabaseIntegrator;
using Rocket.Libraries.Qurious;

namespace {{your-app-name}}.Database
{
    public interface IDatabaseReaderBase<TModel> : IReaderBase<TModel, Guid>
        where TModel : Model 
    {
        Task<ImmutableList<TModel>> GetPageableAsync<TPageField>(
            int? page = null,
            ushort? pageSize = null,
            Expression<Func<TModel, TPageField>>? pagingField = null,
            bool orderAscending = true,
            Action<QBuilder>? onBeforeQuery = null);

        Task<ImmutableList<TModel>> GetManyByIdsAsync(
            IEnumerable<Guid> ids,
             Action<QBuilder>? onBeforeQuery = null);
    }
    public abstract class DatabaseReaderBase<TModel> : ReaderBase<TModel, Guid>
        where TModel : Model
    {
        public DatabaseReaderBase(
            IDatabaseHelper<Guid> databaseHelper)
             : base(databaseHelper)
        {
        }

        public async Task<TModel?> TryGetByIdAsync(Guid id, bool? showDeleted)
        {
            try
            {
                return await GetByIdAsync(id, showDeleted);
            }
            catch (Exception)
            {
                return null;
            }
        }
        public override async Task<TModel> GetByIdAsync(Guid id, bool? showDeleted)
        {
            var models = await GetManyByIdsAsync(new List<Guid> { id }, onBeforeQuery: (qBuilder) =>
            {
                if (!showDeleted.HasValue || (showDeleted.HasValue && showDeleted.Value == false))
                {
                    qBuilder
                        .UseTableBoundFilter<TModel>()
                        .WhereEqualTo(tModel => tModel.Deleted, 0);
                }

            });
            var result = models.FirstOrDefault();
            if (result == null)
            {
                throw new Exception($"No {typeof(TModel).Name} with id {id} found");
            }
            return result!;
        }

        public virtual async Task<ImmutableList<TModel>> GetManyByIdsAsync(
            IEnumerable<Guid> ids,
             Action<QBuilder>? onBeforeQuery = null)
        {
            if (ids == null)
            {
                return ImmutableList<TModel>.Empty;
            }

            var listOfIds = ids.ToList();
            if (listOfIds.Count == 0)
            {
                return ImmutableList<TModel>.Empty;
            }

            using (QBuilder qBuilder = new QBuilder(parameterize: false))
            {
                qBuilder
                    .UseSelector()
                    .Select<TModel>("*")
                    .Then()
                    .UseTableBoundFilter<TModel>()
                    .WhereIn(tModel => tModel.Id, listOfIds);

                if (onBeforeQuery != null)
                {
                    onBeforeQuery(qBuilder);
                }
                var result = await DatabaseHelper.GetManyAsync<TModel>(qBuilder.Build());
                return result;
            }
        }

        

        public virtual async Task<ImmutableList<TModel>> GetPageableAsync<TPageField>(
            int? page = null,
            ushort? pageSize = null,
            Expression<Func<TModel, TPageField>>? pagingField = null,
            bool orderAscending = true,
            Action<QBuilder>? onBeforeQuery = null
        )
        {
            using (QBuilder qBuilder = new QBuilder(parameterize: false))
            {
                var pagingPosition = PagingPositionFetcher.GetPosition(page, pageSize);
                qBuilder
                    .UseSelector()
                    .Select<TModel>("*")
                    .Then();

                if (pagingField == null)
                {
                    qBuilder
                        .UseMySqlServerPagingBuilder<TModel>()
                        .PageBy(
                            tModel => tModel.Created,
                            page: pagingPosition.Page,
                            pageSize: pagingPosition.PageSize,
                            orderAscending: orderAscending);
                }
                else
                {
                    qBuilder
                        .UseMySqlServerPagingBuilder<TModel>()
                        .PageBy(
                            pagingField,
                            page: pagingPosition.Page,
                            pageSize: pagingPosition.PageSize,
                            orderAscending: orderAscending);
                }

                if (onBeforeQuery != null)
                {
                    onBeforeQuery(qBuilder);
                }

                var query = qBuilder.Build();
                var result = await DatabaseHelper.GetManyAsync<TModel>(query);
                return result;
            }
        }
    }
}