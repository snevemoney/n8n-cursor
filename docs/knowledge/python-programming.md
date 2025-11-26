# Python Programming Knowledge Base

## Python Fundamentals

### Data Structures

#### Lists
**Mutable, ordered collection**
```python
# Creation
nums = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, [1, 2]]

# Common operations
nums.append(6)           # Add to end
nums.insert(0, 0)        # Insert at index
nums.extend([7, 8])      # Add multiple
nums.remove(3)           # Remove first occurrence
popped = nums.pop()      # Remove and return last
nums[1:3]               # Slicing

# List comprehension
squares = [x**2 for x in range(10)]
evens = [x for x in nums if x % 2 == 0]
```

#### Dictionaries
**Mutable, key-value pairs**
```python
# Creation
person = {"name": "Alice", "age": 30}
person = dict(name="Alice", age=30)

# Operations
person["city"] = "NYC"              # Add/update
age = person.get("age", 0)          # Safe get with default
person.pop("age")                   # Remove and return
person.keys()                       # Get all keys
person.values()                     # Get all values
person.items()                      # Get (key, value) tuples

# Dict comprehension
squared = {x: x**2 for x in range(5)}
```

#### Sets
**Mutable, unordered, unique elements**
```python
# Creation
fruits = {"apple", "banana", "orange"}
fruits = set(["apple", "banana", "apple"])  # Duplicates removed

# Operations
fruits.add("grape")
fruits.remove("banana")  # KeyError if not found
fruits.discard("kiwi")   # No error if not found
fruits.union(other_set)
fruits.intersection(other_set)
fruits.difference(other_set)
```

#### Tuples
**Immutable, ordered collection**
```python
# Creation
point = (10, 20)
single = (1,)  # Comma required for single element

# Unpacking
x, y = point
first, *rest = (1, 2, 3, 4)  # first=1, rest=[2,3,4]

# Named tuples
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(11, 22)
print(p.x, p.y)
```

### Functions

#### Function Definition
```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

# Default arguments
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# *args and **kwargs
def sum_all(*args):
    return sum(args)

def config(**kwargs):
    return kwargs

# Type hints (Python 3.5+)
def add(a: int, b: int) -> int:
    return a + b

# Lambda functions
square = lambda x: x**2
pairs = [(1, 'one'), (2, 'two')]
pairs.sort(key=lambda pair: pair[1])
```

#### Decorators
```python
# Basic decorator
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(1)

# Decorator with arguments
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")
```

### Classes and OOP

#### Class Definition
```python
class Dog:
    # Class variable
    species = "Canis familiaris"
    
    def __init__(self, name, age):
        # Instance variables
        self.name = name
        self.age = age
    
    # Instance method
    def bark(self):
        return f"{self.name} says Woof!"
    
    # Class method
    @classmethod
    def from_birth_year(cls, name, birth_year):
        return cls(name, 2025 - birth_year)
    
    # Static method
    @staticmethod
    def is_adult(age):
        return age >= 2
    
    # Property
    @property
    def human_age(self):
        return self.age * 7
    
    # String representation
    def __repr__(self):
        return f"Dog(name={self.name}, age={self.age})"
    
    def __str__(self):
        return f"{self.name} is {self.age} years old"

# Usage
buddy = Dog("Buddy", 3)
print(buddy.bark())
print(buddy.human_age)
```

#### Inheritance
```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        raise NotImplementedError("Subclass must implement")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

# Multiple inheritance
class FlyingMixin:
    def fly(self):
        return f"{self.name} is flying!"

class Bird(Animal, FlyingMixin):
    def speak(self):
        return f"{self.name} says Tweet!"
```

#### Special Methods
```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __len__(self):
        return int((self.x**2 + self.y**2)**0.5)
    
    def __getitem__(self, index):
        return [self.x, self.y][index]
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
```

## Advanced Python

### Context Managers
```python
# Using with statement
with open('file.txt', 'r') as f:
    content = f.read()
# File automatically closed

# Creating context manager
from contextlib import contextmanager

@contextmanager
def temporary_file(filename):
    f = open(filename, 'w')
    try:
        yield f
    finally:
        f.close()
        os.remove(filename)

# Usage
with temporary_file('temp.txt') as f:
    f.write('temporary data')

# Class-based context manager
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect_to_db()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return False  # Don't suppress exceptions
```

