namespace Contrail
{
    public static class Statics
    {
        public const string ApplicationName = "{{your-app-name}}";

        public static string TryGetInWorkingDirectory(string path)
        {
            return TryGetInSpecialDirectory(specialDirectory: "WorkingDirectory", path);
        }

        public static string TryGetInLogsDirectory(string path)
        {
            return TryGetInSpecialDirectory(specialDirectory: "Logs", path);
        }

        public static string TryGetInExecutablePath(string path)
        {
            if (Path.IsPathRooted(path))
            {
                return path;
            }
            var executingAssemblyPath = System.Reflection.Assembly.GetExecutingAssembly().Location;
            return Path.Combine(Path.GetDirectoryName(executingAssemblyPath)!, path);

        }
        
        public static string TryGetInDependenciesDirectory(string path)
        {
            return TryGetInSpecialDirectory(specialDirectory: "Dependencies", path);
        }

        private static string TryGetInSpecialDirectory(string specialDirectory, string path)
        {
            var isAbsolutePath = Path.IsPathRooted(path);
            if (isAbsolutePath)
            {
                return path;
            }
            var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
            var fullPath = Path.Combine(programData, ApplicationName, specialDirectory, path);
            var targetDirectory = Path.GetDirectoryName(fullPath);
            if (!Directory.Exists(targetDirectory!))
            {
                Directory.CreateDirectory(targetDirectory!);
            }
            return fullPath;
        }
    }
}