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

    public required string Username { get; set; }
    public required string Password { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required UserRole Role { get; set; } //doctor, patient, admin
    
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    [RegularExpression("^[M|F]$", ErrorMessage = "Gender must be 'M' or 'F'.")]
    public string? Gender { get; set; }

    [StringLength(13, MinimumLength = 13)]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "JMBG must have exactly 13 digits.")]
    public string? Jmbg { get; set; } // for patients
    
    //specijalizacija za doktore    
    public string? SpecializationId { get; set; } 
}
