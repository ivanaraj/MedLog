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
        // 1. Pronađi korisnika
        var user = await _users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
        
        if (user == null) return null;

        // 2. Proveri da li je Admin ili Doktor (prema tvom zahtevu)
        if (user.Role != UserRole.Admin && user.Role != UserRole.Doctor)
        {
            throw new UnauthorizedAccessException("Samo administratori i doktori mogu da se prijave.");
        }

        // 3. Proveri lozinku (BCrypt proverava heš)
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!isPasswordValid) return null;

        // 4. Generiši Token
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
        // Provera da li username već postoji
        var existingUser = await _users.Find(u => u.Username == newUser.Username).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            throw new ArgumentException("Korisničko ime već postoji.");
        }

        // Heširanje lozinke pre čuvanja u bazu
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

        // Ubacivanje podataka u Payload (uključujući Rolu za frontend)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()), // OVO JE KLJUČNO ZA RUTE
            new Claim("FirstName", user.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8), // Token traje 8 sati
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}