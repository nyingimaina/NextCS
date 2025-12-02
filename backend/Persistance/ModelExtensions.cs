using System;
using System.Collections.Generic;
using System.Linq;

namespace {{your-app-name}}.Persistance
{
    public static class ModelExtensions
    {
        private static readonly Dictionary<Type, object> _stores = new();
        private static readonly object _lock = new();

        private static FilePersistence<T> GetPersistence<T>() where T : Model, new()
        {
            lock (_lock)
            {
                if (!_stores.TryGetValue(typeof(T), out var persistence))
                {
                    persistence = new FilePersistence<T>(a => a.Id.ToString());
                    _stores[typeof(T)] = persistence;
                }

                return (FilePersistence<T>)persistence;
            }
        }

        public static T Upsert<T>(this T model) where T : Model, new()
        {
            if (model.Id == default)
            {
                model.Id = Guid.NewGuid();
                model.Created = DateTime.UtcNow;
            }

            model.Modified = DateTime.UtcNow;
            GetPersistence<T>().Upsert(model);

            return model;
        }

        public static T HardDelete<T>(this T model) where T : Model, new()
        {
            GetPersistence<T>().HardDelete(model);
            return model;
        }

        public static T SoftDelete<T>(this T model) where T : Model, new()
        {
            model.Deleted = true;
            model.Upsert();
            return model;
        }

        public static IReadOnlyCollection<T> GetAll<T>(this T? _) where T : Model, new()
            => GetPersistence<T>().GetAll();

        public static T? GetById<T>(this T? _, Guid id) where T : Model, new()
            => GetPersistence<T>().GetAll().FirstOrDefault(a => a.Id == id);



        public static IReadOnlyList<T> GetPage<T>(this T? _, int page, int pageSize, bool fromEnd) where T : Model, new()
            => GetPersistence<T>().GetPage(page, pageSize, fromEnd);

        public static T? GetLast<T>(this T? _) where T : Model, new()
            => GetPersistence<T>().GetPage(pageNumber: 1, pageSize: 1, fromEnd: true).SingleOrDefault();

        public static T? GetFirst<T>(this T? _) where T : Model, new()
            => GetPersistence<T>().GetPage(pageNumber: 1, pageSize: 1, fromEnd: false).SingleOrDefault();
        
    }
}
