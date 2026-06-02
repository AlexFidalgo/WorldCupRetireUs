# Running app
uvicorn app.main:app --reload

Uvicorn is the thing that:
- listens on a port (e.g., 127.0.0.1:8000)
- receives HTTP requests
- passes them to your FastAPI app
- returns the response

The `--reload` flag enables auto-reload on code changes. With --reload:
- Uvicorn watches your files
- Any change → server restarts automatically
Use it only in development. Never in production.

# Swagger UI
http://127.0.0.1:8000/docs
This is auto-generated documentation.
“Automatic OpenAPI docs via Swagger UI and ReDoc.
You can send requests directly from the browser (interactive).

# ReDoc
Clean documentation.
Read-only.
More structured and clean.
Looks like official API docs.

# Pydantic
What is Pydantic used for in FastAPI? It defines and validates request and response schemas using Python type hints.

# APIRouter

APIRouter lets us split endpoints into modular files by domain, keeping main.py focused on application setup.
```py
router = APIRouter(
    prefix="/scenarios",
    tags=["scenarios"],
)
```
`tags=["scenarios"]` groups the endpoint nicely in Swagger.

# Dependency Injection

Allows you to:
- swap implementations (e.g., mock vs real)
- inject database sessions later
- keep routes thin
- test easily

Initially, we had:
```py
@router.post("/calculate", response_model=ScenarioCalculateResponse)
def calculate_scenario_endpoint(request: ScenarioCalculateRequest):
    result = calculate_scenario(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )
    return result
```
That works, but in real systems we don’t call logic directly — we inject dependencies.

We create a class and a function in `app/services/scenario_calculator.py`:
```py
class ScenarioService:
    def calculate(
        self,
        teams,
        odds,
        bet_weights,
        base_amount,
    ):
        return calculate_scenario(
            teams=teams,
            odds=odds,
            bet_weights=bet_weights,
            base_amount=base_amount,
        )

def get_scenario_service():
    return ScenarioService()
```

Then we replace the endpoint with:
```py
@router.post("/calculate", response_model=ScenarioCalculateResponse)
def calculate_scenario_endpoint(
    request: ScenarioCalculateRequest,
    service: ScenarioService = Depends(get_scenario_service),
):
    return service.calculate(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )
```

`service: ScenarioService = Depends(get_scenario_service)`: when calling this function, here’s how you should obtain service. Call `get_scenario_service()` and put the result into service.
Note that it returns `service.calculate`.

What is `Depends` in FastAPI? It’s FastAPI’s dependency injection system, used to provide reusable components like services, database sessions, or authentication.

Later you can:
- replace service with a mock (testing)
- inject DB session inside service
- reuse service across routes

When a request hits:
```http
POST /scenarios/calculate
```
FastAPI:

#### 1. Sees your function
```python
def calculate_scenario_endpoint(
    request: ScenarioCalculateRequest,
    service: ScenarioService = Depends(get_scenario_service),
):
```
### 2. Resolves dependencies
* Calls:

  ```python
  get_scenario_service()
  ```
* Gets:

  ```python
  ScenarioService()
  ```
### 3. Injects it

Equivalent to:
```python
service = ScenarioService()
```
### 4. Calls your function

With Depends, you can later:

### 🔁 Swap implementation
```python
def get_scenario_service():
    return MockScenarioService()
```

### 🗄️ Inject database
```python
def get_scenario_service(db=Depends(get_db)):
    return ScenarioService(db)
```

### 🔐 Add auth
```python
def get_current_user():
    ...
```
What does Depends do? Depends declares a dependency that FastAPI resolves automatically. It tells FastAPI how to create or retrieve a value for a function parameter, enabling dependency injection.

# Databases

```py
def get_session():
    with Session(engine) as session:
        yield session
```

A function with `yield` doesn’t return a single value and finish. Instead, it becomes a generator:
- It pauses, returns a value
- Then resumes from where it left off the next time you ask for a value

`return`
- function ends immediately
- gives back a value
`yield`
- pauses the function
- gives back a value temporarily
- resumes later

`yield` is used for *setup + cleanup*.

