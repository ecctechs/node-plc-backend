# API Documentation - Device Number Config & Level Config

## Base URL
```
http://localhost:3000/api
```

---

## 1. Number Config APIs

### 1.1 Create Number Config
**Endpoint:** `POST /addresses/:addressId/number-config`

**Description:** Create a new number configuration for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Request Body:**
```json
{
  "decimal_places": 2,
  "scale": 1.0,
  "offset": 0,
  "min_value": 0,
  "max_value": 100,
  "unit": "°C"
}
```

**Postman Setup:**
- Method: `POST`
- URL: `{{baseUrl}}/addresses/1/number-config`
- Body: Select `raw` → `JSON` and paste the request body above

---

### 1.2 Update Number Config
**Endpoint:** `PUT /addresses/:addressId/number-config`

**Description:** Update an existing number configuration for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Request Body:**
```json
{
  "decimal_places": 3,
  "scale": 0.1,
  "offset": 5,
  "min_value": -10,
  "max_value": 150,
  "unit": "°F"
}
```

**Postman Setup:**
- Method: `PUT`
- URL: `{{baseUrl}}/addresses/1/number-config`
- Body: Select `raw` → `JSON` and paste the request body above

---

### 1.3 Get Number Config
**Endpoint:** `GET /addresses/:addressId/number-config`

**Description:** Get the number configuration for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/addresses/1/number-config`

**Response Example:**
```json
{
  "id": 1,
  "address_id": 1,
  "decimal_places": 3,
  "scale": 0.1,
  "offset": 5,
  "min_value": -10,
  "max_value": 150,
  "unit": "°F",
  "createdAt": "2026-03-12T15:00:00.000Z",
  "updatedAt": "2026-03-12T15:30:00.000Z"
}
```

---

## 2. Level Config APIs

### 2.1 Sync Levels (Create/Update)
**Endpoint:** `POST /addresses/:addressId/levels`

**Description:** Create or replace all level configurations for an address. This acts as an upsert - it removes all existing levels and creates new ones.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Request Body:**
```json
[
  {
    "label": "Low",
    "condition_type": "LTE",
    "max_value": 30,
    "mode": "range",
    "include_max": true
  },
  {
    "label": "Normal",
    "condition_type": "BTW",
    "min_value": 30,
    "max_value": 70,
    "mode": "range",
    "include_min": true,
    "include_max": true
  },
  {
    "label": "High",
    "condition_type": "GTE",
    "min_value": 70,
    "mode": "range",
    "include_min": true
  }
]
```

**Condition Types:**
- `LTE` - Less Than or Equal (requires `max_value`)
- `GTE` - Greater Than or Equal (requires `min_value`)
- `BTW` - Between (requires both `min_value` and `max_value`)

**Postman Setup:**
- Method: `POST`
- URL: `{{baseUrl}}/addresses/1/levels`
- Body: Select `raw` → `JSON` and paste the request body above

---

### 2.2 Get Level Configs
**Endpoint:** `GET /addresses/:addressId/levels`

**Description:** Get all level configurations for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/addresses/1/levels`

**Response Example:**
```json
[
  {
    "id": 1,
    "address_id": 1,
    "level_index": 0,
    "label": "Low",
    "condition_type": "LTE",
    "min_value": null,
    "max_value": 30,
    "mode": "range",
    "exact_values": [],
    "include_min": true,
    "include_max": true,
    "createdAt": "2026-03-12T15:00:00.000Z",
    "updatedAt": "2026-03-12T15:00:00.000Z"
  },
  {
    "id": 2,
    "address_id": 1,
    "level_index": 1,
    "label": "Normal",
    "condition_type": "BTW",
    "min_value": 30,
    "max_value": 70,
    "mode": "range",
    "exact_values": [],
    "include_min": true,
    "include_max": true,
    "createdAt": "2026-03-12T15:00:00.000Z",
    "updatedAt": "2026-03-12T15:00:00.000Z"
  },
  {
    "id": 3,
    "address_id": 1,
    "level_index": 2,
    "label": "High",
    "condition_type": "GTE",
    "min_value": 70,
    "max_value": null,
    "mode": "range",
    "exact_values": [],
    "include_min": true,
    "include_max": true,
    "createdAt": "2026-03-12T15:00:00.000Z",
    "updatedAt": "2026-03-12T15:00:00.000Z"
  }
]
```

---

## 3. Alarm Config APIs

### 3.1 Create Alarm Rule
**Endpoint:** `POST /addresses/:addressId/alarms`

