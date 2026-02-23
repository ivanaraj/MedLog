using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
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

    [HttpPost]
    public async Task<IActionResult> Create(User user)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        await _service.CreateAsync(user);
        return Ok(user);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _service.GetUserById(id);
        return Ok(user);
    }

    [HttpGet("patient/{patientId}/history")]
        public async Task<ActionResult<List<Examination>>> GetPatientHistory(string patientId)
        {
            if (string.IsNullOrWhiteSpace(patientId))
            {
                return BadRequest("ID pacijenta ne sme biti prazan.");
            }
            var history = await _service.GetPatientHistoryAsync(patientId);
            if (history == null || history.Count == 0)
            {
                return Ok(new List<Examination>()); 
            }
            return Ok(history);
        }

[HttpGet("doctor/{doctorId}/specializations")]
    public async Task<ActionResult<List<string>>> GetDoctorSpecializationIds(string doctorId)
    {
        if (string.IsNullOrWhiteSpace(doctorId))
        {
            return BadRequest("ID doktora ne sme biti prazan.");
        }
        var specializationIds = await _service.GetDoctorSpecializationIdsAsync(doctorId);
        if (specializationIds == null)
        {
            return NotFound("Doktor sa prosleđenim ID-jem nije pronađen ili korisnik nije doktor.");
        }
        return Ok(specializationIds);
    }
}
