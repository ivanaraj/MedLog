using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] 

public class SpecializationController : ControllerBase
{
    private readonly SpecializationService _service;

    public SpecializationController(SpecializationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var specializations = await _service.GetAsync();
        return Ok(specializations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var spec = await _service.GetByIdAsync(id);
        if (spec == null) return NotFound();
        return Ok(spec);
    }


    [HttpPost]
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}