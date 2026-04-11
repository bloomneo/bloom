# AppKit FBCA Backend - Complete LLM Guide 🚀

> **Essential foundation for AI agents to generate perfect AppKit backend code for FBCA applications**

## CRITICAL: Read This First

This guide establishes the core patterns that ALL AppKit backend code must follow in FBCA applications. Every example is production-ready. Every pattern is tested. Every rule is absolute.

---

## WHEN TO USE APPKIT BACKEND

✅ **ALWAYS use AppKit when:**

- Building Node.js/Express backend for FBCA applications
- Need authentication with JWT tokens and role-based permissions
- Require structured logging, error handling, and security
- Want environment-driven configuration
- Need database operations with optional multi-tenancy
- Building API endpoints for Electron desktop apps
- Require file storage, caching, or background jobs

❌ **NEVER use AppKit when:**

- Building frontend-only applications
- Creating CLI tools or scripts
- Need real-time WebSocket servers as primary feature
- Working with non-Node.js environments

---

## FBCA BACKEND ARCHITECTURE

### File Structure Convention (Desktop App)

```
src/desktop/main/
├── server.ts                      # Express server entry point
├── routes/
│   ├── index.ts                   # Auto-discovery router
│   ├── auth/                      # Auth feature routes
│   │   └── auth.routes.ts
│   ├── users/                     # Users feature routes
│   │   └── users.routes.ts
│   └── files/                     # Files feature routes
│       └── files.routes.ts
├── middleware/
│   ├── auth.middleware.ts         # Authentication middleware
│   └── error.middleware.ts        # Error handling middleware
├── lib/
│   ├── config.ts                  # Configuration utilities
│   ├── database.ts                # Database utilities
│   └── logger.ts                  # Logger utilities
└── types/
    └── express.d.ts               # Express type extensions
```

---

## THE ONE FUNCTION RULE: LIBRARY FIRST

**ALWAYS use AppKit library modules over custom implementations**

### Module Selection Decision Tree

```
Need functionality?
├── Safe object access?
│   └── util.get() (from @bloomneo/appkit/util)
│
├── Environment variables?
│   └── config.get() (from @bloomneo/appkit/config)
│
├── Authentication?
│   ├── JWT tokens → auth.generateLoginToken()
│   ├── API tokens → auth.generateApiToken()
│   ├── Password hashing → auth.hashPassword()
│   └── Role checking → auth.hasRole()
│
├── Error handling?
│   ├── Bad request → error.badRequest()
│   ├── Unauthorized → error.unauthorized()
│   ├── Forbidden → error.forbidden()
│   ├── Not found → error.notFound()
│   └── Server error → error.serverError()
│
├── Security?
│   ├── CSRF protection → security.forms()
│   ├── Rate limiting → security.requests()
│   ├── Input sanitization → security.input()
│   └── Encryption → security.encrypt()
│
├── Logging?
│   └── logger.info/warn/error() (from @bloomneo/appkit/logger)
│
└── Custom implementation?
    └── ONLY if no library module exists
```

---

## REQUIRED MODULE SETUP (MEMORIZE THESE)

### Core Module Reference Table

| Module | Import | Usage | When to Use |
|--------|--------|-------|-------------|
| **util** | `import { utilClass } from '@bloomneo/appkit/util'` | `const util = utilClass.get()` | Safe access, validation, formatting |
| **config** | `import { configClass } from '@bloomneo/appkit/config'` | `const config = configClass.get()` | Environment variables |
| **auth** | `import { authClass } from '@bloomneo/appkit/auth'` | `const auth = authClass.get()` | JWT, passwords, roles |
| **logger** | `import { loggerClass } from '@bloomneo/appkit/logger'` | `const logger = loggerClass.get('component')` | Structured logging |
| **error** | `import { errorClass } from '@bloomneo/appkit/error'` | `const error = errorClass.get()` | HTTP error handling |
| **security** | `import { securityClass } from '@bloomneo/appkit/security'` | `const security = securityClass.get()` | CSRF, rate limiting, encryption |
| **database** | `import { databaseClass } from '@bloomneo/appkit/database'` | `const database = await databaseClass.get()` | Database operations |
| **cache** | `import { cacheClass } from '@bloomneo/appkit/cache'` | `const cache = cacheClass.get('namespace')` | Caching with namespaces |
| **storage** | `import { storageClass } from '@bloomneo/appkit/storage'` | `const storage = storageClass.get()` | File storage |
| **queue** | `import { queueClass } from '@bloomneo/appkit/queue'` | `const queue = queueClass.get()` | Background jobs |
| **email** | `import { emailClass } from '@bloomneo/appkit/email'` | `const email = emailClass.get()` | Sending emails |
| **event** | `import { eventClass } from '@bloomneo/appkit/event'` | `const event = eventClass.get('namespace')` | Event emission |

