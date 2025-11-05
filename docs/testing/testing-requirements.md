# Testing Requirements

## Overview

Testing requirements untuk ISP Management System mencakup unit testing, integration testing, functional testing, performance testing, dan security testing. Dokumen ini mendefinisikan strategi testing, tools, dan prosedur untuk memastikan kualitas sistem.

## Testing Strategy

### Testing Pyramid

```
    E2E Tests (5%)
   ─────────────────
  Integration Tests (15%)
 ─────────────────────────
Unit Tests (80%)
```

- **Unit Tests (80%)**: Test individual components and functions
- **Integration Tests (15%)**: Test interactions between components
- **End-to-End Tests (5%)**: Test complete user workflows

### Testing Types

#### 1. Unit Testing
- Test individual functions and methods
- Fast execution and isolation
- Mock external dependencies
- High code coverage requirement

#### 2. Integration Testing
- Test API endpoints
- Test database interactions
- Test external service integrations
- Test component interactions

#### 3. Functional Testing
- Test business logic
- Test user workflows
- Test feature requirements
- Test edge cases

#### 4. Performance Testing
- Load testing
- Stress testing
- Scalability testing
- Database performance

#### 5. Security Testing
- Authentication and authorization
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection

## Testing Tools & Frameworks

### Backend Testing (Laravel)

#### PHPUnit
```json
// composer.json
{
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "mockery/mockery": "^1.5",
        "fakerphp/faker": "^1.20",
        "laravel/pint": "^1.0",
        "laravel/dusk": "^7.0"
    }
}
```

#### Laravel Dusk (Browser Testing)
```bash
# Install Dusk
composer require laravel/dusk --dev

# Install Chrome driver
php artisan dusk:install
```

#### Laravel Telescope (Debugging)
```bash
# Install Telescope
composer require laravel/telescope --dev

# Install Horizon (Queue monitoring)
composer require laravel/horizon --dev
```

### Frontend Testing (React)

#### Jest & React Testing Library
```json
// package.json
{
    "devDependencies": {
        "@testing-library/jest-dom": "^5.16.5",
        "@testing-library/react": "^13.4.0",
        "@testing-library/user-event": "^14.4.3",
        "jest": "^29.5.0",
        "jest-environment-jsdom": "^29.5.0"
    }
}
```

#### Cypress (E2E Testing)
```json
// package.json
{
    "devDependencies": {
        "cypress": "^12.10.0",
        "@cypress/react": "^6.0.0",
        "@cypress/webpack-dev-server": "^2.0.0"
    }
}
```

### Performance Testing

#### Apache Bench (AB)
```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Run load test
ab -n 1000 -c 10 https://your-domain.com/api/health
```

#### JMeter
```xml
<!-- JMeter Test Plan -->
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="ISP Management Load Test" enabled="true">
      <stringProp name="TestPlan.comments">Load test for ISP Management System</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
  </hashTree>
</jmeterTestPlan>
```

### Security Testing

#### OWASP ZAP
```bash
# Install OWASP ZAP
docker pull owasp/zap2docker-stable

# Run security scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://your-domain.com
```

#### Laravel Security Audit
```bash
# Install security audit package
composer require enshrined/svg-sanitization --dev
composer require beyondcode/laravel-self-diagnosis --dev

# Run security audit
php artisan self-diagnosis
```

## Testing Environment Setup

### Database Configuration
```php
// config/database.php
'connections' => [
    'testing' => [
        'driver' => 'mysql',
        'host' => env('DB_TESTING_HOST', '127.0.0.1'),
        'port' => env('DB_TESTING_PORT', '3306'),
        'database' => env('DB_TESTING_DATABASE', 'isp_management_testing'),
        'username' => env('DB_TESTING_USERNAME', 'testing_user'),
        'password' => env('DB_TESTING_PASSWORD', 'testing_password'),
        'prefix' => '',
        'strict' => true,
        'engine' => null,
    ],
],
```

