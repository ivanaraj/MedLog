using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Doctor")]

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

    [HttpGet("patient/{patientId}/history")]
    public async Task<IActionResult> GetPatientHistory(
    string patientId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(patientId))
        {
            return BadRequest("ID pacijenta ne sme biti prazan.");
        }

        if (pageSize > 50) pageSize = 50;
        if (page < 1) page = 1;

        var result = await _service.GetPatientHistoryAsync(patientId, page, pageSize);

        var response = new
        {
            Items = result.Examinations,
            TotalCount = result.TotalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(result.TotalCount / (double)pageSize)
        };

        return Ok(response);
    }


}