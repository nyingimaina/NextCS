// This file is used by Code Analysis to maintain SuppressMessage
// attributes that are applied to this project.
// Project-level suppressions either have no target or are given
// a specific target and scoped to a namespace, type, member, etc.

using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage("Design", "CA1062:Validate arguments of public methods",
    Justification = "Project-level suppression; validate manually where needed",
    Scope = "module")]

[assembly: SuppressMessage("Usage", "CA2201:Do not raise reserved exception types",
    Justification = "Project-level suppression; intentional use of generic exceptions",
    Scope = "module")]
[assembly: SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "Statics are ugly>", Scope = "module")]
[assembly: SuppressMessage("Design", "CA1031:Do not catch general exception types", Justification = "Stop nagging", Scope = "module")]
[assembly: SuppressMessage("Design", "CA1002:Do not expose generic lists", Justification = "I want to re-initialize the list if i feel like it", Scope = "module")]
[assembly: SuppressMessage("Style", "IDE0008:Use explicit type", Justification = "I like vars", Scope = "module")]
[assembly: SuppressMessage("Maintainability", "CA1515:Consider making public types internal", Justification = "<Pending>", Scope = "module")]
[assembly: SuppressMessage("Style", "IDE0130:Namespace does not match folder structure", Justification = "<Pending>", Scope = "module")]
[assembly: SuppressMessage("Usage", "CA2227:Collection properties should be read only", Justification = "<Pending>", Scope = "module")]
