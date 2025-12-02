using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace {{your-app-name}}.Persistance
{
    public class PersistenceConverter<T> : JsonConverter<T> where T : class, new()
    {
        private readonly PropertyInfo[] _properties;

        public PersistenceConverter()
        {
            _properties = typeof(T)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => !Attribute.IsDefined(p, typeof(PersistIgnoreAttribute)))
                .ToArray();
        }

        public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            var obj = new T();

            foreach (var prop in _properties)
            {
                if (doc.RootElement.TryGetProperty(prop.Name, out var jsonProp))
                {
                    var value = JsonSerializer.Deserialize(jsonProp.GetRawText(), prop.PropertyType, options);
                    prop.SetValue(obj, value);
                }
            }

            return obj;
        }

        public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();

            foreach (var prop in _properties)
            {
                var propValue = prop.GetValue(value);
                writer.WritePropertyName(prop.Name);
                JsonSerializer.Serialize(writer, propValue, prop.PropertyType, options);
            }

            writer.WriteEndObject();
        }

    }

}