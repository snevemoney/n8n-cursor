# Clearfield → SENTINEL export schema v1

**Phase:** 12  
**Producer:** `clearfield-evidence-flow` (lane: `hive_capability`)  
**Consumer:** SENTINEL (`shield-buddies`) staging / feed hook  
**Anti-overlap:** Clearfield is not an emergency PWA and not ProofCheck.

## JSON Schema (draft-07)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://evenslouis.ca/schemas/clearfield-export-v1.json",
  "title": "ClearfieldCasefileExportV1",
  "type": "object",
  "required": ["schemaVersion", "exportedAt", "casefile"],
  "additionalProperties": false,
  "properties": {
    "schemaVersion": {
      "type": "string",
      "const": "1.0.0"
    },
    "exportedAt": {
      "type": "string",
      "format": "date-time"
    },
    "exporter": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "system": { "type": "string", "const": "clearfield-evidence-flow" },
        "operatorId": { "type": "string" },
        "signature": {
          "type": "string",
          "description": "HMAC or signed-drop token for feed auth"
        }
      }
    },
    "casefile": {
      "type": "object",
      "required": ["id", "title", "status", "claims", "sources"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "title": { "type": "string", "minLength": 1 },
        "summary": { "type": "string" },
        "status": {
          "type": "string",
          "enum": ["draft", "active", "archived"]
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "claims": {
          "type": "array",
          "items": { "$ref": "#/definitions/claim" }
        },
        "sources": {
          "type": "array",
          "items": { "$ref": "#/definitions/source" }
        },
        "contradictions": {
          "type": "array",
          "items": { "$ref": "#/definitions/contradiction" }
        },
        "links": {
          "type": "array",
          "items": { "$ref": "#/definitions/link" },
          "description": "Link-graph edges between claims/sources/entities"
        }
      }
    },
    "sentinelHints": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "priority": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
        "geoHints": {
          "type": "array",
          "items": { "type": "string" }
        },
        "relatedSupplyIds": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Optional SENTINEL supply module crosswalk — never required for ingest"
        }
      }
    }
  },
  "definitions": {
    "claim": {
      "type": "object",
      "required": ["id", "text"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string" },
        "text": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "sourceIds": {
          "type": "array",
          "items": { "type": "string" }
        },
        "entities": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "source": {
      "type": "object",
      "required": ["id", "urlOrRef"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string" },
        "urlOrRef": { "type": "string" },
        "title": { "type": "string" },
        "retrievedAt": { "type": "string", "format": "date-time" },
        "mediaType": {
          "type": "string",
          "enum": ["web", "pdf", "image", "video", "other"]
        }
      }
    },
    "contradiction": {
      "type": "object",
      "required": ["id", "claimIds", "note"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string" },
        "claimIds": {
          "type": "array",
          "minItems": 2,
          "items": { "type": "string" }
        },
        "note": { "type": "string" },
        "severity": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        }
      }
    },
    "link": {
      "type": "object",
      "required": ["from", "to", "rel"],
      "additionalProperties": false,
      "properties": {
        "from": { "type": "string" },
        "to": { "type": "string" },
        "rel": {
          "type": "string",
          "enum": ["supports", "refutes", "related", "derived_from"]
        }
      }
    }
  }
}
```

## Minimal example

```json
{
  "schemaVersion": "1.0.0",
  "exportedAt": "2026-08-07T12:00:00.000Z",
  "exporter": {
    "system": "clearfield-evidence-flow",
    "operatorId": "evens"
  },
  "casefile": {
    "id": "cf-2026-0001",
    "title": "Sample mesh case",
    "status": "active",
    "claims": [
      {
        "id": "cl-1",
        "text": "Example claim",
        "confidence": 0.7,
        "sourceIds": ["src-1"]
      }
    ],
    "sources": [
      {
        "id": "src-1",
        "urlOrRef": "https://example.com/report",
        "mediaType": "web"
      }
    ],
    "contradictions": [],
    "links": [
      { "from": "cl-1", "to": "src-1", "rel": "supports" }
    ]
  }
}
```

## Ingest checklist (SENTINEL staging)

- [ ] Reject payload if `schemaVersion` ≠ `1.0.0`
- [ ] Verify signature / auth on export API or signed drop
- [ ] Persist casefile id idempotently (re-export safe)
- [ ] Do not write Clearfield data into CE CRM leads
- [ ] Log ingest to Scorpion hive register as operator work
