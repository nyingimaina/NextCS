using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using auto_dial;

namespace {{your-app-name}}.Persistance
{
    public abstract class Model
    {
        public Guid Id { get; set; }

        public DateTime Created { get; set; }

        public DateTime Modified { get; set; }

        public bool Deleted { get; set; }
    }
}