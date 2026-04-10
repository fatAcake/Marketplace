using System.Security.Claims;

public static class Methods
{
    public static int GetCurrentUserId(ClaimsPrincipal User)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !int.TryParse(idClaim.Value, out int userId))
                throw new UnauthorizedAccessException("User ID not found in token");
            return userId;
        }
}