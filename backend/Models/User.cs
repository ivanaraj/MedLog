using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public enum UserRole
{
    Doctor,
    Patient,
    Admin
}

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    
    [BsonRepresentation(BsonType.String)]
    public UserRole Role { get; set; } //doctor, patient, admin
    
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Gender { get; set; } = null!;

    [StringLength(13, MinimumLength = 13)]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "JMBG must have exactly 13 digits.")]
    public string Jmbg { get; set; } = null!; // for patients
    
    //specijalizacija za doktore
    
    public List<string>? SpecializationIds { get; set; } 
}