---

## EXPRESS SERVER SETUP (REQUIRED PATTERN)

### Step 1: Server Entry Point

```typescript
// src/desktop/main/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { configClass } from '@bloomneo/appkit/config';
import { loggerClass } from '@bloomneo/appkit/logger';
import { errorClass } from '@bloomneo/appkit/error';
import { router } from './routes';

const app = express();
const config = configClass.get();
const logger = loggerClass.get('server');
const error = errorClass.get();

// Middleware setup (ORDER CRITICAL)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.getEnvironment(),
  });
});

// Auto-discovery routes
app.use('/api', router);

// Error handling middleware (MUST be last)
app.use(error.handleErrors());

// Start server
const port = config.get('server.port', 3000);
const host = config.get('server.host', 'localhost');

app.listen(port, host, () => {
  logger.info('🚀 Server started', { port, host });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
```

### Step 2: Auto-Discovery Router

```typescript
// src/desktop/main/routes/index.ts
import { Router } from 'express';
import { loggerClass } from '@bloomneo/appkit/logger';

const logger = loggerClass.get('router');

// Auto-discover all route files
const routeFiles = import.meta.glob('./*/*.routes.ts', { eager: true });

const router = Router();

// Register all discovered routes
Object.entries(routeFiles).forEach(([filePath, module]) => {
  const match = filePath.match(/\.\/([^/]+)\/([^/]+)\.routes\.ts$/);
  if (!match) return;

  const [, feature] = match;
  const routeModule = module as any;

  if (routeModule.default) {
    router.use(`/${feature}`, routeModule.default);
    logger.info(`✅ Registered route: /${feature}`);
  }
});

export { router };
```

### Step 3: Feature Route Example

```typescript
// src/desktop/main/routes/auth/auth.routes.ts
import { Router } from 'express';
import { utilClass } from '@bloomneo/appkit/util';
import { authClass } from '@bloomneo/appkit/auth';
import { errorClass } from '@bloomneo/appkit/error';
import { loggerClass } from '@bloomneo/appkit/logger';
import { securityClass } from '@bloomneo/appkit/security';
import { databaseClass } from '@bloomneo/appkit/database';

const router = Router();
const util = utilClass.get();
const auth = authClass.get();
const error = errorClass.get();
const logger = loggerClass.get('auth');
const security = securityClass.get();

// Register endpoint
router.post(
  '/register',
  error.asyncRoute(async (req, res) => {
    const { email, password, name } = req.body;

    // Input validation
    if (util.isEmpty(email)) throw error.badRequest('Email is required');
    if (!email.includes('@')) throw error.badRequest('Invalid email format');
    if (util.isEmpty(password)) throw error.badRequest('Password is required');
    if (password.length < 8) throw error.badRequest('Password must be 8+ characters');
    if (util.isEmpty(name)) throw error.badRequest('Name is required');

    // Sanitize inputs
    const safeEmail = security.input(email.toLowerCase());
    const safeName = security.input(name, { maxLength: 50 });

    // Check existing user
    const database = await databaseClass.get();
    const existingUser = await database.user.findUnique({
      where: { email: safeEmail },
    });

    if (existingUser) {
      throw error.conflict('Email already registered');
    }

    // Create user
    const hashedPassword = await auth.hashPassword(password);
    const user = await database.user.create({
      data: {
        email: safeEmail,
        name: safeName,
        password: hashedPassword,
        role: 'user',
        level: 'basic',
      },
    });

    // Generate token
    const token = auth.generateLoginToken({
      userId: user.id,
      role: user.role,
      level: user.level,
    });

    logger.info('User registered', { userId: user.id, email: user.email });

    res.json({
      success: true,
      token,
      user: util.pick(user, ['id', 'email', 'name']),
    });
  })
);

// Login endpoint
router.post(
  '/login',
  error.asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (util.isEmpty(email)) throw error.badRequest('Email is required');
    if (util.isEmpty(password)) throw error.badRequest('Password is required');

    // Find user
    const database = await databaseClass.get();
    const user = await database.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) throw error.unauthorized('Invalid credentials');

    // Verify password
    const isValid = await auth.comparePassword(password, user.password);
    if (!isValid) throw error.unauthorized('Invalid credentials');

    // Generate token
    const token = auth.generateLoginToken({
      userId: user.id,
      role: user.role,
      level: user.level,
    });

    logger.info('User logged in', { userId: user.id });

    res.json({
      success: true,
      token,
      user: util.pick(user, ['id', 'email', 'name']),
    });
  })
);

export default router;
```

