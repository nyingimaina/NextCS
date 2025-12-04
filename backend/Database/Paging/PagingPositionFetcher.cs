using System.Globalization;

namespace {{your-app-name}}.Database.Paging
{
    public static class PagingPositionFetcher
    {
        public const ushort LongestPage = ushort.MaxValue;

        public static PagingPosition GetPosition(int? page, ushort? pageSize)
        {
            return new PagingPosition
            {
                Page = GetSafePage(page),
                PageSize = GetSafePageSize(pageSize),
            };
        }

        private static uint GetSafePage(int? page)
        {
            if (page == null)
            {
                return 1;
            }
            else if (page < 1)
            {
                throw new Exception($"Page number '{page}' is invalid. The smallest allowable page number is '1'");
            }
            else
            {
                return uint.Parse(page.Value.ToString(CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
            }
        }

        private static ushort GetSafePageSize(ushort? pageSize)
        {
            if (pageSize == null)
            {
                return LongestPage;
            }
            else if (pageSize.Value < 1)
            {
                throw new Exception($"Page size cannot be '{pageSize.Value}' records long. Minimum possible size is 1");
            }
            else
            {
                return pageSize.Value;
            }
        }
    }
}