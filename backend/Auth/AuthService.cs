using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

public class AuthService
{
    private readonly IMongoCollection<User> _users;
    private readonly IConfiguration _config;

    public AuthService(IMongoClient client, IConfiguration config)
    {
        var database = client.GetDatabase("MedLogDb");
        _users = database.GetCollection<User>("Users");
        _config = config;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
        
        if (user == null) return null;

        if (user.Role != UserRole.Admin && user.Role != UserRole.Doctor)
        {
            throw new UnauthorizedAccessException("Samo administratori i doktori mogu da se prijave.");
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!isPasswordValid) return null;

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role.ToString()
        };
    }

    public async Task<User> RegisterAsync(User newUser)
    {
        var existingUser = await _users.Find(u => u.Username == newUser.Username).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            throw new ArgumentException("Korisničko ime već postoji.");
        }

        newUser.Password = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

        await _users.InsertOneAsync(newUser);
        return newUser;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
        ?? throw new InvalidOperationException("JWT_KEY nije pronadjen u .env fajlu.");
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()), 
            new Claim("FirstName", user.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8), 
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}