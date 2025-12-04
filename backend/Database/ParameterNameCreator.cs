using System.Linq.Expressions;

namespace {{your-app-name}}.Database
{
    public class ParameterNameCreator<TObject>
    {
        public string GetParameterName<TValue>(Expression<Func<TObject, TValue>> propertyExpression)
        {
            if (!(propertyExpression.Body is MemberExpression memberExpression))
            {
                throw new ArgumentException("Invalid expression. Please provide a valid property expression.");
            }

            var propertyInfo = memberExpression.Member as System.Reflection.PropertyInfo;
            if(propertyInfo == null)
            {
                throw new ArgumentException("Invalid expression. Please provide a valid property expression.");
            }
            return $"@{propertyInfo.Name}";
        }
    }
}