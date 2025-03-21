using ERP.API.DTOs;
using ERP.API.Services;
using ERP.Core.Entities;
using ERP.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERP.API.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<UserRole> _userRolesRepository;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IRepository<User> userRepository,
            IRepository<Role> roleRepository,
            IRepository<UserRole> userRolesRepository,
            JwtService jwtService,
            ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _userRolesRepository = userRolesRepository;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            _logger.LogInformation("Login attempt for user: {Username}", loginDto.Username);
            
            var users = await _userRepository.FindAsync(u => 
                u.Username.ToLower() == loginDto.Username.ToLower() || 
                u.Email.ToLower() == loginDto.Username.ToLower());
            
            var user = users.FirstOrDefault();
            
            if (user == null)
            {
                _logger.LogWarning("User not found for login: {Username}", loginDto.Username);
                return Unauthorized(new { message = "Invalid username or password" });
            }
            
            // In a real app, you would verify the password hash
            // For simplicity, we're just comparing the raw value in this demo
            if (user.PasswordHash != loginDto.Password)
            {
                _logger.LogWarning("Invalid password for user: {Username}", loginDto.Username);
                return Unauthorized(new { message = "Invalid username or password" });
            }
            
            // Get user roles
            var userRoles = await _userRolesRepository.FindAsync(ur => ur.UserId == user.Id);
            var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
            var roles = await _roleRepository.FindAsync(r => roleIds.Contains(r.Id));
            
            // Create claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };
            
            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name));
            }
            
            // Generate token
            var token = _jwtService.GenerateToken(claims);
            
            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            
            // Return the token
            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles.Select(r => r.Name).ToList()
            });
        }
    }
}
