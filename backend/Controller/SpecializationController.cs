using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class SpecializationController : ControllerBase
{
    private readonly SpecializationService _service;

    public SpecializationController(SpecializationService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> Get()
    {
        var specializations = await _service.GetAsync();
        return Ok(specializations);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> GetById(string id)
    {
        var spec = await _service.GetByIdAsync(id);
        if (spec == null) return NotFound();
        return Ok(spec);
    }


    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Specialization specialization)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        await _service.CreateAsync(specialization);
        return Ok(specialization);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}