When your endpoint runs `session: Session = Depends(get_session)`. FastAPI:
- calls get_session()
- runs until yield → gives you session
- your endpoint executes
- after response → resumes function → closes session

In FastAPI, `yield` is used in dependencies to provide a resource and ensure cleanup after the request lifecycle.

This:
```python
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
```
runs when:
```bash
uvicorn app.main:app
```
starts.

Why not just return the session immediately instead of using yield? Because you don’t just need the session — you need control over its lifecycle.

A database session is a resource that must be:
1. *created*
2. *used*
3. *closed*

If you wrote:

```python
def get_session():
    return Session(engine)
```

Then FastAPI:
* calls `get_session()`
* gets a session
* passes it to your endpoint
But it does not get closed!
With:
```python
def get_session():
    with Session(engine) as session:
        yield session
```
You’re saying:
- give this session to the endpoint.
- and when it’s done, come back here and clean it up.

# Interacting with SQLite

Create a `sql` file, write the query and run `Ctrl + Shift + Q`.

# `save` route

The code below is creating an object mapped to a database variable.
```py
    scenario = Scenario(
        base_amount=result["base_amount"],
        total_bet=result["total_bet"],
        data=result,
    )
```
Because the `Scenario` class is mapped to the table:
```py
class Scenario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    base_amount: float
    total_bet: float
    data: dict = Field(sa_column=Column(JSON))
```
`table=True` tells SQLModel that this class represents a database table. By default, `class Scenario → table name = "scenario"`: lowercased class name.
The mapping is stored inside `SQLModel.metadata`.

Go to `http://127.0.0.1:8000/docs`.
Use `POST /scenarios/save`, with:
```sql
{
  "teams": ["Brazil", "Argentina", "France", "England"],
  "odds": {
    "Brazil": {"Bet365": 6.5, "Betano": 6.0},
    "Argentina": {"Bet365": 8.0},
    "France": {"Bet365": 7.0},
    "England": {"Bet365": 9.0}
  },
  "bet_weights": {
    "Brazil": 2,
    "Argentina": 1,
    "France": 0,
    "England": 3
  },
  "base_amount": 10
}
```
which is equivalent to
```sh
curl -X 'POST' \
  'http://127.0.0.1:8000/scenarios/save' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "teams": ["Brazil", "Argentina", "France", "England"],
  "odds": {
    "Brazil": {"Bet365": 6.5, "Betano": 6.0},
    "Argentina": {"Bet365": 8.0},
    "France": {"Bet365": 7.0},
    "England": {"Bet365": 9.0}
  },
  "bet_weights": {
    "Brazil": 2,
    "Argentina": 1,
    "France": 0,
    "England": 3
  },
  "base_amount": 10
}'
```
Then query:
```sql
SELECT * FROM scenario;
```

# CRUD

| Operation | Endpoint               |
| --------- | ---------------------- |
| Create    | POST /scenarios/save   |
| Read all  | GET /scenarios         |
| Read one  | GET /scenarios/{id}    |
| Update    | PUT /scenarios/{id}    |
| Delete    | DELETE /scenarios/{id} |

# Authentication

```
app/
  auth/
    password.py
    jwt.py
  routers/
    users.py
    auth.py
```

```sh
pip install "passlib[bcrypt]" "python-jose[cryptography]" python-multipart
```

passlib[bcrypt]        password hashing
python-jose            create and verify JWT tokens
python-multipart       lets FastAPI receive OAuth2 form login data

JWT:
- User logs in → server verifies credentials
- Server generates token with user info
- Client sends token in future requests
- Server validates token instead of re-checking password

```http
POST /auth/login
```
Response:
```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```
Then, client must store the token
Options:
* localStorage (common, but less secure)
* httpOnly cookies (more secure)
* memory (frontend state)
Then, client must send it manually
Every request must include:
```http
Authorization: Bearer <token>
```
The browser does not automatically append the token. The frontend (React, etc.) must do it.

## Protecting the routes

Protecting a route: this endpoint can only be accessed if the user is authenticated.
The request must include a valid JWT, the server must validate it, and the server must identify the user.

