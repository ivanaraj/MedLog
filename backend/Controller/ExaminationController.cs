using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]

public class ExaminationController : ControllerBase
{
    private readonly ExaminationService _service;

    public ExaminationController(ExaminationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var examinations = await _service.GetAsync();
        return Ok(examinations);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Examination examination)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        await _service.CreateAsync(examination);
        return Ok(examination);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}