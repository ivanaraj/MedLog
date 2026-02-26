using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Examination
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public required DateTime Date { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public required string PatientId { get; set; }
    
    [BsonRepresentation(BsonType.ObjectId)]
    public required string DoctorId { get; set; }
    public required string SpecializationId { get; set; }
    public required string Diagnosis { get; set; }
    public Dictionary<string, object> Data{ get; set; } = new();

}