using MongoDB.Driver;
using MongoDB.Bson;

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

    public async Task<User> GetUserById(string id) =>
    await _users.Find(user => user.Id == id).FirstOrDefaultAsync();


    public async Task<string> GetDoctorSpecializationIdAsync(string doctorId)
    {
        var doctor = await _users
            .Find(u => u.Id == doctorId && u.Role == UserRole.Doctor)
            .FirstOrDefaultAsync();
        if (doctor == null)
            throw new ArgumentException("Doctor not found with the given ID.");
        return doctor.SpecializationId ?? "";
    }

    public async Task<(List<User> Patients, long TotalCount)> GetPatientsAsync(int page = 1, int pageSize = 10, string? searchTerm = null)
    {
        var filterBuilder = Builders<User>.Filter;

        var filter = filterBuilder.Eq(u => u.Role, UserRole.Patient);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchFilter = filterBuilder.Or(
                filterBuilder.Regex(u => u.FirstName, new BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(u => u.LastName, new BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(u => u.Jmbg, new BsonRegularExpression(searchTerm, "i"))
            );

            filter = filterBuilder.And(filter, searchFilter);
        }

        var totalCount = await _users.CountDocumentsAsync(filter);

        var patients = await _users.Find(filter)
            .Skip((page - 1) * pageSize) 
            .Limit(pageSize)
            .ToListAsync();

        return (patients, totalCount);
    }

}
