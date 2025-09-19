# SecureVault Offline - Architecture Guide

This document provides a comprehensive overview of SecureVault's technical architecture, design patterns, and implementation details for developers who want to understand or contribute to the codebase.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Layer](#data-layer)
- [Security Architecture](#security-architecture)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Build System](#build-system)
- [Testing Architecture](#testing-architecture)
- [Performance Considerations](#performance-considerations)
- [Deployment Architecture](#deployment-architecture)

## System Overview

SecureVault Offline is built as a **client-side focused application** with an offline-first architecture. The system prioritizes user privacy by implementing zero-knowledge architecture where all sensitive data is encrypted locally and never transmitted to servers in plaintext.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Environment                        │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (TypeScript)                                     │
│  ├── UI Components (shadcn/ui + Radix UI)                       │
│  ├── State Management (React Context + TanStack Query)          │
│  ├── Routing (Wouter)                                           │
│  └── PWA Features (Service Worker + Manifest)                   │
├─────────────────────────────────────────────────────────────────┤
│  Client-Side Security Layer                                      │
│  ├── Web Crypto API (AES-256-GCM)                              │
│  ├── Key Derivation (PBKDF2)                                   │
│  └── IndexedDB Encrypted Storage                               │
├─────────────────────────────────────────────────────────────────┤
│  Optional Express Backend (Minimal)                              │
│  ├── Session Management                                         │
│  ├── User Accounts (PostgreSQL)                                │
│  └── API Endpoints                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Privacy by Design
- **Zero-Knowledge**: Server never sees user data in plaintext
- **Client-Side Encryption**: All sensitive data encrypted before storage
- **Local-First**: Primary data storage is browser IndexedDB
- **No Telemetry**: No user tracking or analytics collection

### 2. Offline-First
- **IndexedDB Storage**: All data available offline
- **Service Worker**: Background sync and caching
- **Progressive Enhancement**: Works without network connectivity
- **Sync Strategies**: Manual export/import for cross-device sync

### 3. Security-First
- **Modern Cryptography**: Web Crypto API with AES-256-GCM
- **Key Derivation**: PBKDF2 with high iteration counts
- **Memory Safety**: Secure key handling and cleanup
- **Attack Surface Minimization**: Minimal server dependencies

### 4. Developer Experience
- **TypeScript**: Full type safety across the stack
- **Modern Tooling**: Vite, ESBuild, Tailwind CSS
- **Component Library**: Consistent UI with shadcn/ui
- **Testing**: Comprehensive test coverage with modern tools

## Frontend Architecture

### Technology Stack

```typescript
// Core Framework
React 18              // Component framework with Concurrent Features
TypeScript 5.x        // Type safety and developer experience
Vite                  // Build tool and development server

// UI Framework  
shadcn/ui             // Component library
Radix UI              // Accessible primitives
Tailwind CSS          // Utility-first styling
Lucide React          // Icon library

// State Management
React Context API     // Application state management
TanStack Query        // Server state and caching
React Hook Form       // Form state management

// Routing & Navigation
Wouter               // Lightweight routing library

// Data & Validation
Zod                  // Runtime type validation
date-fns             // Date manipulation utilities
```

### Component Architecture

SecureVault follows a hierarchical component structure:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form-specific components  
│   ├── modals/         # Modal dialogs
│   └── charts/         # Data visualization components
├── pages/              # Route-level page components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/               # Utility libraries
└── types/             # TypeScript type definitions
```

### State Management Pattern

```typescript
// Global Application State
interface AppState {
  auth: AuthState;        // Authentication status
  vault: VaultState;      // Encrypted data management
  ui: UIState;           // UI preferences and state
  offline: OfflineState; // PWA and offline status
}

// Context Provider Pattern
const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionEntry[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  
  // CRUD operations with encryption
  const addPassword = async (password: Omit<PasswordEntry, 'id'>) => {
    const encrypted = await encryptData(password, masterKey);
    await vaultStorage.savePassword(encrypted);
    setPasswords(prev => [...prev, password]);
  };

  return (
    <VaultContext.Provider value={{ passwords, addPassword, /* ... */ }}>
      {children}
    </VaultContext.Provider>
  );
};
```

### Component Design Patterns

#### 1. Compound Components
```typescript
// Modal with compound pattern
export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
};

// Usage
<Modal.Root>
  <Modal.Trigger>Open Settings</Modal.Trigger>
  <Modal.Content>
    <Modal.Header>Settings</Modal.Header>
    <Modal.Body>
      {/* Content */}
    </Modal.Body>
  </Modal.Content>
</Modal.Root>
```

#### 2. Render Props / Custom Hooks
```typescript
// Custom hook for data fetching with encryption
const useEncryptedData = <T>(storageKey: string) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { masterKey } = useAuth();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const encrypted = await vaultStorage.getData(storageKey);
    const decrypted = await Promise.all(
      encrypted.map(item => decryptData(item, masterKey))
    );
    setData(decrypted);
    setIsLoading(false);
  }, [storageKey, masterKey]);

  useEffect(() => {
    if (masterKey) {
      refetch();
    }
  }, [refetch, masterKey]);

  return { data, isLoading, refetch };
};
```

## Backend Architecture

### Minimal Express Server

The backend is intentionally minimal to maintain the privacy-focused architecture:

```typescript
// server/index.ts - Main server file
const app = express();