### Testing Environment Variables
```env
# .env.testing
APP_NAME="ISP Management System"
APP_ENV=testing
APP_KEY=base64:your_testing_app_key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=testing
DB_TESTING_HOST=127.0.0.1
DB_TESTING_PORT=3306
DB_TESTING_DATABASE=isp_management_testing
DB_TESTING_USERNAME=testing_user
DB_TESTING_PASSWORD=testing_password

CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array

MAIL_MAILER=array
```

### PHPUnit Configuration
```xml
<!-- phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="./vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         processIsolation="false"
         stopOnFailure="false"
         executionOrder="random"
         failOnWarning="true"
         failOnRisky="true"
         failOnEmptyTestSuite="true"
         beStrictAboutOutputDuringTests="true"
         verbose="true"
         cacheDirectory=".phpunit.cache"
         backupGlobals="false"
         backupStaticAttributes="false">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory suffix="Test.php">./tests/Integration</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./app</directory>
        </include>
        <exclude>
            <directory suffix=".php">./app/Console/Kernel.php</directory>
            <directory suffix=".php">./app/Exceptions</directory>
            <directory suffix=".php">./app/Http/Kernel.php</directory>
            <directory suffix=".php">./app/Providers</directory>
        </exclude>
        <report>
            <html outputDirectory="build/coverage"/>
            <text outputFile="build/coverage.txt"/>
            <clover outputFile="build/logs/clover.xml"/>
        </report>
    </coverage>
    <logging>
        <junit outputFile="build/report.junit.xml"/>
    </logging>
    <php>
        <server name="APP_ENV" value="testing"/>
        <server name="BCRYPT_ROUNDS" value="4"/>
        <server name="CACHE_DRIVER" value="array"/>
        <server name="DB_CONNECTION" value="testing"/>
        <server name="DB_DATABASE" value=":memory:"/>
        <server name="MAIL_MAILER" value="array"/>
        <server name="QUEUE_CONNECTION" value="sync"/>
        <server name="SESSION_DRIVER" value="array"/>
        <server name="TELESCOPE_ENABLED" value="false"/>
    </php>
</phpunit>
```

## Unit Testing

### Test Structure
```
tests/
├── Unit/
│   ├── Models/
│   │   ├── UserTest.php
│   │   ├── CustomerTest.php
│   │   ├── MikrotikDeviceTest.php
│   │   └── ...
│   ├── Services/
│   │   ├── MikrotikServiceTest.php
│   │   ├── PaymentServiceTest.php
│   │   └── ...
│   └── Helpers/
│       ├── NetworkHelperTest.php
│       └── ...
├── Feature/
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   ├── RegisterTest.php
│   │   └── ...
│   ├── API/
│   │   ├── CustomerAPITest.php
│   │   ├── MikrotikAPITest.php
│   │   └── ...
│   └── Web/
│       ├── DashboardTest.php
│       └── ...
└── Integration/
    ├── Database/
    │   ├── MigrationTest.php
    │   └── ...
    ├── External/
    │   ├── MikrotikIntegrationTest.php
    │   ├── PaymentGatewayTest.php
    │   └── ...
    └── Queue/
        ├── JobTest.php
        └── ...
```