FastAPI will:
- extract token from request
- decode JWT
- find user in DB
- inject user into function
- only then execute your logic

How do you protect endpoints in FastAPI? We use dependency injection with a function that validates the JWT token and retrieves the current user. This dependency is added to endpoints using Depends.

Why inject `current_user` i the route function parameters, even if not used? It enforces authentication via dependency injection, and also provides the authenticated user for authorization logic such as ownership checks.

# Testing


```python
from app.services.scenario_calculator import calculate_scenario


def test_calculate_scenario_basic():
    teams = ["Brazil", "Argentina"]

    odds = {
        "Brazil": {"Bet365": 6.5},
        "Argentina": {"Bet365": 8.0},
    }

    bet_weights = {
        "Brazil": 2,
        "Argentina": 1,
    }

    result = calculate_scenario(
        teams=teams,
        odds=odds,
        bet_weights=bet_weights,
        base_amount=10,
    )

    assert result["total_bet"] == 30

    assert len(result["rows"]) == 2

    brazil = result["rows"][0]

    assert brazil["team"] == "Brazil"
    assert brazil["bet_amount"] == 20
    assert brazil["best_odd"] == 6.5
```
In PowerShell, run
```sh
pytest
```

Create a file named `pytest.ini` in the root directory, with this content:
```ini
[pytest]
pythonpath = .
```

Pytest collects every file named `test_*.py`. So if it is inside tests/, pytest treats it as a real test. By default, pytest will look recursively from the project root and collect:
- files named: test_*.py or *_test.py
- functions named: test_*
- classes named: Test*

For example, in `test_auth_flow.py`, we have:
```py
client = TestClient(app)
```
`TestClient` spins up the FastAPI app in memory. 
means:
- no uvicorn
- no port
- no browser
Tests call your app directly.

We need to make tests user their own SQLite database instead of your real app DB.

Create:

```text
tests/conftest.py
```
```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_test_session():
        yield session

    app.dependency_overrides[get_session] = get_test_session

    client = TestClient(app)

    yield client

    app.dependency_overrides.clear()
```
This creates an **in-memory test database**.

So every test starts with:
```text
empty database
```
and your real file:

```text
worldcup_retire_us.db
```
is not touched.

This file
- creates a **temporary test database**
- replaces your real DB dependency (`get_session`)
- gives you a ready-to-use **client** for API tests.

```python
@pytest.fixture
```
pytest automatically discovers and uses **fixtures**.

Inside `test_auth_flow.py`, we have:
```py
def test_create_user_and_login(client)
```
pytest injects the client argument automatically from `@pytest.fixture(name="client")`.

pytest
1. scans files
2. finds test functions
3. sees parameters like `client`
4. looks for a fixture named `client`
5. finds it in `conftest.py`
6. executes it

```python
@pytest.fixture(name="session")
def session_fixture():
```
defines a fixture named `"session"`.
```python
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```
creates an **in-memory SQLite database**.

```text
"sqlite://" → no file → RAM only
```

```python
poolclass=StaticPool
```
forces all connections to use the **same memory DB**. Without `StaticPool`, each connection = new empty DB and tests break.

```python
SQLModel.metadata.create_all(engine)
```
creates all tables (`User`, `Scenario`).

```python
with Session(engine) as session:
    yield session
```
gives a DB session to whoever needs it.

```python
@pytest.fixture(name="client")
def client_fixture(session: Session):
```
this fixture **depends on session**.
pytest sees "client needs session" → build session first.

```python
def get_test_session():
    yield session

app.dependency_overrides[get_session] = get_test_session
```
The app normally does:
```python
session: Session = Depends(get_session)
```
Now we override it: "Instead of real DB → use test DB".

```python
client = TestClient(app)
```
creates a fake HTTP client.

```python
app.dependency_overrides.clear()
```
removes override after test.


When you run:

```python
def test_create_user_and_login(client):
```
pytest does:
### Step 1
Build `session`:
```text
create in-memory DB
create tables
```
### Step 2
Build `client`:
```text
override get_session → use test session
create TestClient
```
### Step 3
Run test:
```text
POST /users
POST /auth/login
```
### Step 4
Cleanup:
```text
clear dependency overrides
destroy session
```

