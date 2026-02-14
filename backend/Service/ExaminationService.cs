using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Text.Json;

public class ExaminationService
{
    private readonly IMongoCollection<Examination> _examinations;

    public ExaminationService(IMongoClient client, IConfiguration config)
    {
        var database = client.GetDatabase("MedLogDb");
        _examinations = database.GetCollection<Examination>("Examinations");
    }

    public async Task<List<Examination>> GetAsync() =>
        await _examinations.Find(_ => true).ToListAsync();
    
    public async Task CreateAsync(Examination examination)
    {
        var cleanedData = new Dictionary<string, object>();
        
        foreach (var kvp in examination.Data)
        {
            if (kvp.Value is JsonElement jsonElement)
            {
                cleanedData[kvp.Key] = ConvertJsonElement(jsonElement);
            }
            else
            {
                cleanedData[kvp.Key] = kvp.Value;
            }
        }
        
        examination.Data = cleanedData;

        await _examinations.InsertOneAsync(examination);
    }

    private object ConvertJsonElement(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString()!,
            JsonValueKind.Number => element.TryGetInt32(out var i) ? i : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => element.ToString()! // Za objekte i nizove, jednostavno ih čuvamo kao string
        };
    }

    public async Task DeleteAsync(string id) =>
        await _examinations.DeleteOneAsync(e => e.Id == id);
}