// Middleware stack
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new PGStore(/* config */),
  resave: false,
  saveUninitialized: false
}));

// API Routes (minimal)
app.use('/api/auth', authRoutes);     // User authentication
app.use('/api/user', userRoutes);     // User preferences
app.use('/api/export', exportRoutes); // Data export helpers

// Static file serving
app.use(express.static('dist'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### API Design Principles

1. **Stateless**: Each request contains all necessary information
2. **RESTful**: Standard HTTP methods and status codes
3. **Minimal Data**: Only transmit encrypted or non-sensitive data
4. **Versioned**: API versioning for future compatibility

### Database Schema (Optional PostgreSQL)

```typescript
// shared/schema.ts - Database schema definitions
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(), // Never store plaintext
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  preferences: jsonb("preferences"), // User preferences only
});

// Vault metadata (encrypted)
export const vaultMetadata = pgTable("vault_metadata", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  encryptedData: text("encrypted_data").notNull(), // All sensitive data encrypted
  lastModified: timestamp("last_modified").defaultNow(),
});
```

## Data Layer

### Client-Side Storage Architecture

```typescript
// lib/storage.ts - Storage abstraction layer
interface VaultStorage {
  // Encrypted storage operations
  savePassword(password: PasswordEntry): Promise<void>;
  saveSubscription(subscription: SubscriptionEntry): Promise<void>;
  saveNote(note: NoteEntry): Promise<void>;
  saveExpense(expense: ExpenseEntry): Promise<void>;
  
  // Retrieval operations
  getAllPasswords(): Promise<PasswordEntry[]>;
  getAllSubscriptions(): Promise<SubscriptionEntry[]>;
  getAllNotes(): Promise<NoteEntry[]>;
  getAllExpenses(): Promise<ExpenseEntry[]>;
  
  // Bulk operations
  exportVault(): Promise<EncryptedVaultData>;
  importVault(data: EncryptedVaultData): Promise<void>;
  
  // Metadata operations
  getVaultMetadata(): Promise<VaultMetadata>;
  updateVaultMetadata(metadata: Partial<VaultMetadata>): Promise<void>;
}

// IndexedDB implementation
class IndexedDBVaultStorage implements VaultStorage {
  private db: IDBDatabase;
  private cryptoService: CryptoService;

  async savePassword(password: PasswordEntry): Promise<void> {
    const encrypted = await this.cryptoService.encrypt(
      JSON.stringify(password),
      this.masterKey
    );
    
    const transaction = this.db.transaction(['passwords'], 'readwrite');
    const store = transaction.objectStore('passwords');
    await store.put({ id: password.id, data: encrypted });
  }
}
```

### Data Flow Architecture

```
User Action → Component Event → Context Provider → Storage Layer → IndexedDB
                                      ↓
User Interface ← Component Update ← State Update ← Decrypted Data ← IndexedDB
```

### Encryption Strategy

```typescript
// lib/crypto.ts - Cryptographic operations
class CryptoService {
  // Key derivation from master password
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encryption with AES-GCM
  async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoded
    );

    return {
      data: new Uint8Array(encrypted),
      iv: iv,
      algorithm: 'AES-GCM'
    };
  }
}
```

## Security Architecture

### Threat Model

SecureVault's security design addresses these threats:

1. **Data Breach**: Server compromise cannot expose user data
2. **Man-in-the-Middle**: Client-side encryption prevents data exposure
3. **Browser Vulnerabilities**: Minimal attack surface with secure APIs
4. **Physical Access**: Auto-lock and secure key handling
5. **Social Engineering**: No customer support access to user data

### Security Layers

```
┌─────────────────────────────────────┐
│          Application Layer           │ ← Input validation, XSS prevention
├─────────────────────────────────────┤
│         Encryption Layer            │ ← AES-256-GCM, PBKDF2 key derivation
├─────────────────────────────────────┤
│          Storage Layer              │ ← IndexedDB with encrypted data only
├─────────────────────────────────────┤
│          Browser Layer              │ ← Content Security Policy, HTTPS
├─────────────────────────────────────┤
│          Network Layer              │ ← TLS 1.3, certificate pinning
└─────────────────────────────────────┘
```

### Key Management

```typescript
// Secure key lifecycle management
class KeyManager {
  private masterKey: CryptoKey | null = null;
  private autoLockTimer: number | null = null;

  async unlock(password: string): Promise<boolean> {
    try {
      const metadata = await this.getVaultMetadata();
      this.masterKey = await this.deriveKey(password, metadata.salt);
      
      // Verify key correctness
      await this.verifyKey();
      
      // Set auto-lock timer
      this.setAutoLockTimer();
      
      return true;
    } catch (error) {
      this.lock(); // Clear any partial state
      return false;
    }
  }

  lock(): void {
    // Secure key cleanup
    this.masterKey = null;
    
    // Clear timers
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
    
    // Clear sensitive UI state
    this.clearSensitiveState();
  }

  private setAutoLockTimer(): void {
    const timeout = 15 * 60 * 1000; // 15 minutes
    this.autoLockTimer = setTimeout(() => this.lock(), timeout);
  }
}
```

## State Management

### Context Architecture

```typescript
// Multi-layer context structure
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <VaultProvider>
          <UIProvider>
            <OfflineProvider>
              {children}
            </OfflineProvider>
          </UIProvider>
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Context composition with custom hooks
export const useSecureVault = () => {
  const auth = useAuth();
  const vault = useVault();
  const ui = useUI();
  
  return {
    ...auth,
    ...vault,
    ...ui,
    isReady: auth.isUnlocked && vault.isLoaded
  };
};
```

### Data Synchronization

```typescript
// Optimistic updates with rollback
const useOptimisticMutation = <T>(
  mutationFn: (data: T) => Promise<void>,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: T[]) => [...old, newData]);
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    }
  });
};
```

## Component Architecture

### Design System Structure

```typescript
// Component hierarchy and patterns
src/components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── modal.tsx
│   └── ...
├── forms/                 # Form-specific components
│   ├── PasswordForm/
│   ├── SubscriptionForm/
│   └── FormField/
├── layout/               # Layout components
│   ├── Header/
│   ├── Sidebar/
│   └── MainLayout/
├── features/             # Feature-specific components
│   ├── PasswordManager/
│   ├── SubscriptionTracker/
│   ├── NotesEditor/
│   └── ExpenseTracker/
└── charts/               # Data visualization
    ├── PieChart/
    ├── BarChart/
    └── AnalyticsDashboard/
```

### Component Patterns

#### Higher-Order Components (HOCs)
```typescript
// Security wrapper HOC
const withVaultAccess = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { isUnlocked } = useAuth();
    
    if (!isUnlocked) {
      return <AccessDenied />;
    }
    
    return <Component {...props} />;
  };
};

// Usage
export default withVaultAccess(PasswordManager);
```

#### Render Props Pattern
```typescript
// Encryption status render prop
const EncryptionStatus: React.FC<{
  children: (status: EncryptionState) => React.ReactNode;
}> = ({ children }) => {
  const [status, setStatus] = useState<EncryptionState>('idle');
  
  useEffect(() => {
    // Monitor encryption status
  }, []);
  
  return <>{children(status)}</>;
};

// Usage
<EncryptionStatus>
  {(status) => (
    <div className={`status-${status}`}>
      Encryption: {status}
    </div>
  )}
</EncryptionStatus>
```

## Build System

### Development Build Pipeline

```typescript
// vite.config.ts - Development configuration
export default defineConfig({
  plugins: [
    react(),
    // Replit-specific plugins
    replitDevBanner(),
    replitCartographer(),
    replitRuntimeErrorModal(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html'),
      },
    },
  },
});
```

### Production Build Optimization

```typescript
// Production build configuration
const productionConfig = {
  // Code splitting strategies
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'vendor-crypto': ['crypto-js'],
          
          // Feature chunks
          'feature-passwords': ['./src/pages/passwords'],
          'feature-subscriptions': ['./src/pages/subscriptions'],
          'feature-notes': ['./src/pages/notes'],
          'feature-expenses': ['./src/pages/expenses'],
        },
      },
    },
  },
  
  // Bundle analysis and optimization
  plugins: [
    bundleAnalyzer({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
};
```

## Testing Architecture

### Testing Strategy

```typescript
// Testing pyramid approach
tests/
├── unit/              # Component and function tests
├── integration/       # Feature integration tests  
├── e2e/              # End-to-end user workflows
└── security/         # Cryptographic and security tests

// Test configuration
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Security Testing

```typescript
// Cryptographic operation tests
describe('CryptoService', () => {
  describe('encryption/decryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const service = new CryptoService();
      const testData = 'sensitive information';
      const password = 'secure-password';
      
      const encrypted = await service.encrypt(testData, password);
      expect(encrypted.data).not.toEqual(testData);
      expect(encrypted.iv).toHaveLength(12); // GCM IV length
      
      const decrypted = await service.decrypt(encrypted, password);
      expect(decrypted).toEqual(testData);
    });

    it('should fail with wrong password', async () => {
      const service = new CryptoService();
      const encrypted = await service.encrypt('test', 'password1');
      
      await expect(
        service.decrypt(encrypted, 'password2')
      ).rejects.toThrow('Decryption failed');
    });
  });
});
```

## Performance Considerations

### Client-Side Optimization

1. **Code Splitting**: Route-based and feature-based splitting
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo and useMemo for expensive operations
4. **Virtual Scrolling**: For large lists of passwords/subscriptions
5. **IndexedDB Optimization**: Batched operations and indexing

### Memory Management

```typescript
// Secure memory cleanup
class SecureMemoryManager {
  private sensitiveData: Map<string, any> = new Map();
  
