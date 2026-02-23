using MongoDB.Driver;

public class UserService
{
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<Examination> _examinations;

    public UserService(IMongoClient client, IConfiguration config)
    {
        var database = client.GetDatabase("MedLogDb");
        _users = database.GetCollection<User>("Users");
        _examinations = database.GetCollection<Examination>("Examinations");
    }

    public async Task<List<User>> GetAsync() =>
        await _users.Find(_ => true).ToListAsync();
    public async Task CreateAsync(User user) =>
        await _users.InsertOneAsync(user);
    
    public async Task<User> GetUserById(string id) =>
    await _users.Find(user => user.Id == id).FirstOrDefaultAsync();

    public async Task<List<Examination>> GetPatientHistoryAsync(string patientId)
    {
        return await _examinations
            .Find(e => e.PatientId == patientId)
            .SortByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<List<string>?> GetDoctorSpecializationIdsAsync(string doctorId)
    {
        var doctor = await _users
            .Find(u => u.Id == doctorId && u.Role == UserRole.Doctor)
            .FirstOrDefaultAsync();
        if (doctor == null)
            return null;
        return doctor.SpecializationIds ?? new List<string>();
    }
}
