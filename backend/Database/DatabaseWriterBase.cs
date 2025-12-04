using {{your-app-name}}.HttpHeaders;
using Rocket.Libraries.DatabaseIntegrator;
using Rocket.Libraries.FormValidationHelper;

namespace {{your-app-name}}.Database
{
    public interface IDatabaseWriterBase<TModel> : IWriterBase<TModel, Guid>
        where TModel : Model
    {
        Task<ValidationResponse<Guid>> UpsertAsync(TModel model);
    }

    public class DatabaseWriterBase<TModel> : WriterBase<TModel, Guid>
        where TModel : Model
    {
        private readonly IStandardHeaderReader standardHeaderReader;

        public DatabaseWriterBase(
            IDatabaseHelper<Guid> databaseHelper,
            IReaderBase<TModel, Guid> reader,
            IStandardHeaderReader standardHeaderReader)
             : base(databaseHelper, reader)
        {
            this.standardHeaderReader = standardHeaderReader;
        }

        [Obsolete($"Use {nameof(UpsertAsync)}")]
#pragma warning disable CS0809 // Obsolete member overrides non-obsolete member
        public override Task<ValidationResponse<Guid>> InsertAsync(TModel model)
#pragma warning restore CS0809 // Obsolete member overrides non-obsolete member
        {
            throw new NotImplementedException();
        }

        [Obsolete($"Use {nameof(UpdateAsync)}")]
#pragma warning disable CS0809 // Obsolete member overrides non-obsolete member
        public override Task<ValidationResponse<Guid>> UpdateAsync(TModel model)
#pragma warning restore CS0809 // Obsolete member overrides non-obsolete member
        {
            throw new NotImplementedException();
        }

        public virtual async Task<ValidationResponse<Guid>> UpsertAsync(TModel model)
        {
            model.Modified = DateTime.Now;
            SetUserIdIfRequired(model);
            SetCompanyIdIfRequired(model);

            if (model.Id == default)
            {
                model.Created = DateTime.Now;
                model.Id = Guid.NewGuid();
                return await base.InsertAsync(model);
            }
            else
            {
                return await base.UpdateAsync(model);
            }
        }

        private void SetCompanyIdIfRequired(TModel model)
        {
            var companyModel = model as CompanyModel;
            if (companyModel != null)
            {
                companyModel.CompanyId = standardHeaderReader.CompanyId;
            }
        }

        private void SetUserIdIfRequired(TModel model)
        {
            var userModel = model as UserModel;
            if (userModel != null)
            {
                userModel.UserId = standardHeaderReader.UserId;
            }
        }
    }
}