“How do you test FastAPI with a database?”
“We use pytest fixtures to create an isolated test database and override FastAPI dependencies so the application uses the test DB instead of the real one.”

# Pagination

Pagination means returning data in chunks instead of everything at once.

Imagine you have 10,000 scenarios. Your API:
```http
GET /scenarios
```
returns:
```text
10,000 items
```
This results in slow response, high memory usage, unnecessary data transfer.

With pagination, you return **small slices**:
```http
GET /scenarios?limit=10&offset=0
```
returns first 10
```http
GET /scenarios?limit=10&offset=10
```
returns next 10

## 1. Offset-based (we’ll implement this)

```text
limit = how many items
offset = where to start
```
Example:

```text
limit=10, offset=0   → items 1–10
limit=10, offset=10  → items 11–20
```
## 2. Cursor-based

```text
limit = how many items
cursor = a marker that says where to continue from
```
Example
```text
limit=10, cursor=null     → items 1–10
limit=10, cursor=item_10  → items 11–20
limit=10, cursor=item_20  → items 21–30
```
The API usually returns the next cursor together with the results:
```json
{
  "data": [
    "item 1",
    "item 2",
    "item 3"
  ],
  "nextCursor": "item_3"
}
```

Cursor-based pagination is usually better when data changes frequently. Imagine you are using offset pagination:
```text
limit=10, offset=10
```
But before you request the second page, someone inserts a new item at the beginning. Now the positions changed, so you may see a duplicate item or skip one. With cursor pagination, you continue after a specific item, so it is more stable.

```py
def list_scenarios_endpoint(
    limit: int = Query(default=10, ge=1, le=100), # default = 10, minimum = 1, maximum = 100
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
)
```
# Sorting

Pagination without sorting can be unstable because the database does not guarantee row order unless we explicitly tell it.

# Filtering

```py
@router.get("/", response_model=List[ScenarioPublicResponse])
def list_scenarios_endpoint(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="id"),
    sort_order: str = Query(default="asc"),
    username: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
```

# Pydantic schemas

```py
class OddCreateRequest(BaseModel):
    team: str
    platform: str
    market: str = "winner"
    odd: float = Field(gt=0)
    source_url: Optional[str] = None


class OddResponse(BaseModel):
    id: int
    team: str
    platform: str
    market: str
    odd: float
    source_url: Optional[str]
    scraped_at: datetime
```

These are Pydantic schemas. Pydant schemas define the shape of data that enters and leaves the API.

Use separate Pydantic schemas for request and response models so the API has explicit validation and serialization boundaries. The create schema accepts only client-provided fields, while the response schema includes server-generated fields like id and timestamps. FastAPI uses these schemas for request validation, response filtering, and OpenAPI documentation.

request: OddCreateRequest: FastAPI reads JSON from the request body and validates it with Pydantic.
session: Session = Depends(get_session): FastAPI injects the DB session for this request.
odd = Odd(...): convert from API schema to DB model.
session.add(odd): stage object for insertion.
session.commit(): persist to the database.
session.refresh(odd): reload the object so generated fields like id are available.
response_model=OddResponse: FastAPI serializes the returned object into the public response shape.

# Scraper

base.py:
```py
from abc import ABC, abstractmethod
from typing import List

from app.schemas import OddCreateRequest


class OddsProvider(ABC):
    @abstractmethod
    def fetch_winner_odds(self) -> List[OddCreateRequest]:
        pass
```
The purpose of this class is to define a common interface for other classes. Any class that claims to be an odds provider must implement a method called `fetch_winner_odds`, and that method must return a list of `OddCreateRequest` objects.
Python has a built-in module called `abc`, which stands for _Abstract Base Classes_.
`abstactmethod` s a decorator used to mark a method as required, but not implemented yet. Together, they let you define a class that works like a contract.
`class OddsProvider(ABC):` means this class should behave like an abstract base class and enforce abstract methods.

# Frontend

```sh
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom
```

Run the frontend
```sh
npm run dev
```

Vite will start on `http://localhost:5173`.

