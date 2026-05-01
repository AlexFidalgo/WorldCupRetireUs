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

