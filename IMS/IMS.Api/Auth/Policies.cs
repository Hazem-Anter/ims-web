namespace IMS.Api.Auth
{
    // Centralized definition of authorization policies used across the API.
    public static class Policies
    {
        public const string AdminOnly = "AdminOnly";

        public const string UserManagement = "UserManagement";

        public const string InventoryRead = "InventoryRead";

        public const string InventoryWrite = "InventoryWrite";

        public const string ReportsRead = "ReportsRead";

        public const string DashboardRead = "DashboardRead";
    }
}