### Model Testing Example
```php
<?php
// tests/Unit/Models/CustomerTest.php
namespace Tests\Unit\Models;

use App\Models\Customer;
use App\Models\ServicePlan;
use App\Models\Subscription;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_customer()
    {
        $customer = Customer::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789',
        ]);

        $this->assertInstanceOf(Customer::class, $customer);
        $this->assertEquals('John Doe', $customer->name);
        $this->assertEquals('john@example.com', $customer->email);
        $this->assertEquals('+628123456789', $customer->phone);
    }

    /** @test */
    public function it_has_many_subscriptions()
    {
        $customer = Customer::factory()->create();
        $servicePlan = ServicePlan::factory()->create();
        
        $subscription = Subscription::factory()->create([
            'customer_id' => $customer->id,
            'service_plan_id' => $servicePlan->id,
        ]);

        $this->assertCount(1, $customer->subscriptions);
        $this->assertEquals($subscription->id, $customer->subscriptions->first()->id);
    }

    /** @test */
    public function it_can_get_active_subscriptions()
    {
        $customer = Customer::factory()->create();
        $servicePlan = ServicePlan::factory()->create();
        
        $activeSubscription = Subscription::factory()->create([
            'customer_id' => $customer->id,
            'service_plan_id' => $servicePlan->id,
            'status' => 'active',
        ]);

        $inactiveSubscription = Subscription::factory()->create([
            'customer_id' => $customer->id,
            'service_plan_id' => $servicePlan->id,
            'status' => 'expired',
        ]);

        $this->assertCount(1, $customer->activeSubscriptions());
        $this->assertEquals($activeSubscription->id, $customer->activeSubscriptions()->first()->id);
    }

    /** @test */
    public function it_validates_email_format()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        Customer::factory()->create([
            'email' => 'invalid-email',
        ]);
    }

    /** @test */
    public function it_validates_phone_number_format()
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        Customer::factory()->create([
            'phone' => '12345',
        ]);
    }
}
```

### Service Testing Example
```php
<?php
// tests/Unit/Services/MikrotikServiceTest.php
namespace Tests\Unit\Services;

use App\Services\MikrotikService;
use App\Models\MikrotikDevice;
use Tests\TestCase;
use Mockery;
use RouterOS\Client;
use RouterOS\Query;

class MikrotikServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_connect_to_mikrotik_device()
    {
        $device = MikrotikDevice::factory()->create([
            'ip_address' => '192.168.1.1',
            'username' => 'admin',
            'password' => 'password',
            'port' => 8728,
        ]);

        $mockClient = Mockery::mock(Client::class);
        $mockClient->shouldReceive('connect')->once()->andReturn(true);

        $service = new MikrotikService($device);
        $service->setClient($mockClient);

        $this->assertTrue($service->connect());
    }

    /** @test */
    public function it_can_get_interface_list()
    {
        $device = MikrotikDevice::factory()->create();
        
        $mockClient = Mockery::mock(Client::class);
        $mockClient->shouldReceive('connect')->once()->andReturn(true);
        $mockClient->shouldReceive('query')->once()->andReturn([
            [
                '.id' => '*1',
                'name' => 'ether1',
                'type' => 'ether',
                'running' => 'true',
            ],
            [
                '.id' => '*2',
                'name' => 'ether2',
                'type' => 'ether',
                'running' => 'true',
            ],
        ]);

        $service = new MikrotikService($device);
        $service->setClient($mockClient);

        $interfaces = $service->getInterfaces();

        $this->assertCount(2, $interfaces);
        $this->assertEquals('ether1', $interfaces[0]['name']);
        $this->assertEquals('ether2', $interfaces[1]['name']);
    }

    /** @test */
    public function it_can_create_pppoe_user()
    {
        $device = MikrotikDevice::factory()->create();
        
        $mockClient = Mockery::mock(Client::class);
        $mockClient->shouldReceive('connect')->once()->andReturn(true);
        $mockClient->shouldReceive('query')->once()->andReturn([
            '.id' => '*1',
            'name' => 'testuser',
            'service' => 'pppoe',
        ]);

        $service = new MikrotikService($device);
        $service->setClient($mockClient);

        $result = $service->createPppoeUser('testuser', 'password', '10Mbps');

        $this->assertTrue($result);
    }

    /** @test */
    public function it_handles_connection_failure()
    {
        $device = MikrotikDevice::factory()->create();
        
        $mockClient = Mockery::mock(Client::class);
        $mockClient->shouldReceive('connect')->once()->andThrow(new \Exception('Connection failed'));

        $service = new MikrotikService($device);
        $service->setClient($mockClient);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Connection failed');
        
        $service->connect();
    }
}
```

## Integration Testing

