-- JyväSisu Fungi — Full Database Schema
-- Run: psql -U postgres -d jyvasisu_fungi -f schema.sql

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role         VARCHAR(20) NOT NULL DEFAULT 'worker'
                   CHECK (role IN ('Super Admin','Farm Owner','Farm Manager','Worker','Viewer')),
    avatar       VARCHAR(5),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Farms ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farms (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    TEXT,
    area        VARCHAR(50),
    description TEXT,
    established DATE,
    owner_id    INT REFERENCES users(id) ON DELETE SET NULL,
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Rooms ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
    id               SERIAL PRIMARY KEY,
    farm_id          INT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    type             VARCHAR(100),
    species          VARCHAR(100),
    capacity         VARCHAR(50),
    status           VARCHAR(20) DEFAULT 'optimal',
    current_batch    VARCHAR(50),
    batch_start_date DATE,
    expected_harvest DATE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Devices ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
    id         SERIAL PRIMARY KEY,
    room_id    INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(50) NOT NULL,  -- humidifier, fan, heater, lights, pump
    status     VARCHAR(10) DEFAULT 'off',
    mode       VARCHAR(20) DEFAULT 'auto', -- auto, manual, scheduled
    power      INT DEFAULT 0,             -- wattage
    api_key    TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Sensor Data ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_data (
    id          SERIAL PRIMARY KEY,
    device_id   INT REFERENCES devices(id) ON DELETE SET NULL,
    room_id     INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    temperature FLOAT,
    humidity    FLOAT,
    co2         FLOAT,
    light       FLOAT,
    moisture    FLOAT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_room_time ON sensor_data(room_id, created_at DESC);

-- ─── Automation Rules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_rules (
    id               SERIAL PRIMARY KEY,
    farm_id          INT REFERENCES farms(id) ON DELETE CASCADE,
    room_id          INT REFERENCES rooms(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    condition_sensor VARCHAR(30) NOT NULL,  -- temp, humidity, co2, light, moisture
    operator         VARCHAR(5)  NOT NULL,  -- <, >, <=, >=, =
    condition_value  FLOAT       NOT NULL,
    action_device    VARCHAR(30) NOT NULL,  -- humidifier, fan, heater, lights, pump
    action_state     VARCHAR(5)  NOT NULL,  -- on, off
    priority         INT DEFAULT 1,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Alerts ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id           SERIAL PRIMARY KEY,
    farm_id      INT REFERENCES farms(id) ON DELETE CASCADE,
    room_id      INT REFERENCES rooms(id) ON DELETE SET NULL,
    message      TEXT NOT NULL,
    severity     VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
    type         VARCHAR(30) DEFAULT 'threshold',
    acknowledged BOOLEAN DEFAULT false,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    farm_id     INT REFERENCES farms(id) ON DELETE CASCADE,
    room_id     INT REFERENCES rooms(id) ON DELETE SET NULL,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    priority    VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
    status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
    due_date    DATE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Harvest Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS harvest_logs (
    id         SERIAL PRIMARY KEY,
    room_id    INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date       DATE NOT NULL DEFAULT CURRENT_DATE,
    weight     FLOAT NOT NULL,
    quality    VARCHAR(5) DEFAULT 'A',
    species    VARCHAR(100),
    notes      TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Inventory ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
    id             SERIAL PRIMARY KEY,
    farm_id        INT REFERENCES farms(id) ON DELETE CASCADE,
    name           VARCHAR(200) NOT NULL,
    category       VARCHAR(50),
    quantity       FLOAT NOT NULL DEFAULT 0,
    unit           VARCHAR(30),
    min_quantity   FLOAT DEFAULT 0,
    cost           FLOAT DEFAULT 0,
    supplier       VARCHAR(200),
    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