  store(key: string, data: any): void {
    this.sensitiveData.set(key, data);
  }
  
  retrieve(key: string): any {
    return this.sensitiveData.get(key);
  }
  
  clear(): void {
    // Secure cleanup of sensitive data
    for (const [key, value] of this.sensitiveData) {
      if (typeof value === 'string') {
        // Overwrite string data
        for (let i = 0; i < value.length; i++) {
          value[i] = '\0';
        }
      }
      
      this.sensitiveData.delete(key);
    }
  }
}
```

### Database Performance

```typescript
// IndexedDB optimization strategies
class OptimizedStorage {
  // Batch operations for better performance
  async saveBatch<T>(storeName: string, items: T[]): Promise<void> {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Process in chunks to avoid blocking
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await Promise.all(chunk.map(item => store.put(item)));
    }
  }
  
  // Indexed queries for better performance
  async queryByCategory(category: string): Promise<PasswordEntry[]> {
    const transaction = this.db.transaction(['passwords'], 'readonly');
    const store = transaction.objectStore('passwords');
    const index = store.index('category');
    
    return new Promise((resolve, reject) => {
      const results: PasswordEntry[] = [];
      const request = index.openCursor(IDBKeyRange.only(category));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
```

## Deployment Architecture

### Production Environment

```yaml
# docker-compose.yml for production deployment
version: '3.8'

services:
  securevault:
    build: 
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "443:5000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./ssl:/app/ssl:ro
      - ./logs:/app/logs
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - securevault
    restart: unless-stopped
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

volumes:
  postgres_data:
```

### Security Headers Configuration

```typescript
// Security middleware for production
const securityMiddleware = (app: Express) => {
  // Content Security Policy
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "worker-src 'self'",
    ].join('; '));
    
    next();
  });
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    next();
  });
};
```

---

This architecture guide provides the foundation for understanding SecureVault's technical implementation. For specific implementation details, refer to the source code and inline documentation.

**Next Steps:**
- [Setup Guide](SETUP.md) for development environment
- [Contributing Guide](CONTRIBUTING.md) for development practices
- [API Documentation](API.md) for backend integration

---

*Last updated: September 2024*