### API Testing Example
```php
<?php
// tests/Feature/API/CustomerAPITest.php
namespace Tests\Feature\API;

use App\Models\Customer;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerAPITest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $user = User::factory()->create();
        Sanctum::actingAs($user);
    }

    /** @test */
    public function it_can_list_customers()
    {
        Customer::factory()->count(5)->create();

        $response = $this->getJson('/api/customers');

        $response->assertStatus(200)
                ->assertJsonCount(5, 'data')
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'phone',
                            'address',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                    'links',
                    'meta',
                ]);
    }

    /** @test */
    public function it_can_create_a_customer()
    {
        $customerData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => 'Jakarta, Indonesia',
        ];

        $response = $this->postJson('/api/customers', $customerData);

        $response->assertStatus(201)
                ->assertJson([
                    'data' => $customerData,
                ]);

        $this->assertDatabaseHas('customers', $customerData);
    }

    /** @test */
    public function it_validates_customer_creation_data()
    {
        $response = $this->postJson('/api/customers', [
            'name' => '',
            'email' => 'invalid-email',
            'phone' => '12345',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'phone']);
    }

    /** @test */
    public function it_can_show_a_customer()
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/customers/{$customer->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'phone' => $customer->phone,
                        'address' => $customer->address,
                    ],
                ]);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_customer()
    {
        $response = $this->getJson('/api/customers/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_update_a_customer()
    {
        $customer = Customer::factory()->create();
        $updateData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ];

        $response = $this->putJson("/api/customers/{$customer->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'data' => array_merge($updateData, [
                        'id' => $customer->id,
                        'phone' => $customer->phone,
                        'address' => $customer->address,
                    ]),
                ]);

        $this->assertDatabaseHas('customers', array_merge($updateData, [
            'id' => $customer->id,
        ]));
    }

    /** @test */
    public function it_can_delete_a_customer()
    {
        $customer = Customer::factory()->create();

        $response = $this->deleteJson("/api/customers/{$customer->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('customers', [
            'id' => $customer->id,
        ]);
    }
}
```

### Database Integration Testing
```php
<?php
// tests/Integration/Database/MigrationTest.php
namespace Tests\Integration\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_customers_table()
    {
        $this->assertTrue(Schema::hasTable('customers'));
        
        $expectedColumns = [
            'id', 'name', 'email', 'phone', 'address', 'created_at', 'updated_at', 'deleted_at'
        ];
        
        foreach ($expectedColumns as $column) {
            $this->assertTrue(Schema::hasColumn('customers', $column));
        }
    }

    /** @test */
    public function it_creates_mikrotik_devices_table()
    {
        $this->assertTrue(Schema::hasTable('mikrotik_devices'));
        
        $expectedColumns = [
            'id', 'name', 'ip_address', 'username', 'password', 'port', 
            'api_version', 'status', 'last_seen', 'created_at', 'updated_at'
        ];
        
        foreach ($expectedColumns as $column) {
            $this->assertTrue(Schema::hasColumn('mikrotik_devices', $column));
        }
    }

    /** @test */
    public function it_creates_foreign_key_constraints()
    {
        // Test customer-subscription relationship
        $this->assertTrue(Schema::hasColumn('subscriptions', 'customer_id'));
        
        // Test mikrotik device-monitoring data relationship
        $this->assertTrue(Schema::hasColumn('mikrotik_monitoring_data', 'device_id'));
        
        // Test payment-invoice relationship
        $this->assertTrue(Schema::hasColumn('payments', 'invoice_id'));
    }

    /** @test */
    public function it_creates_indexes_for_performance()
    {
        // Check for email index on customers table
        $indexes = \DB::select("SHOW INDEX FROM customers WHERE Key_name = 'customers_email_unique'");
        $this->assertNotEmpty($indexes);
        
        // Check for device status index
        $indexes = \DB::select("SHOW INDEX FROM mikrotik_devices WHERE Key_name = 'mikrotik_devices_status_index'");
        $this->assertNotEmpty($indexes);
    }
}
```

## Frontend Testing

