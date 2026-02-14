using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

public class SpecializationService
{
    private readonly IMongoCollection<Specialization> _specializations;

    public SpecializationService(IMongoClient client, IConfiguration config)
    {
        var database = client.GetDatabase("MedLogDb");
        _specializations = database.GetCollection<Specialization>("Specializations");
    }

    public async Task<List<Specialization>> GetAsync() =>
        await _specializations.Find(_ => true).ToListAsync();
    
    public async Task CreateAsync(Specialization specialization) 
    {
        var spec = await _specializations.Find(s => s.Id == specialization.Id).FirstOrDefaultAsync();
        if (spec != null)
        {
            throw new ArgumentException("Specialization with this ID already exists.");
        }
        await _specializations.InsertOneAsync(specialization);

    }

    public async Task DeleteAsync(string id) =>
        await _specializations.DeleteOneAsync(s => s.Id == id);
}