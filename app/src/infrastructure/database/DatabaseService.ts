import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

export class DatabaseService {
  private static instance: DatabaseService;
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private readonly DB_NAME = 'bloom_budget.db';

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Load SQL.js
      // For test environment (Node), load from node_modules
      // For browser, load from CDN
      const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
      
      if (isNode) {
        this.SQL = await initSqlJs();
      } else {
        this.SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
      }

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(this.DB_NAME);
      if (savedDb) {
        const binaryArray = this.base64ToUint8Array(savedDb);
        this.db = new this.SQL.Database(binaryArray);
        console.log('Loaded existing database from storage');
      } else {
        this.db = new this.SQL.Database();
        console.log('Created new database');
      }

      // Enable foreign key constraints
      this.db.run('PRAGMA foreign_keys = ON');

      // Run migrations
      await this.runMigrations();
      
      // Save database
      this.saveDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create migrations table if it doesn't exist
    this.db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);

    // Check current version
    const result = this.db.exec('SELECT MAX(version) as version FROM migrations');
    const currentVersion = result.length > 0 && result[0].values.length > 0 
      ? (result[0].values[0][0] as number) || 0
      : 0;

    // Apply migrations
    if (currentVersion < 1) {
      await this.migration_v1();
      this.db.run('INSERT INTO migrations (version, applied_at) VALUES (?, ?)', [
        1,
        new Date().toISOString(),
      ]);
      console.log('Applied migration v1');
    }
  }

  private async migration_v1(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Categories table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        icon TEXT,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Accounts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('bank', 'wallet', 'cash', 'card')),
        currency TEXT NOT NULL DEFAULT 'USD',
        initial_balance REAL NOT NULL DEFAULT 0,
        current_balance REAL NOT NULL DEFAULT 0,
        color TEXT,
        icon TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
        amount REAL NOT NULL CHECK(amount > 0),
        currency TEXT NOT NULL DEFAULT 'USD',
        category_id TEXT,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        to_account_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Indexes for better query performance
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id)');
  }

  public getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  public saveDatabase(): void {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const base64 = this.uint8ArrayToBase64(data);
      localStorage.setItem(this.DB_NAME, base64);
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  public async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  public async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.SQL) throw new Error('SQL.js not initialized');
    
    this.db = new this.SQL.Database(data);
    this.saveDatabase();
  }

  public clearDatabase(): void {
    localStorage.removeItem(this.DB_NAME);
    if (this.SQL) {
      this.db = new this.SQL.Database();
      this.runMigrations();
    }
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    const binary = Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join('');
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
