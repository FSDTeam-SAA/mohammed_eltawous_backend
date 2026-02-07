# CMS API Documentation

**Base URL:** `http://localhost:YOUR_PORT/v1/content/cms`

---

## 1. Create CMS Content

**Endpoint:** `POST /v1/content/cms`

**Content-Type:** `multipart/form-data`

**Body (form-data):**

| Field     | Type | Required | Description                                       |
| --------- | ---- | -------- | ------------------------------------------------- |
| type      | Text | Yes      | Content type (e.g., "home-hero", "about-section") |
| title     | Text | No       | Title of the content                              |
| richText  | Text | No       | Tiptap JSON as string                             |
| plainText | Text | No       | Plain text version                                |
| isActive  | Text | No       | "true" or "false" (default: true)                 |
| order     | Text | No       | Sort order number                                 |
| metadata  | Text | No       | Additional JSON data as string                    |
| image     | File | No       | Image file upload                                 |

**Example richText value:**

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Hello World" }]
    }
  ]
}
```

**Example Response:**

```json
{
  "status": true,
  "message": "CMS content created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "type": "home-hero",
    "title": "Welcome",
    "richText": {"type":"doc","content":[...]},
    "plainText": "Hello World",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "isActive": true,
    "order": 0,
    "createdAt": "2026-02-08T10:30:00.000Z",
    "updatedAt": "2026-02-08T10:30:00.000Z"
  }
}
```

---

## 2. Get All CMS Content

**Endpoint:** `GET /v1/content/cms`

**Query Parameters:**

| Parameter | Type   | Description                                 |
| --------- | ------ | ------------------------------------------- |
| type      | String | Filter by content type                      |
| isActive  | String | Filter by active status ("true" or "false") |
| page      | Number | Page number (default: 1)                    |
| limit     | Number | Items per page (default: 10)                |
| sortBy    | String | Sort field (default: "createdAt")           |
| sortOrder | String | "asc" or "desc" (default: "desc")           |

**Example URLs:**

```
GET /v1/content/cms
GET /v1/content/cms?type=home-hero
GET /v1/content/cms?type=home-hero&isActive=true
GET /v1/content/cms?page=1&limit=5
GET /v1/content/cms?sortBy=order&sortOrder=asc
```

**Example Response:**

```json
{
  "status": true,
  "message": "CMS content fetched successfully",
  "data": {
    "contents": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

## 3. Get CMS Content by Type

**Endpoint:** `GET /v1/content/cms/type/:type`

**Example URLs:**

```
GET /v1/content/cms/type/home-hero
GET /v1/content/cms/type/about-section
GET /v1/content/cms/type/footer?page=1&limit=5
```

---

## 4. Get CMS Content by ID

**Endpoint:** `GET /v1/content/cms/:id`

**Example URL:**

```
GET /v1/content/cms/65f1a2b3c4d5e6f7g8h9i0j1
```

**Example Response:**

```json
{
  "status": true,
  "message": "CMS content fetched successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "type": "home-hero",
    "title": "Welcome",
    "richText": {...},
    "plainText": "Hello World",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "isActive": true,
    "order": 0,
    "createdAt": "2026-02-08T10:30:00.000Z",
    "updatedAt": "2026-02-08T10:30:00.000Z"
  }
}
```

---

## 5. Update CMS Content by ID

**Endpoint:** `PATCH /v1/content/cms/:id`

**Content-Type:** `multipart/form-data`

**Example URL:**

```
PATCH /v1/content/cms/65f1a2b3c4d5e6f7g8h9i0j1
```

**Body (form-data) - All fields optional:**

| Field     | Type | Description                        |
| --------- | ---- | ---------------------------------- |
| type      | Text | Updated content type               |
| title     | Text | Updated title                      |
| richText  | Text | Updated Tiptap JSON as string      |
| plainText | Text | Updated plain text                 |
| isActive  | Text | "true" or "false"                  |
| order     | Text | Updated sort order                 |
| metadata  | Text | Updated JSON data as string        |
| image     | File | New image file (replaces existing) |

---

## 6. Delete CMS Content by ID

**Endpoint:** `DELETE /v1/content/cms/:id`

**Example URL:**

```
DELETE /v1/content/cms/65f1a2b3c4d5e6f7g8h9i0j1
```

**Example Response:**

```json
{
  "status": true,
  "message": "CMS content deleted successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    ...
  }
}
```

---

## 7. Get All Distinct Types

**Endpoint:** `GET /v1/content/cms/types/list`

**Example Response:**

```json
{
  "status": true,
  "message": "Types fetched successfully",
  "data": ["home-hero", "about-section", "footer", "testimonials"]
}
```

---

## 8. Bulk Update Order

**Endpoint:** `PATCH /v1/content/cms/order/bulk`

**Content-Type:** `application/json`

**Body:**

```json
{
  "items": [
    { "id": "65f1a2b3c4d5e6f7g8h9i0j1", "order": 1 },
    { "id": "65f1a2b3c4d5e6f7g8h9i0j2", "order": 2 },
    { "id": "65f1a2b3c4d5e6f7g8h9i0j3", "order": 3 }
  ]
}
```

---

## Sample Tiptap JSON Examples

### Simple Paragraph

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Your text here" }]
    }
  ]
}
```

### Bold Text

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [{ "type": "bold" }],
          "text": "Bold text"
        }
      ]
    }
  ]
}
```

### Heading + Paragraph

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Main Title" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Description text here." }]
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "status": false,
  "message": "Type is required"
}
```

### 404 Not Found

```json
{
  "status": false,
  "message": "CMS content not found"
}
```

### 500 Internal Server Error

```json
{
  "status": false,
  "message": "Failed to create CMS content"
}
```

---

## Quick Reference Table

| Action      | Method | Endpoint                     |
| ----------- | ------ | ---------------------------- |
| Create      | POST   | `/v1/content/cms`            |
| Get All     | GET    | `/v1/content/cms`            |
| Get by Type | GET    | `/v1/content/cms/type/:type` |
| Get by ID   | GET    | `/v1/content/cms/:id`        |
| Update      | PATCH  | `/v1/content/cms/:id`        |
| Delete      | DELETE | `/v1/content/cms/:id`        |
| Get Types   | GET    | `/v1/content/cms/types/list` |
| Bulk Order  | PATCH  | `/v1/content/cms/order/bulk` |
