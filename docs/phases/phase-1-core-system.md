# Phase 1: Core System & User Management

## Overview

Fase 1 membangun fondasi sistem ISP Management dengan fokus pada manajemen pengguna, authentication, dan dashboard dasar. Fase ini dirancang untuk dapat berdiri sendiri dan memberikan nilai bisnis langsung.

## Duration: 3 Weeks

### Week 1: Core System Setup
### Week 2: User Management
### Week 3: Basic Dashboard

## Technical Requirements

### Technology Stack
- **Backend**: Laravel 10+ with PHP 8.1+
- **Frontend**: React 18+ with Vite
- **Database**: MySQL 8.0+ / PostgreSQL 13+
- **Cache**: Redis 6+
- **Authentication**: Laravel Sanctum
- **Queue**: Redis/Database

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "laravel/sanctum": "^3.2",
    "laravel/tinker": "^2.8",
    "spatie/laravel-permission": "^5.10",
    "intervention/image": "^2.7",
    "barryvdh/laravel-debugbar": "^3.8"
  },
  "frontend": {
    "react": "^18.2",
    "react-dom": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "tailwindcss": "^3.2",
    "@headlessui/react": "^1.7",
    "@heroicons/react": "^2.0"
  }
}
```

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
);
```

#### profiles
```sql
CREATE TABLE profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,
    postal_code VARCHAR(10) NULL,
    country VARCHAR(100) DEFAULT 'Indonesia',
    birth_date DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    photo VARCHAR(255) NULL,
    bio TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_user_id (user_id)
);
```

#### system_settings
```sql
CREATE TABLE system_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NULL,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    group_name VARCHAR(100) DEFAULT 'general',
    description TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_system_settings_key (key_name),
    INDEX idx_system_settings_group (group_name),
    INDEX idx_system_settings_is_public (is_public)
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    model_type VARCHAR(255) NULL,
    model_id BIGINT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_model (model_type, model_id),
    INDEX idx_audit_logs_created_at (created_at)
);
```

## API Design

### Authentication Endpoints

#### POST /api/auth/register
```php
// Request
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+628123456789"
}

// Response
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "customer",
            "is_active": true
        },
        "token": "1|abc123..."
    }
}
```

#### POST /api/auth/login
```php
// Request
{
    "email": "john@example.com",
    "password": "password123"
}

// Response
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "customer",
            "is_active": true
        },
        "token": "1|abc123..."
    }
}
```

#### POST /api/auth/logout
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "Logged out successfully"
}
```

### User Management Endpoints

#### GET /api/users
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, search, role, is_active

// Response
{
    "success": true,
    "data": {
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "customer",
                "is_active": true,
                "created_at": "2024-01-01T10:00:00Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 10,
            "total_items": 100,
            "per_page": 10
        }
    }
}
```

#### POST /api/users
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "staff",
    "is_active": true,
    "phone": "+628123456789",
    "profile": {
        "address": "Jl. Example No. 123",
        "city": "Jakarta",
        "province": "DKI Jakarta"
    }
}

// Response
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "user": {
            "id": 2,
            "name": "Jane Doe",
            "email": "jane@example.com",
            "role": "staff",
            "is_active": true
        }
    }
}
```

#### PUT /api/users/{id}
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "admin",
    "is_active": true,
    "profile": {
        "address": "Jl. Updated No. 456"
    }
}

// Response
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "user": {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "role": "admin",
            "is_active": true
        }
    }
}
```

#### DELETE /api/users/{id}
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "User deleted successfully"
}
```

### System Settings Endpoints

#### GET /api/settings
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: group, is_public

// Response
{
    "success": true,
    "data": {
        "settings": [
            {
                "key": "company_name",
                "value": "ISP Management System",
                "type": "string",
                "group": "general",
                "description": "Company name displayed in the system"
            }
        ]
    }
}
```

#### PUT /api/settings/{key}
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "value": "New Company Name",
    "type": "string"
}

// Response
{
    "success": true,
    "message": "Setting updated successfully",
    "data": {
        "key": "company_name",
        "value": "New Company Name"
    }
}
```

## Implementation Details

### Backend Implementation

#### User Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'is_active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function getIsAdminAttribute()
    {
        return $this->role === 'admin';
    }

    public function getIsStaffAttribute()
    {
        return $this->role === 'staff';
    }

    public function getIsCustomerAttribute()
    {
        return $this->role === 'customer';
    }
}
```

#### Profile Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'birth_date',
        'gender',
        'photo',
        'bio'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo 
            ? asset('storage/' . $this->photo)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->user->name);
    }
}
```

#### User Service
```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'] ?? 'customer',
                'is_active' => $data['is_active'] ?? true,
            ];

            $user = User::create($userData);

            if (isset($data['profile'])) {
                $user->profile()->create($data['profile']);
            }

            // Log audit
            activity()
                ->causedBy(auth()->user())
                ->performedOn($user)
                ->log('User created');

            return $user;
        });
    }

    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $oldValues = $user->toArray();

            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            if (isset($data['profile'])) {
                $user->profile()->update($data['profile']);
            }

            // Log audit
            activity()
                ->causedBy(auth()->user())
                ->performedOn($user)
                ->withProperties([
                    'old' => $oldValues,
                    'new' => $user->toArray()
                ])
                ->log('User updated');

            return $user;
        });
    }

    public function deleteUser(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Log audit
            activity()
                ->causedBy(auth()->user())
                ->performedOn($user)
                ->log('User deleted');

            return $user->delete();
        });
    }

    public function searchUsers(array $filters)
    {
        $query = User::with('profile');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }
}
```

#### Authentication Controller
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user->load('profile'),
                'token' => $token
            ]
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user->load('profile'),
                'token' => $token
            ]
        ]);
    }

    public function logout(): JsonResponse
    {
        auth()->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => auth()->user()->load('profile')
            ]
        ]);
    }
}
```

