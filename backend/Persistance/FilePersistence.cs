using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;

namespace {{your-app-name}}.Persistance
{
    public class FilePersistence<T> where T : class, new()
    {
        private readonly string _filePath;
        private readonly Func<T, string> _idSelector;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ReaderWriterLockSlim _lock = new();

        public string FilePath => _filePath;

        public FilePersistence(Func<T, string> idSelector)
            : this()
        {
            

            _idSelector = idSelector;

           
        }

        public FilePersistence()
        {
            var programDataDir = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
            _filePath = Path.Combine(programDataDir, "Contrail", "Data", $"{typeof(T).Name}.ndjson");
            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
            _idSelector = _ => string.Empty;
             _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            _jsonOptions.Converters.Add(new PersistenceConverter<T>());

        }

        public IReadOnlyList<T> GetPage(int pageNumber, int pageSize, bool fromEnd = false)
        {
            if (pageNumber <= 0) throw new ArgumentOutOfRangeException(nameof(pageNumber));
            if (pageSize <= 0) throw new ArgumentOutOfRangeException(nameof(pageSize));

            _lock.EnterReadLock();
            try
            {
                if (!File.Exists(FilePath)) return new List<T>();
                return fromEnd ? LoadPageReverse(pageNumber, pageSize) : LoadPageForward(pageNumber, pageSize);
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        public IReadOnlyList<T> GetAll() => ReadAllLinesFromFile();

        public void Upsert(T entity) => ModifyFile(entity, isDelete: false);

        public void HardDelete(T entity) => ModifyFile(entity, isDelete: true);

        private void AppendLine(T entity)
        {
            using var fs = new FileStream(FilePath, FileMode.Append, FileAccess.Write, FileShare.Read);
            using var sw = new StreamWriter(fs, new UTF8Encoding(false)); // NO BOM
            sw.WriteLine(JsonSerializer.Serialize(entity, _jsonOptions));
            sw.Flush();
            fs.Flush(true);
        }

        private IReadOnlyList<T> LoadPageForward(int pageNumber, int pageSize)
        {
            var skip = (pageNumber - 1) * pageSize;
            return ReadLinesFromFile().Skip(skip).Take(pageSize).ToList();
        }

        private IReadOnlyList<T> LoadPageReverse(int pageNumber, int pageSize)
        {
            var lines = new List<string>(pageSize);
            using var fs = new FileStream(FilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            long position = fs.Length - 1;
            int lineCount = 0;
            var sb = new StringBuilder();
            int linesToSkip = (pageNumber - 1) * pageSize;

            while (position >= 0)
            {
                fs.Seek(position, SeekOrigin.Begin);
                int b = fs.ReadByte();

                if (b == '\n')
                {
                    if (sb.Length > 0)
                    {
                        string line = new string(sb.ToString().Reverse().ToArray());
                        if (lineCount >= linesToSkip)
                        {
                            lines.Add(line);
                            if (lines.Count >= pageSize) break;
                        }
                        sb.Clear();
                        lineCount++;
                    }
                }
                else
                {
                    sb.Append((char)b);
                }

                position--;
            }

            if (sb.Length > 0 && lineCount >= linesToSkip && lines.Count < pageSize)
            {
                string line = new string(sb.ToString().Reverse().ToArray());
                lines.Add(line);
            }

            

            return lines
                .Select(line => JsonSerializer.Deserialize<T>(line, _jsonOptions))
                .Where(x => x != null)
                .ToList()!;
        }

        private List<T> ReadAllLinesFromFile()
        {
            _lock.EnterReadLock();
            try
            {
                return ReadLinesFromFile().ToList();
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }

        private IEnumerable<T> ReadLinesFromFile()
        {
            if (!File.Exists(FilePath)) yield break;

            foreach (var line in File.ReadLines(FilePath))
            {
                var obj = JsonSerializer.Deserialize<T>(line, _jsonOptions);
                if (obj != null) yield return obj;
            }
        }

        private void ModifyFile(T entity, bool isDelete)
        {
            var id = _idSelector(entity);
            _lock.EnterWriteLock();
            try
            {
                if (!File.Exists(FilePath) && !isDelete)
                {
                    AppendLine(entity);
                    return;
                }

                var tempFile = FilePath + ".tmp";
                bool updated = false;

                using (var sr = new StreamReader(FilePath, new UTF8Encoding(false))) // NO BOM
                using (var sw = new StreamWriter(tempFile, false, new UTF8Encoding(false))) // NO BOM
                {
                    string? line;
                    while ((line = sr.ReadLine()) != null)
                    {
                        var obj = JsonSerializer.Deserialize<T>(line, _jsonOptions);
                        if (obj == null) continue;

                        var currentId = _idSelector(obj);
                        if (currentId == id)
                        {
                            if (!isDelete)
                            {
                                sw.WriteLine(JsonSerializer.Serialize(entity, _jsonOptions));
                                updated = true;
                            }
                        }
                        else
                        {
                            sw.WriteLine(line);
                        }
                    }

                    if (!isDelete && !updated)
                        sw.WriteLine(JsonSerializer.Serialize(entity, _jsonOptions));

                    sw.Flush();
                    sw.BaseStream.Flush();
                }

                File.Replace(tempFile, FilePath, null, true);
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }
    }
}
