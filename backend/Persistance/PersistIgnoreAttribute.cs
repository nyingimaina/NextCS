using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace {{your-app-name}}.Persistance
{
    [AttributeUsage(AttributeTargets.Property)]
    public class PersistIgnoreAttribute : Attribute
    {
    }

}