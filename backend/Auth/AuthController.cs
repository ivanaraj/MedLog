using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized("Pogrešno korisničko ime ili lozinka.");
            }
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin,Doctor")] 
    public async Task<IActionResult> Register([FromBody] User user)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var createdUser = await _authService.RegisterAsync(user);
            return Ok(new { Message = "Korisnik uspesno kreiran", Username = createdUser.Username });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}