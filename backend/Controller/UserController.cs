using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class UserController : ControllerBase
{
    private readonly UserService _service;

    public UserController(UserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _service.GetAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _service.GetUserById(id);
        return Ok(user);
    }


    [HttpGet("doctor/{doctorId}/specialization")]
    public async Task<ActionResult<List<string>>> GetDoctorSpecializationId(string doctorId)
    {
        if (string.IsNullOrWhiteSpace(doctorId))
        {
            return BadRequest("Doctor ID must not be empty.");
        }
        var specializationId = await _service.GetDoctorSpecializationIdAsync(doctorId);
        if (specializationId == "")
        {
            return NotFound("Doctor not found or user is not a doctor.");
        }
        return Ok(specializationId);
    }

    [HttpGet("patients")]
    [Authorize(Roles = "Doctor,Admin")] 
    public async Task<IActionResult> GetPatients(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? searchTerm = null)
    {
        if (pageSize > 100) pageSize = 100;
        if (page < 1) page = 1;

        var result = await _service.GetPatientsAsync(page, pageSize, searchTerm);

        var response = new
        {
            Items = result.Patients,
            TotalCount = result.TotalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(result.TotalCount / (double)pageSize)
        };

        return Ok(response);
    }
}