### React Component Testing
```javascript
// tests/frontend/components/CustomerForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerForm from '../../../src/components/CustomerForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const renderWithProviders = (ui, { queryClient = createTestQueryClient() } = {}) => {
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );

    return render(ui, { wrapper: Wrapper });
};

describe('CustomerForm', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
    });

    test('renders form fields correctly', () => {
        renderWithProviders(<CustomerForm onSubmit={mockOnSubmit} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    test('validates required fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CustomerForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CustomerForm onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'invalid-email');

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('submits form with valid data', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CustomerForm onSubmit={mockOnSubmit} />);

        const formData = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+628123456789',
            address: 'Jakarta, Indonesia',
        };

        await user.type(screen.getByLabelText(/name/i), formData.name);
        await user.type(screen.getByLabelText(/email/i), formData.email);
        await user.type(screen.getByLabelText(/phone/i), formData.phone);
        await user.type(screen.getByLabelText(/address/i), formData.address);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(formData);
        });
    });

    test('loads customer data for editing', async () => {
        const customer = {
            id: 1,
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+628987654321',
            address: 'Bandung, Indonesia',
        };

        renderWithProviders(<CustomerForm customer={customer} onSubmit={mockOnSubmit} />);

        expect(screen.getByDisplayValue(customer.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(customer.email)).toBeInTheDocument();
        expect(screen.getByDisplayValue(customer.phone)).toBeInTheDocument();
        expect(screen.getByDisplayValue(customer.address)).toBeInTheDocument();
    });

    test('shows loading state during submission', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CustomerForm onSubmit={mockOnSubmit} />);

        const formData = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+628123456789',
            address: 'Jakarta, Indonesia',
        };

        await user.type(screen.getByLabelText(/name/i), formData.name);
        await user.type(screen.getByLabelText(/email/i), formData.email);
        await user.type(screen.getByLabelText(/phone/i), formData.phone);
        await user.type(screen.getByLabelText(/address/i), formData.address);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
```

### E2E Testing with Cypress
```javascript
// tests/e2e/customer-management.cy.js
describe('Customer Management', () => {
    beforeEach(() => {
        // Login before each test
        cy.login('admin@example.com', 'password');
        cy.visit('/customers');
    });

    it('displays customer list', () => {
        cy.get('[data-testid="customer-list"]').should('be.visible');
        cy.get('[data-testid="customer-item"]').should('have.length.greaterThan', 0);
    });

    it('can create a new customer', () => {
        cy.get('[data-testid="add-customer-btn"]').click();
        
        cy.get('[data-testid="customer-form"]').should('be.visible');
        
        cy.get('[data-testid="name-input"]').type('John Doe');
        cy.get('[data-testid="email-input"]').type('john@example.com');
        cy.get('[data-testid="phone-input"]').type('+628123456789');
        cy.get('[data-testid="address-input"]').type('Jakarta, Indonesia');
        
        cy.get('[data-testid="submit-btn"]').click();
        
        cy.get('[data-testid="success-message"]').should('contain', 'Customer created successfully');
        cy.get('[data-testid="customer-list"]').should('contain', 'John Doe');
    });

    it('can edit an existing customer', () => {
        cy.get('[data-testid="customer-item"]').first().within(() => {
            cy.get('[data-testid="edit-btn"]').click();
        });
        
        cy.get('[data-testid="customer-form"]').should('be.visible');
        
        cy.get('[data-testid="name-input"]').clear().type('Jane Doe');
        cy.get('[data-testid="submit-btn"]').click();
        
        cy.get('[data-testid="success-message"]').should('contain', 'Customer updated successfully');
        cy.get('[data-testid="customer-list"]').should('contain', 'Jane Doe');
    });

    it('can delete a customer', () => {
        cy.get('[data-testid="customer-item"]').first().within(() => {
            cy.get('[data-testid="delete-btn"]').click();
        });
        
        cy.get('[data-testid="confirm-dialog"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-btn"]').click();
        
        cy.get('[data-testid="success-message"]').should('contain', 'Customer deleted successfully');
    });

    it('validates form inputs', () => {
        cy.get('[data-testid="add-customer-btn"]').click();
        
        cy.get('[data-testid="submit-btn"]').click();
        
        cy.get('[data-testid="name-error"]').should('contain', 'Name is required');
        cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
        cy.get('[data-testid="phone-error"]').should('contain', 'Phone is required');
    });

    it('can search customers', () => {
        cy.get('[data-testid="search-input"]').type('John');
        cy.get('[data-testid="search-btn"]').click();
        
        cy.get('[data-testid="customer-item"]').should('contain', 'John');
    });

    it('can filter customers by status', () => {
        cy.get('[data-testid="status-filter"]').select('active');
        cy.get('[data-testid="filter-btn"]').click();
        
        cy.get('[data-testid="customer-item"]').each(($el) => {
            cy.wrap($el).should('contain', 'Active');
        });
    });
});
```