### Generators
```python
# Generator function
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Usage
for num in fibonacci(10):
    print(num)

# Generator expression
squares = (x**2 for x in range(10))

# Infinite generator
def infinite_sequence():
    num = 0
    while True:
        yield num
        num += 1

# Generator with send
def coroutine():
    while True:
        x = yield
        print(f"Received: {x}")

gen = coroutine()
next(gen)  # Prime the generator
gen.send(10)
gen.send(20)
```

### Iterators
```python
class Countdown:
    def __init__(self, start):
        self.current = start
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        num = self.current
        self.current -= 1
        return num

# Usage
for num in Countdown(5):
    print(num)
```

### Async/Await
```python
import asyncio

# Async function
async def fetch_data(url):
    await asyncio.sleep(1)  # Simulate I/O
    return f"Data from {url}"

async def main():
    # Run sequentially
    result1 = await fetch_data("url1")
    result2 = await fetch_data("url2")
    
    # Run concurrently
    results = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3")
    )
    
    # With timeout
    try:
        result = await asyncio.wait_for(
            fetch_data("slow_url"),
            timeout=2.0
        )
    except asyncio.TimeoutError:
        print("Request timed out")

# Run
asyncio.run(main())
```

## Common Libraries

### NumPy (Numerical Computing)
```python
import numpy as np

# Array creation
arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((3, 4))
ones = np.ones((2, 3))
range_arr = np.arange(0, 10, 2)
linspace = np.linspace(0, 1, 5)

# Array operations
arr + 10
arr * 2
arr ** 2
np.sqrt(arr)
np.exp(arr)

# Broadcasting
matrix = np.array([[1, 2, 3], [4, 5, 6]])
matrix + arr[:3]  # Broadcasts to each row

# Indexing and slicing
arr[0]
arr[1:4]
arr[arr > 3]  # Boolean indexing

# Matrix operations
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
A @ B  # Matrix multiplication
A.T  # Transpose
np.linalg.inv(A)  # Inverse
```

### Pandas (Data Analysis)
```python
import pandas as pd

# DataFrame creation
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
})

# Reading data
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
df = pd.read_json('data.json')

# Basic operations
df.head()
df.info()
df.describe()
df['age'].mean()
df['age'].median()
df['age'].std()

# Filtering
df[df['age'] > 25]
df[df['city'].isin(['NYC', 'LA'])]
df.query('age > 25 and city == "NYC"')

# Grouping
df.groupby('city')['age'].mean()
df.groupby('city').agg({'age': ['mean', 'min', 'max']})

# Merging
pd.merge(df1, df2, on='id', how='left')
pd.concat([df1, df2], axis=0)

# Apply functions
df['age_squared'] = df['age'].apply(lambda x: x**2)
df['full_info'] = df.apply(lambda row: f"{row['name']} - {row['age']}", axis=1)
```

### Requests (HTTP Library)
```python
import requests

# GET request
response = requests.get('https://api.example.com/data')
data = response.json()
status = response.status_code

# POST request
payload = {'key1': 'value1', 'key2': 'value2'}
response = requests.post('https://api.example.com/submit', json=payload)

# Headers
headers = {'Authorization': 'Bearer token123'}
response = requests.get('https://api.example.com/protected', headers=headers)

# Query parameters
params = {'search': 'python', 'limit': 10}
response = requests.get('https://api.example.com/search', params=params)

# Error handling
try:
    response = requests.get('https://api.example.com/data', timeout=5)
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.exceptions.Timeout:
    print("Request timed out")
```

## Best Practices

### Code Style (PEP 8)
- Use 4 spaces for indentation
- Line length: 79 characters
- Two blank lines between functions/classes
- One blank line between methods
- `snake_case` for functions/variables
- `PascalCase` for classes
- `UPPER_CASE` for constants

### Error Handling
```python
# Specific exceptions
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Value error: {e}")
except KeyError as e:
    logger.error(f"Key not found: {e}")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
finally:
    cleanup()

# Custom exceptions
class ValidationError(Exception):
    pass

def validate_age(age):
    if age < 0:
        raise ValidationError("Age cannot be negative")
```

### Testing (pytest)
```python
import pytest

def add(a, b):
    return a + b

# Test function
def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

# Fixtures
@pytest.fixture
def sample_data():
    return [1, 2, 3, 4, 5]

def test_with_fixture(sample_data):
    assert len(sample_data) == 5

# Parametrize
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected
```

### Logging
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app.log'
)

logger = logging.getLogger(__name__)

# Log messages
logger.debug("Detailed debugging information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred")
logger.critical("Critical error")

# With exception info
try:
    risky_operation()
except Exception:
    logger.exception("Operation failed")
```

