using System.Data;
using Dapper;

namespace {{your-app-name}}.Database.TypeHandlers
{
    public class HashSetTypeHandler: SqlMapper.TypeHandler<HashSet<string>>
    {
        public override HashSet<string> Parse(object value)
        {
            if (value == null)
            {
                return new HashSet<string>();
            }
            return new HashSet<string>(value.ToString()!.Split(','), StringComparer.OrdinalIgnoreCase);
        }

        public override void SetValue(IDbDataParameter parameter, HashSet<string>? value)
        {
            parameter.Value = string.Join(",", value ?? new HashSet<string>());
        }
    }
}