---

## AUTHENTICATION PATTERNS (CRITICAL)

### Pattern 1: Dual Token System

```typescript
// Login tokens for user authentication
const loginToken = auth.generateLoginToken({
  userId: user.id,      // REQUIRED
  role: user.role,      // REQUIRED (admin, moderator, user)
  level: user.level,    // REQUIRED (system, org, tenant, basic, etc.)
});

// API tokens for service authentication
const apiToken = auth.generateApiToken({
  keyId: 'webhook_service',  // REQUIRED
  role: 'service',           // REQUIRED
  level: 'external',         // REQUIRED
});
```

### Pattern 2: Protected Routes

```typescript
// Require login (any authenticated user)
router.get(
  '/profile',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const user = auth.user(req);
    // user has: userId, role, level
    res.json({ user });
  })
);

// Require specific role
router.get(
  '/admin/users',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.tenant']),
  error.asyncRoute(async (req, res) => {
    // Only admin.tenant or higher can access
    res.json({ users: [] });
  })
);

// API token authentication
router.post(
  '/webhook/data',
  auth.requireApiToken(),
  error.asyncRoute(async (req, res) => {
    // Authenticated via API token
    res.json({ success: true });
  })
);
```

### Pattern 3: Permission Checking

```typescript
router.put(
  '/users/:id',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const user = auth.user(req);
    const { id } = req.params;

    // Check if user can manage this resource
    if (!auth.can(user, 'manage:users')) {
      throw error.forbidden('Insufficient permissions');
    }

    // Check role hierarchy
    const userRoleLevel = `${user.role}.${user.level}`;
    if (!auth.hasRole(userRoleLevel, 'admin.tenant')) {
      throw error.forbidden('Admin access required');
    }

    // Update user
    res.json({ success: true });
  })
);
```

---

## ERROR HANDLING PATTERNS (CRITICAL)

### Pattern 1: Semantic Error Types

```typescript
// ✅ CORRECT - Use semantic error types
if (util.isEmpty(email)) {
  throw error.badRequest('Email is required'); // 400
}

if (!token) {
  throw error.unauthorized('Authentication required'); // 401
}

if (!user.isAdmin) {
  throw error.forbidden('Admin access required'); // 403
}

if (!resource) {
  throw error.notFound('Resource not found'); // 404
}

if (email === existingEmail) {
  throw error.conflict('Email already exists'); // 409
}

throw error.serverError('Internal error occurred'); // 500
```

### Pattern 2: Try-Catch with Specific Errors

```typescript
router.post(
  '/resource',
  error.asyncRoute(async (req, res) => {
    try {
      const result = await performOperation();
      res.json({ success: true, result });
    } catch (err) {
      // Categorize errors
      if (err.message.includes('validation')) {
        throw error.badRequest('Invalid input data');
      }
      if (err.message.includes('permission')) {
        throw error.forbidden('Access denied');
      }
      if (err.message.includes('not found')) {
        throw error.notFound('Resource not found');
      }
      // Default to server error
      throw error.serverError('Operation failed');
    }
  })
);
```

### Pattern 3: AsyncRoute Wrapper

```typescript
// ✅ CORRECT - Always wrap async routes
router.post(
  '/endpoint',
  error.asyncRoute(async (req, res) => {
    // Errors automatically caught and handled
    throw error.badRequest('Something went wrong');
  })
);

// ❌ WRONG - No wrapper, errors not handled
router.post('/endpoint', async (req, res) => {
  // Unhandled promise rejection!
  throw new Error('Not handled');
});
```

---

## LOGGING PATTERNS

### Pattern 1: Component-Specific Loggers

```typescript
// Create component-specific loggers
const authLogger = loggerClass.get('auth');
const apiLogger = loggerClass.get('api');
const dbLogger = loggerClass.get('database');

// Use in routes
authLogger.info('User registered', { userId: user.id });
apiLogger.warn('Rate limit exceeded', { ip: req.ip });
dbLogger.error('Database connection failed', { error: err.message });
```

### Pattern 2: Structured Logging

```typescript
// ✅ CORRECT - Log with structured data
logger.info('User action', {
  userId: user.id,
  action: 'login',
  timestamp: Date.now(),
  ip: req.ip,
});

// ❌ WRONG - Plain text logging
logger.info('User logged in');
console.log('User logged in'); // Don't use console.log
```

