using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class BaseApiController : ControllerBase
    {
        protected IActionResult ValidateModelState()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            return null;
        }

        protected IActionResult HandleException(Exception ex, ILogger logger, string message)
        {
            logger.LogError(ex, message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }

        protected IActionResult NotFoundError(string error) => NotFound(new { error });

        protected IActionResult BadRequestError(string error) => BadRequest(new { error });

        protected IActionResult OkMessage(string message) => Ok(new { message });
    }
}