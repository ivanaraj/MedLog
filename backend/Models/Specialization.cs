using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Specialization
{
    public string? Id { get; set; }

    public required string Name { get; set; } 

    public List<ParameterDefinition> RequiredParameters { get; set; } = new();
}

public class ParameterDefinition 
{
    public required string Key { get; set; }  
    public required string Label { get; set; } 
    public required string Type { get; set; } 
    public string Unit { get; set; } = ""; 
}