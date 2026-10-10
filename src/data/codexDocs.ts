export interface DocEntry {
  id: string;
  category: string;
  title: string;
  summary: string;
  syntax: string;
  explanation: string;
  example: string;
  commonPitfalls: string[];
}

export const CODEX_DOCS: DocEntry[] = [
  {
    id: 'types-casting',
    category: 'Core Fundamentals',
    title: 'Data Types & Type Casting',
    summary: 'Converting values between strings, integers, floats, and booleans.',
    syntax: `int("42")      # -> 42 (integer)
float("3.14")  # -> 3.14 (float)
str(100)       # -> "100" (string)
bool(1)        # -> True`,
    explanation: 'Python is strongly typed. You cannot perform mathematical operations directly between strings and numbers (e.g. "10" + 5 raises TypeError). Explicit type casting with int() or float() is required.',
    example: `raw_val = " 45.5 "
clean_val = float(raw_val.strip())
total = clean_val + 10.0  # 55.5`,
    commonPitfalls: [
      'Calling float("abc") raises ValueError: could not convert string to float.',
      'Integer division // truncates towards negative infinity, while / always yields a float.',
      'Strings with whitespace must be stripped with .strip() or cleaned before casting.'
    ]
  },
  {
    id: 'booleans-branching',
    category: 'Control Flow',
    title: 'Conditionals & Boolean Operators',
    summary: 'Branching execution paths with if, elif, else, and, or, not.',
    syntax: `if condition_a and condition_b:
    do_something()
elif condition_c or not condition_d:
    do_other()
else:
    fallback()`,
    explanation: '`and` requires BOTH sides to be True. `or` requires AT LEAST ONE side to be True. `not` inverts truthiness. Python short-circuits: in `A and B`, if A is False, B is never evaluated.',
    example: `reactor_output = 12
coolant_status = "STABLE"

# Only engage if output is low AND coolant is safe:
if reactor_output < 15 and coolant_status == "STABLE":
    mode = "BACKUP"
else:
    mode = "NOMINAL"`,
    commonPitfalls: [
      'Confusing `==` (equality comparison) with `=` (variable assignment).',
      'Using `or` when both conditions must be strictly satisfied.',
      'Writing chained conditions improperly: `if a == 1 or 2:` is buggy because `2` is always truthy! Write `if a == 1 or a == 2:`.'
    ]
  },
  {
    id: 'loops-sequences',
    category: 'Sequences & Iteration',
    title: 'Loops & Sequences (Lists & Strings)',
    summary: 'Iterating over elements, range(), slicing, and accumulation.',
    syntax: `for item in sequence:
    process(item)

for i in range(start, stop, step):
    process(i)`,
    explanation: '`for...in` traverses iterable objects like lists, strings, and tuples. `range(n)` iterates from 0 up to n - 1. Strings can be sliced with `s[start:stop]`.',
    example: `numbers = [10, 20, 30]
accumulator = 0
for n in numbers:
    accumulator += n
# accumulator is 60`,
    commonPitfalls: [
      'Modifying a list while iterating over it.',
      'Off-by-one errors with range(): range(5) produces 0, 1, 2, 3, 4 (not 5).',
      'Using `for i in range(len(items)):` when `for item in items:` is cleaner and more idiomatic.'
    ]
  },
  {
    id: 'dictionaries',
    category: 'Data Structures',
    title: 'Dictionaries & Key-Value Mappings',
    summary: 'High-speed hash tables for key-based lookups and records.',
    syntax: `my_dict = {"fuel": 100, "status": "NOMINAL"}
value = my_dict["fuel"]
safe_val = my_dict.get("shield", 0) # Fallback default
for k, v in my_dict.items():
    print(k, v)`,
    explanation: 'Dictionaries store key-value pairs with O(1) average lookup time. Direct indexing `my_dict[k]` raises KeyError if `k` is absent. Use `.get(k, default)` or `if k in my_dict:` for defensive access.',
    example: `manifest = {"bolts": 12, "rations": 3}
abundant = []
for item, qty in manifest.items():
    if qty > 5:
        abundant.append(item)`,
    commonPitfalls: [
      'Iterating over dict directly yields keys, not values: `for x in d:` makes `x` the key.',
      'Comparing string keys directly against integer numbers.',
      'Trying to use mutable objects (like lists) as dictionary keys.'
    ]
  },
  {
    id: 'sets-complexity',
    category: 'Data Structures',
    title: 'Sets & Algorithmic Optimization',
    summary: 'Unordered collections of unique elements with instant O(1) membership tests.',
    syntax: `unique_items = set([1, 2, 2, 3])  # -> {1, 2, 3}
if item in unique_items:          # O(1) constant time hash lookup
    proceed()`,
    explanation: 'Checking `item in my_list` requires scanning up to N elements (O(N) linear time). Checking `item in my_set` computes a hash and checks immediately (O(1) constant time). Converting a filter list to a set before a loop dramatically accelerates performance.',
    example: `blacklist = set(["NOISE_1", "NOISE_2"])
clean_stream = [packet for packet in incoming if packet not in blacklist]`,
    commonPitfalls: [
      'Expecting sets to preserve item insertion order (use lists or dicts if order matters).',
      'Sets can only contain hashable (immutable) items.'
    ]
  },
  {
    id: 'functions-scope',
    category: 'Functions & Scope',
    title: 'Functions, Parameters & Frames',
    summary: 'Encapsulating reusable logic with parameters, return statements, and local frames.',
    syntax: `def calculate_thrust(mass, burn_rate=1.0):
    thrust = mass * burn_rate
    return thrust`,
    explanation: 'Functions accept parameters and isolate variable bindings inside an execution frame. Names assigned inside a function remain local unless explicitly declared global. When a function reaches a `return` statement, it terminates immediately and passes the result back to the caller.',
    example: `def normalize_vector(x, y):
    magnitude = (x**2 + y**2) ** 0.5
    if magnitude == 0:
        return (0.0, 0.0)
    return (round(x / magnitude, 2), round(y / magnitude, 2))`,
    commonPitfalls: [
      'Forgetting the `return` statement: functions without a return implicitly evaluate to `None`.',
      'Using mutable default arguments (like `def func(items=[]):`), which share state across calls.',
      'Accidentally shadowing outer variable names without realizing local scope isolation.'
    ]
  },
  {
    id: 'exception-handling',
    category: 'Defensive Engineering',
    title: 'Exception Handling (try / except)',
    summary: 'Preventing system crashes through safe error interception.',
    syntax: `try:
    dangerous_operation()
except ValueError as err:
    handle_error(err)
except (KeyError, TypeError):
    fallback()
else:
    run_if_no_error()
finally:
    always_cleanup()`,
    explanation: 'Exceptions are Python signals that an unexpected condition occurred. Catching specific exception types allows your software to recover gracefully rather than crashing.',
    example: `cleaned = []
for raw in ["12.5", "BAD_DATA", "40.0"]:
    try:
        cleaned.append(float(raw))
    except ValueError:
        continue  # Skip corrupted telemetry frame`,
    commonPitfalls: [
      'Using bare `except:` without specifying the error type (this catches KeyboardInterrupt and SystemExit, hiding critical bugs).',
      'Silently ignoring errors with `pass` without understanding why the error occurred.'
    ]
  },
  {
    id: 'classes-oop',
    category: 'Object-Oriented Architecture',
    title: 'Classes, Instances & State',
    summary: 'Encapsulating behavior and attributes in reusable object blueprints.',
    syntax: `class SystemModule:
    def __init__(self, name, max_power):
        self.name = name
        self.power = max_power

    def consume(self, amount):
        self.power = max(0, self.power - amount)`,
    explanation: 'A class defines a blueprint for objects. `__init__` is the constructor invoked upon instantiation. The `self` parameter references the active instance, enabling instance-specific state persistence across method calls.',
    example: `class ShieldGenerator:
    def __init__(self, capacity):
        self.capacity = capacity
        self.current = capacity

    def absorb(self, damage):
        self.current = max(0, self.current - damage)

    def recharge(self, amount):
        self.current = min(self.capacity, self.current + amount)`,
    commonPitfalls: [
      'Omitting `self` as the first parameter of instance methods: `def foo(self):`.',
      'Accessing instance variables without `self.` (e.g. writing `current` instead of `self.current`).',
      'Confusing class-level attributes with instance-level attributes.'
    ]
  },
  {
    id: 'error-playbook',
    category: 'Debugging Playbook',
    title: 'The Python Error Playbook',
    summary: 'How to decode common Python tracebacks and error types.',
    syntax: `Traceback (most recent call last):
  File "<user_code>", line 4, in <module>
TypeError: unsupported operand type(s) for +: 'int' and 'str'`,
    explanation: 'Tracebacks read from top to bottom, with the actual causing line at the bottom. Common error archetypes include:',
    example: `1. SyntaxError: Python could not parse your code (missing colon, mismatched parens).
2. TypeError: Incompatible types passed to operator or function (e.g., int + str).
3. ValueError: Type is correct, but value is invalid (e.g., float("hello")).
4. KeyError: Dictionary key does not exist.
5. IndexError: Sequence index is out of range.
6. NameError: Variable has not been defined in current scope.
7. ZeroDivisionError: Dividing by 0.`,
    commonPitfalls: [
      'Assuming the bug is on the line indicated by SyntaxError: often it is on the line immediately preceding it (e.g., an unclosed bracket).',
      'Looking at the top of a long traceback instead of the bottom message.'
    ]
  }
];