## Performance Testing

### Load Testing Script
```php
<?php
// tests/Performance/LoadTest.php
namespace Tests\Performance;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LoadTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function api_can_handle_concurrent_requests()
    {
        $concurrentRequests = 50;
        $responses = [];

        // Create test data
        Customer::factory()->count(100)->create();

        // Simulate concurrent requests
        for ($i = 0; $i < $concurrentRequests; $i++) {
            $responses[] = $this->getJson('/api/customers?page=' . ($i % 10 + 1));
        }

        // Assert all responses are successful
        foreach ($responses as $response) {
            $response->assertStatus(200);
        }

        // Assert response time is reasonable (less than 1 second)
        foreach ($responses as $response) {
            $this->assertLessThan(1000, $response->response->getServerVariable('REQUEST_TIME_FLOAT'));
        }
    }

    /** @test */
    public function database_queries_are_optimized()
    {
        // Enable query logging
        \DB::enableQueryLog();

        // Create test data with relationships
        $customers = Customer::factory()->count(10)->create();
        foreach ($customers as $customer) {
            Subscription::factory()->count(3)->create(['customer_id' => $customer->id]);
        }

        // Make request that should use eager loading
        $response = $this->getJson('/api/customers?include=subscriptions');

        // Get query count
        $queryCount = count(\DB::getQueryLog());

        // Assert we're not making N+1 queries
        $this->assertLessThan(5, $queryCount);

        \DB::disableQueryLog();
    }

    /** @test */
    public function memory_usage_is_within_limits()
    {
        $initialMemory = memory_get_usage();

        // Create large dataset
        Customer::factory()->count(1000)->create();

        // Process data
        $customers = Customer::all()->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ];
        });

        $finalMemory = memory_get_usage();
        $memoryUsed = $finalMemory - $initialMemory;

        // Assert memory usage is reasonable (less than 50MB)
        $this->assertLessThan(50 * 1024 * 1024, $memoryUsed);
    }
}
```

