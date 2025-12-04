using Dapper.Contrib.Extensions;
using Rocket.Libraries.DatabaseIntegrator;

namespace {{your-app-name}}.Database
{
    public class Model : ModelBase<Guid>
    {
        public DateTime Modified { get; set; }

        [ExplicitKey]
        public override Guid Id { get => base.Id; set => base.Id = value; }
    }
}