### Pattern 3: Request Logging Middleware

```typescript
app.use((req, res, next) => {
  const util = utilClass.get();
  const logger = loggerClass.get('request');

  req.requestId = util.uuid();
  req.logger = logger.child({
    requestId: req.requestId,
    method: req.method,
    url: req.url,
  });

  const startTime = Date.now();
  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
    });
  });

  next();
});
```

---

## SECURITY PATTERNS

### Pattern 1: Input Sanitization

```typescript
// ✅ CORRECT - Always sanitize user input
const safeName = security.input(req.body.name, { maxLength: 50 });
const safeEmail = security.input(req.body.email?.toLowerCase());
const safeHtml = security.html(req.body.content, {
  allowedTags: ['p', 'b', 'i', 'a'],
  maxLength: 1000,
});

// ❌ WRONG - Direct use of user input
const name = req.body.name; // Can contain malicious data
```

### Pattern 2: Rate Limiting

```typescript
// Apply rate limiting to endpoints
app.use('/api', security.requests(100, 900000)); // 100 requests per 15 min
app.use('/auth', security.requests(5, 3600000)); // 5 requests per hour
```

### Pattern 3: Data Encryption

```typescript
// Encrypt sensitive data before storing
const encryptedSSN = security.encrypt(user.ssn);
const encryptedPhone = security.encrypt(user.phone);

await database.user.update({
  where: { id: user.id },
  data: {
    ssn: encryptedSSN,
    phone: encryptedPhone,
  },
});

// Decrypt for authorized access
const originalSSN = security.decrypt(encryptedSSN);
```

---

## DATABASE PATTERNS

### Pattern 1: Basic Database Access

```typescript
router.get(
  '/users',
  error.asyncRoute(async (req, res) => {
    const database = await databaseClass.get();
    const users = await database.user.findMany({
      select: { id: true, email: true, name: true },
    });

    res.json({ users });
  })
);
```

### Pattern 2: Multi-Tenant Access

```typescript
// Normal access (auto-filtered by tenant if enabled)
const database = await databaseClass.get();
const users = await database.user.findMany(); // Filtered by tenant_id

// Admin access (all tenants)
const dbTenants = await databaseClass.getTenants();
const allUsers = await dbTenants.user.findMany(); // Cross-tenant
```

### Pattern 3: Database Schema (MANDATORY)

```sql
-- ✅ CRITICAL - Every table MUST include tenant_id
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  name text,
  password text,
  role text,
  level text,
  tenant_id text,                    -- MANDATORY for future multi-tenancy
  created_at timestamp DEFAULT now(),

  INDEX idx_users_tenant (tenant_id) -- MANDATORY performance index
);

-- Apply to ALL tables
CREATE TABLE posts (
  id uuid PRIMARY KEY,
  title text,
  content text,
  user_id uuid REFERENCES users(id),
  tenant_id text,                    -- MANDATORY
  created_at timestamp DEFAULT now(),

  INDEX idx_posts_tenant (tenant_id) -- MANDATORY
);
```

---

## CONFIGURATION PATTERNS

### Pattern 1: Environment Variables

```bash
# Environment Variable → Config Path
DATABASE_URL=postgres://...              → config.get('database.url')
SERVER_PORT=3000                        → config.get('server.port')
VOILA_AUTH_SECRET=secret                → config.get('auth.secret')
REDIS_URL=redis://...                   → config.get('redis.url')
```

### Pattern 2: Required Configuration

```typescript
// Validate required config at startup
try {
  const config = configClass.get();

  config.getRequired('database.url');
  config.getRequired('auth.secret');

  if (config.isProduction()) {
    config.getRequired('redis.url');
  }

  console.log('✅ Configuration validated');
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}
```

### Pattern 3: Optional with Defaults

```typescript
const port = config.get('server.port', 3000);
const host = config.get('server.host', 'localhost');
const timeout = config.get('api.timeout', 5000);
```

---

## UTILITY PATTERNS

### Pattern 1: Safe Property Access

```typescript
// ✅ CORRECT - Never crashes
const name = util.get(user, 'profile.name', 'Guest');
const city = util.get(user, 'addresses[0].city', 'Unknown');

// ❌ WRONG - Can crash
const name = user.profile.name; // TypeError if profile is undefined
```

### Pattern 2: Validation Helpers

