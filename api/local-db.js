import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'campus_mart.db');
const db = new DatabaseSync(DB_PATH);

// Initialize Tables
db.exec(`
CREATE TABLE IF NOT EXISTS cm_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  display_name TEXT,
  coins INTEGER DEFAULT 500,
  avatar_emoji TEXT,
  bio TEXT,
  referral_code TEXT,
  referred_by INTEGER,
  last_daily_reward TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER,
  title TEXT,
  description TEXT,
  category TEXT,
  condition TEXT,
  type TEXT,
  price INTEGER,
  starting_price INTEGER,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_auctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  seller_id INTEGER,
  title TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  starting_price INTEGER,
  current_bid INTEGER,
  current_bidder_id INTEGER,
  winner_id INTEGER,
  start_time TEXT,
  end_time TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_id INTEGER,
  bidder_id INTEGER,
  bidder_name TEXT,
  amount INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER,
  seller_id INTEGER,
  product_id INTEGER,
  auction_id INTEGER,
  amount INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  amount INTEGER,
  balance_after INTEGER,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_virtual_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  price INTEGER,
  emoji TEXT,
  rarity TEXT,
  perk TEXT
);

CREATE TABLE IF NOT EXISTS cm_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  item_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cm_wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM cm_users').get().count;
if (userCount === 0) {
  // Users
  const insUser = db.prepare(`
    INSERT INTO cm_users (id, email, password, role, display_name, coins, avatar_emoji, bio, referral_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insUser.run(1, 'buyer@campusmart.demo', 'demo1234', 'buyer', 'Alex Rivera', 500, '🧑‍🎓', 'Sophomore CS major · looking for textbooks & electronics', 'ALEX-1001');
  insUser.run(2, 'seller@campusmart.demo', 'demo1234', 'seller', 'Jordan Taylor', 1250, '🧑‍💼', 'Senior biology major · verified campus seller', 'JORD-2002');
  insUser.run(3, 'admin@campusmart.demo', 'demo1234', 'admin', 'Campus Admin', 9999, '🛡️', 'Campus Mart official admin and safety mod', 'ADMN-0001');
  insUser.run(4, 'maya@campus.edu', 'demo1234', 'buyer', 'Maya Chen', 750, '✨', 'Junior Arts major · design enthusiast', 'MAYA-3003');
  insUser.run(5, 'jaydeep4545@gmail.com', 'demo1234', 'buyer', 'Jaydeep', 500, '🧑‍🎓', 'Campus student', 'JAYD-4545');

  // Transactions
  const insTx = db.prepare(`
    INSERT INTO cm_transactions (user_id, type, amount, balance_after, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  insTx.run(1, 'signup', 500, 500, 'Welcome bonus: 500 Campus Coins');
  insTx.run(2, 'signup', 500, 500, 'Welcome bonus: 500 Campus Coins');
  insTx.run(2, 'reward', 750, 1250, 'Campus verified seller seed bonus');
  insTx.run(3, 'signup', 500, 500, 'Welcome bonus: 500 Campus Coins');
  insTx.run(3, 'admin_grant', 9499, 9999, 'System admin balance initialization');
  insTx.run(4, 'signup', 500, 500, 'Welcome bonus: 500 Campus Coins');
  insTx.run(4, 'reward', 250, 750, 'Activity reward bonus');
  insTx.run(5, 'signup', 500, 500, 'Welcome bonus: 500 Campus Coins');

  // Virtual Items
  const insItem = db.prepare(`
    INSERT INTO cm_virtual_items (id, name, description, price, emoji, rarity, perk)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insItem.run(1, 'Verified Student', 'Official campus student badge with instant credibility', 50, '🎓', 'common', '+5% daily coin boost');
  insItem.run(2, 'Speedy Delivery', 'Seller priority badge for ultra-fast meetups', 100, '⚡', 'rare', 'Highlight listings in market');
  insItem.run(3, 'Campus Star', 'Exclusive shiny frame for your profile and comments', 250, '⭐', 'epic', 'Golden aura on profile');
  insItem.run(4, 'Auction Master', 'Access to premium notifications & auction sniper view', 500, '👑', 'legendary', 'Auction priority & golden crown');
  insItem.run(5, 'Bookworm', 'Special perk for campus textbook traders', 75, '📚', 'common', 'Discounted listing fees');
  insItem.run(6, 'Green Commuter', 'Earned by eco-friendly campus bike riders', 150, '🚲', 'rare', 'Eco badge on all listings');
  insItem.run(7, 'Tech Guru', 'Trusted badge for dorm electronics and repairs', 300, '💻', 'epic', 'Tech badge & buyer trust');
  insItem.run(8, 'Campus Legend', 'The ultimate badge of campus prestige', 1000, '🏆', 'legendary', 'Hall of Fame trophy on leaderboard');

  // Products
  const insProd = db.prepare(`
    INSERT INTO cm_products (id, seller_id, title, description, category, condition, type, price, starting_price, image_url, status, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insProd.run(1, 2, 'Calculus: Early Transcendentals 9th Ed', 'Great condition textbook, minimal highlighting. Used for MATH 101/102. Save hundreds over campus bookstore!', 'Textbooks', 'Good', 'sell', 120, null, 'https://picsum.photos/seed/cm-g-textbook/640/420', 'active', 34);
  insProd.run(2, 2, 'Sony WH-1000XM4 Noise Cancelling Headphones', 'Like new with original case and cables. Incredible battery life and active noise canceling for study sessions.', 'Electronics', 'Like New', 'auction', null, 150, 'https://picsum.photos/seed/cm-g-headphones/640/420', 'active', 58);
  insProd.run(3, 2, 'IKEA Standing Desk + Ergonomic Mesh Chair', 'Perfect dorm or off-campus apartment desk setup. Height adjustable, sturdy, easily disassembled for transport.', 'Furniture', 'Good', 'sell', 85, null, 'https://picsum.photos/seed/cm-g-desk/640/420', 'active', 19);
  insProd.run(4, 2, 'Trek FX 2 Disc Commuter Hybrid Bike (Medium)', 'Smooth shifting 18-speed Shimano gears, hydraulic disc brakes, puncture-resistant tires. Perfect campus ride.', 'Bikes', 'Like New', 'auction', null, 200, 'https://picsum.photos/seed/cm-g-bike/640/420', 'active', 42);
  insProd.run(5, 2, 'Nike Dunk Low Retro "Panda" (Size 10)', 'Authentic, worn twice, pristine condition with original box. Classic black and white colorway.', 'Sneakers', 'Like New', 'auction', null, 95, 'https://picsum.photos/seed/cm-g-sneakers/640/420', 'active', 76);
  insProd.run(6, 2, 'Yamaha Pacifica 112V Electric Guitar + Amp', 'Awesome starter electric guitar setup with cable, strap, picks, and portable practice amplifier.', 'Instruments', 'Good', 'sell', 175, null, 'https://picsum.photos/seed/cm-g-guitar/640/420', 'active', 27);
  insProd.run(7, 2, 'Keurig K-Mini Single Serve Coffee Maker', 'Compact dorm coffee maker, brews 6-12 oz in under two minutes. Comes with bonus coffee pods!', 'Appliances', 'Like New', 'sell', 35, null, 'https://picsum.photos/seed/cm-g-fridge/640/420', 'active', 15);
  insProd.run(8, 2, 'iPad Air 4th Gen 64GB Space Gray + Apple Pencil 2', 'Includes paper-feel screen protector, magnetic folio case, and Apple Pencil 2. Ideal for lecture notes.', 'Electronics', 'Like New', 'sell', 340, null, 'https://picsum.photos/seed/cm-g-laptop/640/420', 'active', 63);

  // Auctions
  const now = Date.now();
  const insAuc = db.prepare(`
    INSERT INTO cm_auctions (id, product_id, seller_id, title, description, category, image_url, starting_price, current_bid, current_bidder_id, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insAuc.run(1, 2, 2, 'Sony WH-1000XM4 Noise Cancelling Headphones', 'Like new with original case and cables...', 'Electronics', 'https://picsum.photos/seed/cm-g-headphones/640/420', 150, 165, 1, new Date(now - 3600000 * 24).toISOString(), new Date(now + 3600000 * 48).toISOString(), 'active');
  insAuc.run(2, 4, 2, 'Trek FX 2 Disc Commuter Hybrid Bike (Medium)', 'Smooth shifting 18-speed Shimano gears...', 'Bikes', 'https://picsum.photos/seed/cm-g-bike/640/420', 200, 220, 4, new Date(now - 3600000 * 12).toISOString(), new Date(now + 3600000 * 36).toISOString(), 'active');
  insAuc.run(3, 5, 2, 'Nike Dunk Low Retro "Panda" (Size 10)', 'Authentic, worn twice, pristine condition...', 'Sneakers', 'https://picsum.photos/seed/cm-g-sneakers/640/420', 95, 110, 1, new Date(now - 3600000 * 6).toISOString(), new Date(now + 3600000 * 24).toISOString(), 'active');

  // Bids
  const insBid = db.prepare(`
    INSERT INTO cm_bids (auction_id, bidder_id, bidder_name, amount)
    VALUES (?, ?, ?, ?)
  `);
  insBid.run(1, 1, 'Alex Rivera', 165);
  insBid.run(2, 4, 'Maya Chen', 220);
  insBid.run(3, 1, 'Alex Rivera', 110);
}

class QueryBuilder {
  constructor(database, table) {
    this.db = database;
    this.table = table;
    this.action = 'select';
    this.selectCols = '*';
    this.selectOptions = {};
    this.insertData = null;
    this.updateData = null;
    this.filters = [];
    this.orderBy = null;
    this.ascending = true;
    this.limitVal = null;
  }

  select(cols = '*', options = {}) {
    if (this.action !== 'insert' && this.action !== 'update') {
      this.action = 'select';
    }
    this.selectCols = cols;
    this.selectOptions = options;
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.insertData = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(col, val) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  in(col, vals) {
    this.filters.push({ type: 'in', col, val: vals });
    return this;
  }

  like(col, val) {
    this.filters.push({ type: 'like', col, val });
    return this;
  }

  ilike(col, val) {
    this.filters.push({ type: 'ilike', col, val });
    return this;
  }

  order(col, options = {}) {
    this.orderBy = col;
    this.ascending = options.ascending !== false;
    return this;
  }

  limit(n) {
    this.limitVal = n;
    return this;
  }

  _buildWhere() {
    if (this.filters.length === 0) return { sql: '', params: [] };
    const clauses = [];
    const params = [];
    for (const f of this.filters) {
      if (f.type === 'eq') {
        if (f.val === null) {
          clauses.push(`"${f.col}" IS NULL`);
        } else {
          clauses.push(`"${f.col}" = ?`);
          params.push(f.val);
        }
      } else if (f.type === 'in') {
        if (!Array.isArray(f.val) || f.val.length === 0) {
          clauses.push('0 = 1');
        } else {
          clauses.push(`"${f.col}" IN (${f.val.map(() => '?').join(', ')})`);
          params.push(...f.val);
        }
      } else if (f.type === 'like') {
        clauses.push(`"${f.col}" LIKE ?`);
        params.push(f.val);
      } else if (f.type === 'ilike') {
        clauses.push(`"${f.col}" LIKE ? COLLATE NOCASE`);
        params.push(f.val);
      }
    }
    return { sql: ' WHERE ' + clauses.join(' AND '), params };
  }

  _execute() {
    try {
      if (this.action === 'insert') {
        const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        const inserted = [];
        for (const row of rows) {
          const keys = Object.keys(row).filter((k) => row[k] !== undefined);
          const cols = keys.map((k) => `"${k}"`).join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map((k) => row[k]);
          const sql = `INSERT INTO "${this.table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
          const res = this.db.prepare(sql).get(...values);
          inserted.push(res);
        }
        return { data: Array.isArray(this.insertData) ? inserted : inserted[0], error: null };
      }

      if (this.action === 'update') {
        const keys = Object.keys(this.updateData).filter((k) => this.updateData[k] !== undefined);
        if (keys.length === 0) return { data: null, error: null };
        const setClauses = keys.map((k) => `"${k}" = ?`).join(', ');
        const updateParams = keys.map((k) => this.updateData[k]);
        const { sql: whereSql, params: whereParams } = this._buildWhere();
        const sql = `UPDATE "${this.table}" SET ${setClauses}${whereSql} RETURNING *`;
        const updated = this.db.prepare(sql).all(...updateParams, ...whereParams);
        return { data: updated.length === 1 ? updated[0] : updated, error: null };
      }

      if (this.action === 'delete') {
        const { sql: whereSql, params } = this._buildWhere();
        this.db.prepare(`DELETE FROM "${this.table}"${whereSql}`).run(...params);
        return { data: null, error: null };
      }

      // SELECT
      if (this.selectOptions && this.selectOptions.head && this.selectOptions.count === 'exact') {
        const { sql: whereSql, params } = this._buildWhere();
        const row = this.db.prepare(`SELECT COUNT(*) as count FROM "${this.table}"${whereSql}`).get(...params);
        return { data: null, count: row ? Number(row.count) : 0, error: null };
      }

      const { sql: whereSql, params } = this._buildWhere();
      let sql = `SELECT * FROM "${this.table}"${whereSql}`;
      if (this.orderBy) {
        sql += ` ORDER BY "${this.orderBy}" ${this.ascending ? 'ASC' : 'DESC'}`;
      }
      if (this.limitVal) {
        sql += ` LIMIT ${Number(this.limitVal)}`;
      }
      const data = this.db.prepare(sql).all(...params);
      return { data, count: data.length, error: null };
    } catch (err) {
      console.error(`DB Error [${this.table}]:`, err);
      return { data: null, error: err };
    }
  }

  async then(resolve) {
    return resolve(this._execute());
  }

  async single() {
    const res = this._execute();
    if (res.error) return res;
    if (Array.isArray(res.data)) {
      return { data: res.data[0] || null, error: res.data.length ? null : new Error('No row found') };
    }
    return res;
  }

  async maybeSingle() {
    const res = this._execute();
    if (res.error) return res;
    if (Array.isArray(res.data)) {
      return { data: res.data[0] || null, error: null };
    }
    return res;
  }
}

const localSupabase = {
  from: (table) => new QueryBuilder(db, table),
};

export default localSupabase;
