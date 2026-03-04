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
            _ => element.ToString()! 
        };
    }

    public async Task DeleteAsync(string id) =>
        await _examinations.DeleteOneAsync(e => e.Id == id);


    public async Task<(List<Examination> Examinations, long TotalCount)> GetPatientHistoryAsync(string patientId, int page = 1, int pageSize = 10)
    {
        var filter = Builders<Examination>.Filter.Eq(e => e.PatientId, patientId);

        var totalCount = await _examinations.CountDocumentsAsync(filter);

        var examinations = await _examinations
            .Find(filter)
            .SortByDescending(e => e.Date)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (examinations, totalCount);
    }

}