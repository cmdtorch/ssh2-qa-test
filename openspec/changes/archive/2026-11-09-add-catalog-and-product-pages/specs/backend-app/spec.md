# Spec Delta

## MODIFIED Requirements

### Requirement: REST API baseline without business endpoints
The backend SHALL serve its API through Django REST Framework under `/api/`, and SHALL expose no API endpoint other than the health check `/api/health/` and the public read-only product catalog endpoints `/api/products/`, `/api/products/availability/` and `/api/products/<short-name>/`.

#### Scenario: Unknown API address
- **WHEN** a client sends `GET /api/does-not-exist/`
- **THEN** the response status is 404

#### Scenario: Product catalog endpoints are public
- **WHEN** an anonymous client sends `GET /api/products/`, `GET /api/products/availability/?items=chanel-gabrielle:30` and `GET /api/products/chanel-gabrielle/` for a visible product
- **THEN** each response status is 200

#### Scenario: Product catalog is read-only
- **WHEN** an anonymous client sends `POST /api/products/` with a product in the body
- **THEN** the response status is 405
- **AND** no product is created