**Description:** Create a new alarm rule for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Request Body:**
```json
{
  "name": "High Temperature Alert",
  "data_type": "number",
  "condition_type": "GTE",
  "min_value": 80,
  "duration_sec": 10,
  "repeat_interval_sec": 300,
  "severity": "critical",
  "notify_email": true,
  "email_recipients": ["admin@example.com", "operator@example.com"],
  "is_active": true
}
```

**Condition Types:**
- `EXACT` - Exact value match
- `MT` - More Than
- `MTE` - More Than or Equal
- `LT` - Less Than
- `LTE` - Less Than or Equal
- `BTW` - Between
- `LEVEL` - Level index match

**Severity:** `info`, `warning`, `critical`

**Postman Setup:**
- Method: `POST`
- URL: `{{baseUrl}}/addresses/1/alarms`
- Body: Select `raw` → `JSON` and paste the request body above

---

### 3.2 Update Alarm Rule
**Endpoint:** `PUT /alarms/:alarmId`

**Description:** Update an existing alarm rule.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| alarmId | integer | The ID of the alarm rule |

**Request Body:**
```json
{
  "name": "High Temperature Warning",
  "condition_type": "GTE",
  "min_value": 75,
  "duration_sec": 15,
  "repeat_interval_sec": 600,
  "severity": "warning",
  "notify_email": true,
  "email_recipients": ["admin@example.com"],
  "is_active": true
}
```

**Postman Setup:**
- Method: `PUT`
- URL: `{{baseUrl}}/alarms/1`
- Body: Select `raw` → `JSON` and paste the request body above

---

### 3.3 Get Alarm Rules by Address
**Endpoint:** `GET /addresses/:addressId/alarms`

**Description:** Get all alarm rules for an address.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| addressId | integer | The ID of the device address |

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/addresses/1/alarms`

**Response Example:**
```json
[
  {
    "id": 1,
    "device_id": 1,
    "address_id": 1,
    "name": "High Temperature Warning",
    "data_type": "number",
    "condition_type": "GTE",
    "min_value": 75,
    "max_value": null,
    "level_index": null,
    "duration_sec": 15,
    "repeat_interval_sec": 600,
    "severity": "warning",
    "notify_email": true,
    "email_recipients": ["admin@example.com"],
    "is_active": true,
    "createdAt": "2026-03-12T15:00:00.000Z",
    "updatedAt": "2026-03-12T15:30:00.000Z"
  }
]
```

---

### 3.4 Get Alarm Rule by ID
**Endpoint:** `GET /alarms/:alarmId`

**Description:** Get a specific alarm rule by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| alarmId | integer | The ID of the alarm rule |

**Postman Setup:**
- Method: `GET`
- URL: `{{baseUrl}}/alarms/1`

---

## 4. Error Responses

### 400 Bad Request
```json
{
  "message": "Number config already exists for this address"
}
```

### 400 Bad Request
```json
{
  "message": "Number config not found for this address"
}
```

### 400 Bad Request
```json
{
  "message": "Address not found"
}
```

### 400 Bad Request
```json
{
  "message": "This address type (level) does not support number configuration"
}
```

### 400 Bad Request
```json
{
  "message": "Address data_type must be \"level\""
}
```

### 400 Bad Request
```json
{
  "message": "Alarm rule not found"
}
```

### 400 Bad Request
```json
{
  "message": "data_type does not match address data type"
}
```

---

## Postman Collection Example

You can create a Postman collection with these requests:

### Collection: Device Config APIs

#### Folder: Number Config
1. **Create Number Config**
   - Method: POST
   - URL: `{{baseUrl}}/addresses/:addressId/number-config`

2. **Update Number Config**
   - Method: PUT
   - URL: `{{baseUrl}}/addresses/:addressId/number-config`

3. **Get Number Config**
   - Method: GET
   - URL: `{{baseUrl}}/addresses/:addressId/number-config`

#### Folder: Level Config
1. **Sync Levels**
   - Method: POST
   - URL: `{{baseUrl}}/addresses/:addressId/levels`

2. **Get Levels**
   - Method: GET
   - URL: `{{baseUrl}}/addresses/:addressId/levels`

#### Folder: Alarm Config
1. **Create Alarm Rule**
   - Method: POST
   - URL: `{{baseUrl}}/addresses/:addressId/alarms`

2. **Update Alarm Rule**
   - Method: PUT
   - URL: `{{baseUrl}}/alarms/:alarmId`

3. **Get Alarms by Address**
   - Method: GET
   - URL: `{{baseUrl}}/addresses/:addressId/alarms`

4. **Get Alarm by ID**
   - Method: GET
   - URL: `{{baseUrl}}/alarms/:alarmId`