### Frontend Implementation

#### React Components Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── PasswordResetForm.jsx
│   ├── users/
│   │   ├── UserList.jsx
│   │   ├── UserForm.jsx
│   │   └── UserDetail.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── common/
│       ├── LoadingSpinner.jsx
│       ├── ErrorMessage.jsx
│       └── ConfirmDialog.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Users.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   └── userService.js
├── hooks/
│   ├── useAuth.js
│   └── useUsers.js
└── context/
    ├── AuthContext.js
    └── NotificationContext.js
```

#### Authentication Service
```javascript
// src/services/authService.js
import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
```

#### User Service
```javascript
// src/services/userService.js
import api from './api';

export const userService = {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async searchUsers(filters) {
    const response = await api.get('/users', { params: filters });
    return response.data;
  }
};
```

## Testing Requirements

### Unit Tests

#### User Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\UserService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = app(UserService::class);
    }

    public function test_can_create_user()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'role' => 'customer'
        ];

        $user = $this->userService->createUser($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals('customer', $user->role);
    }

    public function test_can_update_user()
    {
        $user = User::factory()->create();
        $updateData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com'
        ];

        $updatedUser = $this->userService->updateUser($user, $updateData);

        $this->assertEquals('Jane Doe', $updatedUser->name);
        $this->assertEquals('jane@example.com', $updatedUser->email);
    }

    public function test_can_delete_user()
    {
        $user = User::factory()->create();
        $result = $this->userService->deleteUser($user);

        $this->assertTrue($result);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }
}
```

#### Authentication Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'role'
                        ],
                        'token'
                    ]
                ]);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user',
                        'token'
                    ]
                ]);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }
}
```

### Integration Tests

#### User Management API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_get_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test_token')->plainTextToken;

        User::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->getJson('/api/users');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'users' => [
                            '*' => [
                                'id',
                                'name',
                                'email',
                                'role',
                                'is_active',
                                'created_at'
                            ]
                        ],
                        'pagination'
                    ]
                ]);
    }

    public function test_admin_can_create_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test_token')->plainTextToken;

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'staff'
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/users', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'role'
                        ]
                    ]
                ]);
    }
}
```

### Frontend Tests

#### Component Tests
```javascript
// src/components/__tests__/LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../auth/LoginForm';
import authService from '../../services/authService';

// Mock the authService
jest.mock('../../services/authService');

const MockLoginForm = () => {
  return (
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<MockLoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    authService.login.mockResolvedValue({
      success: true,
      data: {
        user: { id: 1, name: 'John Doe', email: 'john@example.com' },
        token: 'test-token'
      }
    });

    render(<MockLoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### .env.example
```env
APP_NAME="ISP Management System"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=isp_management
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### Docker Configuration

#### Dockerfile
```dockerfile
FROM php:8.1-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Run composer
RUN composer install --no-interaction --no-plugins --no-scripts --prefer-dist

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: isp-management-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./php/local.ini:/usr/local/etc/php/conf.d/local.ini
    networks:
      - isp-network

  webserver:
    image: nginx:alpine
    container_name: isp-management-webserver
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./:/var/www
      - ./nginx/conf.d/:/etc/nginx/conf.d/
    networks:
      - isp-network

  db:
    image: mysql:8.0
    container_name: isp-management-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: isp_management
      MYSQL_ROOT_PASSWORD: root
      MYSQL_PASSWORD: password
      MYSQL_USER: isp_user
    volumes:
      - dbdata:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - isp-network

  redis:
    image: redis:6-alpine
    container_name: isp-management-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - isp-network

networks:
  isp-network:
    driver: bridge

volumes:
  dbdata:
    driver: local
```

## Success Criteria

### Functional Requirements
- ✅ User registration and login system working
- ✅ Role-based access control implemented
- ✅ User management CRUD operations functional
- ✅ Basic dashboard displaying system overview
- ✅ Audit logging capturing all activities
- ✅ System settings management operational

### Performance Requirements
- ✅ API response time < 500ms for simple operations
- ✅ Dashboard load time < 2 seconds
- ✅ User authentication < 1 second
- ✅ Database query optimization implemented

### Security Requirements
- ✅ Password hashing with bcrypt
- ✅ API token authentication with Sanctum
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection implemented

### Quality Requirements
- ✅ Code coverage > 80% for critical components
- ✅ API documentation complete
- ✅ Error handling implemented
- ✅ Logging system operational

## Next Steps

Setelah Fase 1 selesai, sistem akan memiliki:
1. Foundation untuk user management
2. Authentication dan authorization system
3. Basic dashboard dan monitoring
4. Audit trail untuk compliance
5. Scalable architecture untuk fase berikutnya

Fase 2 akan membangun di atas fondasi ini dengan menambahkan MikroTik integration dan NAS management capabilities.