```typescript
// Check if empty (null, undefined, '', {}, [], whitespace)
if (util.isEmpty(req.body.email)) {
  throw error.badRequest('Email is required');
}

// Array operations
const uniqueIds = util.unique([1, 2, 2, 3]);
const batches = util.chunk(largeArray, 100);

// String operations
const slug = util.slugify('Product Name!'); // 'product-name'
const preview = util.truncate(longText, { length: 100 });

// Number operations
const volume = util.clamp(userInput, 0, 1);
const size = util.formatBytes(1048576); // '1 MB'
```

---

## COMMON LLM MISTAKES TO AVOID

```typescript
// ❌ WRONG - Unsafe property access
const name = user.profile.name; // Can crash

// ✅ CORRECT - Safe access
const name = util.get(user, 'profile.name', 'Guest');

// ❌ WRONG - Missing token fields
auth.generateLoginToken({ userId: 123 });

// ✅ CORRECT - All required fields
auth.generateLoginToken({
  userId: 123,
  role: 'user',
  level: 'basic',
});

// ❌ WRONG - Wrong error types
throw error.serverError('Email required'); // Should be badRequest

// ✅ CORRECT - Semantic error types
throw error.badRequest('Email required');
throw error.unauthorized('Login required');
throw error.forbidden('Admin required');

// ❌ WRONG - No input sanitization
const name = req.body.name;

// ✅ CORRECT - Sanitize input
const name = security.input(req.body.name, { maxLength: 50 });

// ❌ WRONG - Plain logging
console.log('User logged in');

// ✅ CORRECT - Structured logging
logger.info('User logged in', { userId: user.id });

// ❌ WRONG - Missing tenant_id in schema
CREATE TABLE users (id, email, name);

// ✅ CORRECT - Include tenant_id
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text,
  name text,
  tenant_id text,
  INDEX idx_users_tenant (tenant_id)
);

// ❌ WRONG - No async wrapper
router.post('/endpoint', async (req, res) => {
  throw new Error('Unhandled!');
});

// ✅ CORRECT - Use asyncRoute
router.post(
  '/endpoint',
  error.asyncRoute(async (req, res) => {
    throw error.badRequest('Handled!');
  })
);

// ❌ WRONG - Error handler not last
app.use(error.handleErrors());
app.use('/api', routes); // Routes should come before error handler

// ✅ CORRECT - Error handler last
app.use('/api', routes);
app.use(error.handleErrors()); // MUST be last
```

---

## COMPREHENSIVE CHECKLIST FOR LLMs

### Server Setup
- [ ] Express server with proper middleware order
- [ ] Health check endpoint at /health
- [ ] Auto-discovery router for routes
- [ ] Error handling middleware LAST
- [ ] Graceful shutdown handlers (SIGTERM, SIGINT)

### Module Usage
- [ ] Always use `moduleClass.get()` pattern
- [ ] Use exact object names (util, config, auth, logger, etc.)
- [ ] Follow dependency order for initialization
- [ ] Component-specific loggers for different features

### Authentication
- [ ] generateLoginToken with userId, role, level
- [ ] generateApiToken for service authentication
- [ ] requireLoginToken() for user routes
- [ ] requireApiToken() for webhook routes
- [ ] requireUserRoles() for admin routes
- [ ] auth.user(req) to extract user safely

### Error Handling
- [ ] Use semantic error types (badRequest, unauthorized, forbidden, notFound, serverError)
- [ ] Wrap all async routes with error.asyncRoute()
- [ ] Put error.handleErrors() middleware LAST
- [ ] Try-catch with specific error categorization

### Security
- [ ] Sanitize all user input with security.input()
- [ ] Apply rate limiting to public endpoints
- [ ] Encrypt sensitive data before storage
- [ ] Validate email format and required fields

### Logging
- [ ] Use structured logging with context data
- [ ] Create component-specific loggers
- [ ] Log important operations (auth, errors, etc.)
- [ ] Request logging middleware with requestId

### Database
- [ ] Include tenant_id in ALL tables with index
- [ ] Use await databaseClass.get() for access
- [ ] Use getTenants() for admin cross-tenant access
- [ ] Select only needed fields for performance

### Configuration
- [ ] Use config.getRequired() for critical values
- [ ] Use config.get(key, default) for optional values
- [ ] Validate configuration at startup
- [ ] Check isProduction() for env-specific config

### Utilities
- [ ] Use util.get() for safe property access
- [ ] Use util.isEmpty() for validation
- [ ] Use util.slugify() for URL-safe strings
- [ ] Use util.pick() to expose only safe fields

### Route Organization
- [ ] Organize routes by feature in routes/ folder
- [ ] Use auto-discovery pattern for routes
- [ ] Export router as default from route files
- [ ] Group related endpoints in feature routers

---

**Built with @bloomneo/appkit** ✨