### JMeter Test Plan
```xml
<!-- tests/performance/api-load-test.jmx -->
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="ISP Management API Load Test" enabled="true">
      <stringProp name="TestPlan.comments">Load test for ISP Management API endpoints</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_URL" elementType="Argument">
            <stringProp name="Argument.name">BASE_URL</stringProp>
            <stringProp name="Argument.value">https://api.your-domain.com</stringProp>
          </elementProp>
          <elementProp name="API_TOKEN" elementType="Argument">
            <stringProp name="Argument.name">API_TOKEN</stringProp>
            <stringProp name="Argument.value">your-api-token</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="API Load Test" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">100</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Get Customers" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain">${BASE_URL}</stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol">https</stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">/api/customers</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
        </HTTPSamplerProxy>
        <hashTree>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager" enabled="true">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Authorization</stringProp>
                <stringProp name="Header.value">Bearer ${API_TOKEN}</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Content-Type</stringProp>
                <stringProp name="Header.value">application/json</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Accept</stringProp>
                <stringProp name="Header.value">application/json</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
          <hashTree/>
        </hashTree>
      </hashTree>
      <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename"></stringProp>
      </ResultCollector>
      <hashTree/>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

## Security Testing

### Authentication & Authorization Testing
```php
<?php
// tests/Feature/Auth/AuthenticationTest.php
namespace Tests\Feature\Auth;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_users_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/customers');
        $response->assertStatus(401);

        $response = $this->postJson('/api/customers', []);
        $response->assertStatus(401);

        $response = $this->putJson('/api/customers/1', []);
        $response->assertStatus(401);

        $response = $this->deleteJson('/api/customers/1');
        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_users_can_access_protected_routes()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customers');
        $response->assertStatus(200);
    }

    /** @test */
    public function users_without_required_permissions_are_denied_access()
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        // Try to access admin-only route
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(403);
    }

    /** @test */
    public function users_with_required_permissions_can_access_protected_routes()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(200);
    }
}
```

### Input Validation Testing
```php
<?php
// tests/Feature/Security/InputValidationTest.php
namespace Tests\Feature\Security;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InputValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_sanitizes_html_input()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $maliciousInput = [
            'name' => '<script>alert("XSS")</script>John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => '<img src=x onerror=alert("XSS")>Jakarta',
        ];

        $response = $this->postJson('/api/customers', $maliciousInput);

        $response->assertStatus(201);

        $this->assertDatabaseHas('customers', [
            'name' => 'John Doe', // HTML should be stripped
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => 'Jakarta', // HTML should be stripped
        ]);
    }

    /** @test */
    public function it_prevents_sql_injection()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $maliciousInput = [
            'name' => "John'; DROP TABLE customers; --",
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => 'Jakarta',
        ];

        $response = $this->postJson('/api/customers', $maliciousInput);

        $response->assertStatus(201);

        // Verify customers table still exists
        $this->assertTrue(\Schema::hasTable('customers'));

        // Verify the customer was created with sanitized data
        $this->assertDatabaseHas('customers', [
            'name' => "John'; DROP TABLE customers; --",
            'email' => 'john@example.com',
        ]);
    }

    /** @test */
    public function it_validates_file_uploads()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Test with malicious file
        $maliciousFile = new \Illuminate\Http\UploadedFile(
            base_path('tests/fixtures/malicious.php'),
            'malicious.php',
            'application/x-php',
            null,
            true
        );

        $response = $this->postJson('/api/upload', [
            'file' => $maliciousFile,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['file']);
    }
}
```

### CSRF Protection Testing
```php
<?php
// tests/Feature/Security/CSRFProtectionTest.php
namespace Tests\Feature\Security;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CSRFProtectionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_requires_csrf_token_for_web_routes()
    {
        $response = $this->post('/customers', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $response->assertStatus(419); // CSRF token mismatch
    }

    /** @test */
    public function it_allows_requests_with_valid_csrf_token()
    {
        $response = $this->withSession(['_token' => 'test-token'])
                        ->post('/customers', [
                            'name' => 'John Doe',
                            'email' => 'john@example.com',
                            '_token' => 'test-token',
                        ]);

        $response->assertRedirect(); // Assuming successful creation redirects
    }
}
```

## Testing Workflow

### Continuous Integration (CI) Pipeline
```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: isp_management_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: --health-cmd="redis-cli ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
        extensions: bcmath, ctype, fileinfo, json, mbstring, openssl, pdo, tokenizer, xml, mysql, redis
        coverage: xdebug

    - name: Copy environment file
      run: cp .env.example .env

    - name: Install dependencies
      run: |
        composer install --no-progress --prefer-dist --optimize-autoloader
        npm ci

    - name: Generate application key
      run: php artisan key:generate

    - name: Run migrations
      run: php artisan migrate --force

    - name: Run tests
      run: |
        vendor/bin/phpunit --coverage-clover=coverage.xml

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: unittests
        name: codecov-umbrella

    - name: Run frontend tests
      run: npm test

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Run security audit
      run: |
        composer audit
        npm audit --audit-level high

    - name: Run performance tests
      run: |
        php artisan test:performance
