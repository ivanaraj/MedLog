using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Specialization
{
    public string? Id { get; set; }

    public string Name { get; set; } = null!;

    public List<ParameterDefinition> RequiredParameters { get; set; } = new();
}

public class ParameterDefinition 
    {
        public string Key { get; set; } = null!; 
        public string Label { get; set; } = null!; 
        public string Type { get; set; } = null!; 
        public string Unit { get; set; } = ""; 
    }