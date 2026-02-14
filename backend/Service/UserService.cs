using MongoDB.Driver;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(IMongoClient client, IConfiguration config)
    {
        var database = client.GetDatabase("MedLogDb");
        _users = database.GetCollection<User>("Users");
    }

    public async Task<List<User>> GetAsync() =>
        await _users.Find(_ => true).ToListAsync();
    public async Task CreateAsync(User user) =>
        await _users.InsertOneAsync(user);
}