```

### Local Testing Commands
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
php artisan test --testsuite=Integration

# Run specific test file
php artisan test tests/Unit/Models/CustomerTest.php

# Run specific test method
php artisan test --filter test_it_can_create_a_customer

# Run tests with coverage
php artisan test --coverage

# Run tests in parallel
php artisan test --parallel

# Run frontend tests
npm test

# Run E2E tests
npm run test:e2e

# Run performance tests
php artisan test:performance

# Run security audit
composer audit
npm audit --audit-level high
```

## Test Data Management

### Database Factories
```php
<?php
// database/factories/CustomerFactory.php
namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => '+628' . $this->faker->numerify('##########'),
            'address' => $this->faker->address(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    public function active()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function inactive()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function suspended()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }
}
```

### Test Seeds
```php
<?php
// database/seeders/TestDatabaseSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\MikrotikDevice;
use App\Models\ServicePlan;
use App\Models\Subscription;

class TestDatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create test users
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'email' => 'user@example.com',
            'role' => 'user',
        ]);

        // Create test data
        Customer::factory()->count(50)->create();
        MikrotikDevice::factory()->count(10)->create();
        ServicePlan::factory()->count(5)->create();
        Subscription::factory()->count(100)->create();
    }
}
```

## Test Reporting

### Coverage Report
```php
<?php
// config/phpunit.php
return [
    'coverage' => [
        'processUncoveredFiles' => true,
        'include' => [
            'app/*',
        ],
        'exclude' => [
            'app/Console/Kernel.php',
            'app/Exceptions',
            'app/Http/Kernel.php',
            'app/Providers',
        ],
        'report' => [
            'html' => 'build/coverage',
            'text' => 'build/coverage.txt',
            'clover' => 'build/logs/clover.xml',
        ],
    ],
];
```

### Test Metrics Dashboard
```php
<?php
// app/Console/Commands/TestMetrics.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestMetrics extends Command
{
    protected $signature = 'test:metrics';
    protected $description = 'Generate test metrics report';

    public function handle()
    {
        $this->info('Generating test metrics report...');

        // Get test statistics
        $totalTests = $this->getTotalTests();
        $passedTests = $this->getPassedTests();
        $failedTests = $this->getFailedTests();
        $coverage = $this->getCodeCoverage();

        // Display metrics
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Tests', $totalTests],
                ['Passed Tests', $passedTests],
                ['Failed Tests', $failedTests],
                ['Success Rate', round(($passedTests / $totalTests) * 100, 2) . '%'],
                ['Code Coverage', $coverage . '%'],
            ]
        );

        $this->info('Test metrics report generated successfully!');
    }

    private function getTotalTests()
    {
        // Implementation to get total test count
        return 0;
    }

    private function getPassedTests()
    {
        // Implementation to get passed test count
        return 0;
    }

    private function getFailedTests()
    {
        // Implementation to get failed test count
        return 0;
    }

    private function getCodeCoverage()
    {
        // Implementation to get code coverage percentage
        return 0;
    }
}
```

## Best Practices

### Test Organization
1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use descriptive names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Use factories**: Use database factories for test data
5. **Mock external services**: Mock external API calls and services

### Test Maintenance
1. **Regular updates**: Keep tests updated with code changes
2. **Code coverage**: Maintain high code coverage (>80%)
3. **Performance monitoring**: Monitor test execution time
4. **Flaky tests**: Identify and fix flaky tests quickly
5. **Documentation**: Document complex test scenarios

### CI/CD Integration
1. **Automated testing**: Run tests automatically on every commit
2. **Parallel execution**: Run tests in parallel to speed up execution
3. **Coverage reporting**: Generate and track code coverage reports
4. **Quality gates**: Set minimum coverage and success rate requirements
5. **Security scanning**: Include security testing in CI pipeline

This testing requirements document provides comprehensive guidelines for ensuring the quality and reliability of the ISP Management System through systematic testing approaches.