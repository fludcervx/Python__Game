import { Mission } from '../types';

export const MISSIONS: Mission[] = [
  // =========================================================================
  // BLOCK 0: FOUNDATIONS (INTRODUCTORY MISSIONS 1 - 4)
  // =========================================================================
  {
    id: 'M1_FIRST_INSTRUCTIONS',
    blockId: 0,
    blockTitle: 'Block 0: Introductory Telemetry',
    nodeCode: 'NODE: M1_FIRST_INSTRUCTIONS',
    title: 'First Instructions: Terminal Telemetry',
    category: 'Build',
    difficulty: 'Foundational',
    conceptBrief: 'In Python, instructions execute one by one from top to bottom. The print() function outputs text to the standard terminal display. Strings are text wrapped in matching quotes (" or \').',
    briefing: 'Initialize communication telemetry for Station Codex. Write two print() statements: first emit "SYSTEM ONLINE", and then emit "BEACON ACTIVE" on the following line.',
    narrativeContext: 'Relay Beacon #1 reboot protocol: Terminal hardware expects exact case-sensitive startup messages.',
    targetFilename: 'station_init.py',
    verificationMode: 'stdout',
    expectedStdoutContains: ['SYSTEM ONLINE', 'BEACON ACTIVE'],
    learningObjectives: [
      'Call the built-in print() function',
      'Wrap textual data in matching double quotes ("...")',
      'Understand line-by-line sequential script execution'
    ],
    prerequisites: ['Basic keyboard literacy', 'Understanding of quotes and text'],
    starterCode: `# Station Telemetry Beacon
# Write two print() calls to emit the startup messages:
# 1. SYSTEM ONLINE
# 2. BEACON ACTIVE

print("SYSTEM ONLINE")
`,
    referenceSolution: `print("SYSTEM ONLINE")
print("BEACON ACTIVE")
`,
    testCases: [
      {
        name: 'Startup Message 1: SYSTEM ONLINE',
        input: [],
        expectedOutput: 'SYSTEM ONLINE',
        description: 'Emits "SYSTEM ONLINE" to terminal.'
      },
      {
        name: 'Startup Message 2: BEACON ACTIVE',
        input: [],
        expectedOutput: 'BEACON ACTIVE',
        description: 'Emits "BEACON ACTIVE" to terminal on the next line.'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Add a second line of code beneath line 1 calling print("BEACON ACTIVE").',
      stage2Rule: {
        title: 'Python Sequential Execution & The print() Function',
        explanation: 'Python executes code sequentially from top to bottom. Each print() function call automatically writes its argument followed by a newline. Text literals must be enclosed in double quotes ("text") or single quotes (\'text\').',
        documentationSnippet: `print("FIRST LINE")
print("SECOND LINE")`
      },
      stage3Diagnosis: {
        probableCause: 'Common bugs: (1) Missing closing quotation mark; (2) Capitalizing "Print" instead of lowercase "print"; (3) Missing parentheses.',
        astClues: 'Look for two ast.Call nodes targeting the built-in name "print".',
        lineHints: [5, 6]
      },
      stage4MicroExample: {
        concept: 'Emitting multiple lines to terminal',
        sampleCode: `print("SPEED: 100")
print("ALTITUDE: 5000")`,
        takeaway: 'Each print() statement outputs on its own separate line in the terminal.'
      },
      stage5WorkedSolution: {
        referenceCode: `print("SYSTEM ONLINE")
print("BEACON ACTIVE")`,
        whyItWorks: 'The Python interpreter parses line 1, calls print() with the string "SYSTEM ONLINE", sends it to stdout, and then moves to line 2 to send "BEACON ACTIVE".',
        transferChallenge: {
          prompt: 'Print a third message containing the station coordinates: "GRID: SECTOR-7".',
          expectedBehavior: 'print("GRID: SECTOR-7")'
        }
      }
    }
  },

  {
    id: 'M2_STORED_VALUES',
    prerequisiteId: 'M1_FIRST_INSTRUCTIONS',
    blockId: 0,
    blockTitle: 'Block 0: Introductory Telemetry',
    nodeCode: 'NODE: M2_STORED_VALUES',
    title: 'Stored Values: Fuel Reserves',
    category: 'Build',
    difficulty: 'Foundational',
    conceptBrief: 'Variables are named storage containers in computer memory. The assignment operator (=) binds a value on the right to the variable name on the left. Python supports standard arithmetic: +, -, *, /.',
    briefing: 'Calculate the remaining emergency power. Create a variable `power_reserve` set to 100. Create a variable `consumption` set to 35. Calculate `final_reserve = power_reserve - consumption`. Finally, print `final_reserve`.',
    narrativeContext: 'Power telemetry gauge: Calculate remaining battery units after subsystem ignition.',
    targetFilename: 'power_calculator.py',
    verificationMode: 'variables',
    expectedVariables: {
      power_reserve: 100,
      consumption: 35,
      final_reserve: 65
    },
    learningObjectives: [
      'Assign integer numbers to variable names using =',
      'Perform subtraction arithmetic with variable operands',
      'Inspect variable state mutations in the memory inspector'
    ],
    prerequisites: ['Assignment operator (=)', 'Arithmetic subtraction (-)'],
    starterCode: `# Power reserve calculation
power_reserve = 100
consumption = 35

# Calculate final_reserve and print it:
final_reserve = 0
`,
    referenceSolution: `power_reserve = 100
consumption = 35
final_reserve = power_reserve - consumption
print(final_reserve)
`,
    testCases: [
      {
        name: 'Variable: power_reserve == 100',
        input: [],
        expectedOutput: 100,
        description: 'power_reserve must equal 100.'
      },
      {
        name: 'Variable: consumption == 35',
        input: [],
        expectedOutput: 35,
        description: 'consumption must equal 35.'
      },
      {
        name: 'Variable: final_reserve == 65',
        input: [],
        expectedOutput: 65,
        description: 'final_reserve must be power_reserve - consumption (65).'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Replace `final_reserve = 0` with `final_reserve = power_reserve - consumption`. Then add `print(final_reserve)`.',
      stage2Rule: {
        title: 'Variable Assignment & Arithmetic Evaluation',
        explanation: 'In Python, the expression on the right of = evaluates first. `power_reserve - consumption` evaluates to `100 - 35 = 65`, which is then stored in the name `final_reserve`. Variable names in Python are case-sensitive and must not start with numbers.',
        documentationSnippet: `a = 10
b = 3
result = a - b
print(result)`
      },
      stage3Diagnosis: {
        probableCause: 'Do not put quotes around numbers or variable names: `final_reserve = "power_reserve - consumption"` stores a string of text, not the calculated number 65!',
        astClues: 'Look for ast.Assign binding an ast.BinOp with ast.Sub.',
        lineHints: [5, 6]
      },
      stage4MicroExample: {
        concept: 'Arithmetic with named variables',
        sampleCode: `initial_fuel = 50
used_fuel = 12
remaining = initial_fuel - used_fuel
# remaining is now 38`,
        takeaway: 'Variables hold values that can be referenced in subsequent expressions.'
      },
      stage5WorkedSolution: {
        referenceCode: `power_reserve = 100
consumption = 35
final_reserve = power_reserve - consumption
print(final_reserve)`,
        whyItWorks: 'The CPU assigns 100 and 35 into memory frames under those identifiers, evaluates the subtraction to 65, stores 65 into final_reserve, and prints it.',
        transferChallenge: {
          prompt: 'Add an emergency booster reserve of 20 to final_reserve: `boosted = final_reserve + 20`.',
          expectedBehavior: 'boosted = final_reserve + 20'
        }
      }
    }
  },

  {
    id: 'M3_AUTOMATED_DECISIONS',
    prerequisiteId: 'M2_STORED_VALUES',
    blockId: 0,
    blockTitle: 'Block 0: Introductory Telemetry',
    nodeCode: 'NODE: M3_AUTOMATED_DECISIONS',
    title: 'Automated Decisions: Radiation Sentry',
    category: 'Build',
    difficulty: 'Foundational',
    conceptBrief: 'Conditionals allow programs to choose different paths. `if` tests a comparison (such as <=, >, ==). If True, Python runs the indented block. `else:` runs when the condition is False.',
    briefing: 'Construct an automated radiation guard function `check_radiation(reading)`. If `reading` is 50 or below, return "SAFE". If `reading` exceeds 50, return "HAZARD".',
    narrativeContext: 'Environmental telemetry monitor: Validate radiation exposure thresholds before airlocks unlock.',
    targetFilename: 'radiation_sentry.py',
    verificationMode: 'function',
    functionName: 'check_radiation',
    learningObjectives: [
      'Write an `if...else` conditional branch',
      'Use the less-than-or-equal (`<=`) comparison operator',
      'Return distinct string values depending on numeric thresholds'
    ],
    prerequisites: ['if / else syntax', 'Comparison operators (<=, >)', 'Indentation'],
    starterCode: `def check_radiation(reading):
    # If reading is 50 or below, return "SAFE"
    # Otherwise return "HAZARD"
    if reading <= 50:
        return "SAFE"
    # Complete the else branch:
    
`,
    referenceSolution: `def check_radiation(reading):
    if reading <= 50:
        return "SAFE"
    else:
        return "HAZARD"
`,
    testCases: [
      {
        name: 'Low Radiation (25)',
        input: [25],
        expectedOutput: 'SAFE',
        description: '25 <= 50 -> "SAFE"'
      },
      {
        name: 'Boundary Threshold (50)',
        input: [50],
        expectedOutput: 'SAFE',
        description: '50 <= 50 is True (inclusive) -> "SAFE"'
      },
      {
        name: 'Elevated Radiation (51)',
        input: [51],
        expectedOutput: 'HAZARD',
        description: '51 > 50 -> "HAZARD"'
      },
      {
        name: 'Critical Exposure (150)',
        input: [150],
        expectedOutput: 'HAZARD',
        description: '150 > 50 -> "HAZARD"'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Add `else:` on line 6 (aligned with `if`), and on line 7 indented by 4 spaces add `return "HAZARD"`.',
      stage2Rule: {
        title: 'Python Indentation & if / else Blocks',
        explanation: 'In Python, blocks of code are defined by indentation (4 spaces). Every `if` condition ends with a colon (:). The code inside the branch must be indented. The `else:` statement also ends with a colon and runs when the condition is False.',
        documentationSnippet: `if x <= 50:
    return "SAFE"
else:
    return "HAZARD"`
      },
      stage3Diagnosis: {
        probableCause: 'Check for missing colons after `else:`, or using `< 50` instead of `<= 50` (50 itself is SAFE).',
        astClues: 'Look for ast.If with an orelse containing an ast.Return.',
        lineHints: [5, 6, 7]
      },
      stage4MicroExample: {
        concept: 'Two-way decision branch',
        sampleCode: `def classify(score):
    if score >= 70:
        return "PASS"
    else:
        return "FAIL"`,
        takeaway: '`if/else` guarantees one of the two branches will execute.'
      },
      stage5WorkedSolution: {
        referenceCode: `def check_radiation(reading):
    if reading <= 50:
        return "SAFE"
    else:
        return "HAZARD"`,
        whyItWorks: 'Testing reading <= 50 checks if the measurement is within nominal parameters. 50 returns SAFE because <= is inclusive. Anything greater falls through to the else branch returning HAZARD.',
        transferChallenge: {
          prompt: 'Add an emergency warning: if reading > 100, return "CRITICAL_HAZARD".',
          expectedBehavior: '`if reading > 100: return "CRITICAL_HAZARD"`'
        }
      }
    }
  },

  {
    id: 'M4_REPEATED_OPERATIONS',
    prerequisiteId: 'M3_AUTOMATED_DECISIONS',
    blockId: 0,
    blockTitle: 'Block 0: Introductory Telemetry',
    nodeCode: 'NODE: M4_REPEATED_OPERATIONS',
    title: 'Repeated Operations: Thruster Burn Sequence',
    category: 'Build',
    difficulty: 'Foundational',
    conceptBrief: 'Computers excel at repeating tasks. A `for` loop iterates over a sequence. `range(n)` generates integers 0, 1, 2, ... up to n - 1. In each pass, loop variables update and accumulators sum values.',
    briefing: 'Calculate cumulative fuel burn over a multi-second burn sequence. Implement `calculate_total_burn(seconds)`. For each second `i` from 0 up to `seconds - 1`, the fuel burned during that second is `(i * 2) + 5`. Sum the burns and return the total fuel consumed.',
    narrativeContext: 'Thruster flight computer: Step through each second of engine burn in the visual stepper to monitor fuel consumption across iterations.',
    targetFilename: 'thruster_burn.py',
    verificationMode: 'function',
    functionName: 'calculate_total_burn',
    learningObjectives: [
      'Construct a `for i in range(seconds):` loop',
      'Accumulate values into a running total (`total_fuel += rate`)',
      'Observe loop variable state changes across iterations in the visual debugger'
    ],
    prerequisites: ['for loop syntax', 'range() function', 'Accumulator pattern (+=)'],
    starterCode: `def calculate_total_burn(seconds):
    # Initialize total_fuel accumulator to 0
    total_fuel = 0
    
    # Loop over each second i in range(seconds):
    # Each second burns rate = (i * 2) + 5
    for i in range(seconds):
        rate = (i * 2) + 5
        total_fuel += rate
        
    return total_fuel
`,
    referenceSolution: `def calculate_total_burn(seconds):
    total_fuel = 0
    for i in range(seconds):
        rate = (i * 2) + 5
        total_fuel += rate
    return total_fuel
`,
    testCases: [
      {
        name: '4-Second Burn Sequence',
        input: [4],
        expectedOutput: 68,
        description: 'Second 0 (5) + Second 1 (7) + Second 2 (9) + Second 3 (11) = 68.'
      },
      {
        name: '0-Second Idle',
        input: [0],
        expectedOutput: 0,
        description: 'Zero seconds yields 0 burn.'
      },
      {
        name: '1-Second Pulse',
        input: [1],
        expectedOutput: 5,
        description: 'Single second (i=0) burns 5 units.'
      },
      {
        name: '5-Second Full Burn',
        input: [5],
        expectedOutput: 95,
        description: '5 seconds total sum equals 95.'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'The loop `for i in range(seconds):` runs `seconds` times. On each pass, compute `rate = (i * 2) + 5` and add it to `total_fuel`.',
      stage2Rule: {
        title: 'The Accumulator Loop Pattern',
        explanation: 'Before the loop, initialize a variable (`total_fuel = 0`). Inside the loop, add each iteration’s contribution using `total_fuel += rate`. After the loop completes, return the accumulated total.',
        documentationSnippet: `total = 0
for i in range(3):
    total += (i + 1)
return total  # 1 + 2 + 3 = 6`
      },
      stage3Diagnosis: {
        probableCause: 'Make sure `return total_fuel` is outside the loop! If it is indented inside the loop, the function will terminate during iteration 0.',
        astClues: 'Look for ast.For loop iterating over ast.Call to range, followed by ast.Return at function level.',
        lineHints: [6, 7, 8, 10]
      },
      stage4MicroExample: {
        concept: 'Stepping through loop iterations',
        sampleCode: `total = 0
for i in range(3):
    total += 10
# Iteration 0: total = 10
# Iteration 1: total = 20
# Iteration 2: total = 30`,
        takeaway: 'Notice how the loop variable `i` advances by 1 on each cycle.'
      },
      stage5WorkedSolution: {
        referenceCode: `def calculate_total_burn(seconds):
    total_fuel = 0
    for i in range(seconds):
        rate = (i * 2) + 5
        total_fuel += rate
    return total_fuel`,
        whyItWorks: '`range(seconds)` generates consecutive integers starting at 0 up to seconds - 1. Each pass calculates that second’s burn rate and increments the accumulator. Step through it in the visual stepper to observe i and total_fuel change on every step.',
        transferChallenge: {
          prompt: 'Calculate total burn using the mathematical sum formula without a loop.',
          expectedBehavior: '`return 2 * (seconds * (seconds - 1) // 2) + 5 * seconds`'
        }
      }
    }
  },

  // =========================================================================
  // CONTINUING MISSIONS (BLOCKS 1 - 4)
  // =========================================================================
  {
    id: 'M0.1_LOGIC_SWITCH',
    prerequisiteId: 'M4_REPEATED_OPERATIONS',
    blockId: 1,
    blockTitle: 'Block 1: Logic & Conditions',
    nodeCode: 'NODE: M0.1_LOGIC_SWITCH',
    title: 'Subsystem Power Routing',
    category: 'Repair',
    difficulty: 'Foundational',
    conceptBrief: 'Boolean operators combine conditions: `and` requires both sides to be True; `or` requires at least one side to be True.',
    briefing: 'Emergency batteries must engage ONLY when primary reactor output drops below 15% AND auxiliary coolant is stable. Currently, backup batteries fire prematurely.',
    narrativeContext: 'Station power grid telemetry alert: Inspect the boolean operator connecting reactor output and coolant status.',
    targetFilename: 'power_router.py',
    verificationMode: 'function',
    functionName: 'evaluate_power',
    learningObjectives: [
      'Distinguish boolean `and` from `or`',
      'Prevent short-circuit disjunction bugs',
      'Return deterministic string state codes'
    ],
    prerequisites: ['Comparison operators (<, ==)', 'Boolean and / or'],
    starterCode: `def evaluate_power(reactor_output, coolant_status):
    # BUG: Faulty boolean logic triggers backup power inappropriately
    if reactor_output < 15 or coolant_status == "STABLE":
        return "ENGAGE_BACKUP"
    return "STANDBY"
`,
    referenceSolution: `def evaluate_power(reactor_output, coolant_status):
    if reactor_output < 15 and coolant_status == "STABLE":
        return "ENGAGE_BACKUP"
    return "STANDBY"
`,
    testCases: [
      {
        name: 'Low Power & Stable Coolant',
        input: [10, 'STABLE'],
        expectedOutput: 'ENGAGE_BACKUP',
        description: 'Should engage backup: power is below 15% and coolant is safe.'
      },
      {
        name: 'Nominal Power & Stable Coolant',
        input: [50, 'STABLE'],
        expectedOutput: 'STANDBY',
        description: 'Should remain in STANDBY: main reactor is sufficiently energized.'
      },
      {
        name: 'Low Power & Unstable Coolant',
        input: [10, 'CRITICAL'],
        expectedOutput: 'STANDBY',
        description: 'Should NOT engage backup if coolant is hazardous.'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Replace `or` with `and` in the conditional statement.',
      stage2Rule: {
        title: 'Boolean Conjunction (and)',
        explanation: '`A and B` is True only if BOTH A and B are True.',
        documentationSnippet: 'if reactor_output < 15 and coolant_status == "STABLE":'
      },
      stage3Diagnosis: {
        probableCause: 'Using `or` causes backup power to engage whenever coolant is STABLE, regardless of reactor level.',
        astClues: 'Look for ast.BoolOp with ast.And.',
        lineHints: [3]
      },
      stage4MicroExample: {
        concept: 'Two constraints must hold together',
        sampleCode: 'if temp > 100 and pressure > 50:\n    vent()',
        takeaway: '`and` requires both sides to be truthy.'
      },
      stage5WorkedSolution: {
        referenceCode: `def evaluate_power(reactor_output, coolant_status):
    if reactor_output < 15 and coolant_status == "STABLE":
        return "ENGAGE_BACKUP"
    return "STANDBY"`,
        whyItWorks: 'The `and` conjunction guarantees the condition only evaluates to True when both tests pass.',
        transferChallenge: {
          prompt: 'Add an emergency manual override flag: `if (output < 15 and status == "STABLE") or override:`.',
          expectedBehavior: 'Combine conjunction with disjunction.'
        }
      }
    }
  },

  {
    id: 'M1.2_INVENTORY_PARSER',
    prerequisiteId: 'M0.1_LOGIC_SWITCH',
    blockId: 2,
    blockTitle: 'Block 2: Data Structures',
    nodeCode: 'NODE: M1.2_INVENTORY_PARSER',
    title: 'Cargo Manifest Ledger',
    category: 'Repair',
    difficulty: 'Foundational',
    conceptBrief: 'Dictionaries store key-value associations. Iterating `for k in d:` yields keys. Use `for k, v in d.items():` to unpack both key and value.',
    briefing: 'A cargo inventory arrives as a dictionary mapping item names to integer quantities. Fix the function to return a list of item names whose quantity is strictly greater than 5.',
    narrativeContext: 'Bay manifest reader crashed with `TypeError: \'>\' not supported between instances of \'str\' and \'int\'`. The previous coder compared keys instead of values.',
    targetFilename: 'cargo_manifest.py',
    verificationMode: 'function',
    functionName: 'filter_abundant_cargo',
    learningObjectives: [
      'Iterate dictionaries with .items()',
      'Compare numerical values rather than string keys',
      'Construct and return filtered lists'
    ],
    prerequisites: ['Dictionaries', '.items() iteration', 'List .append()'],
    starterCode: `def filter_abundant_cargo(manifest):
    # BUG: Iterates over keys directly, attempting to compare item name (str) > 5 (int)
    abundant = []
    for item in manifest:
        if item > 5:
            abundant.append(item)
    return abundant
`,
    referenceSolution: `def filter_abundant_cargo(manifest):
    abundant = []
    for item, quantity in manifest.items():
        if quantity > 5:
            abundant.append(item)
    return abundant
`,
    testCases: [
      {
        name: 'Standard Manifest',
        input: [{ bolts: 12, rations: 3, cells: 8 }],
        expectedOutput: ['bolts', 'cells'],
        description: 'Bolts (12) and cells (8) exceed 5.'
      },
      {
        name: 'All Low Inventory',
        input: [{ water: 2, filters: 1 }],
        expectedOutput: [],
        description: 'No item exceeds 5.'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Change `for item in manifest:` to `for item, quantity in manifest.items():` and compare `if quantity > 5:`.',
      stage2Rule: {
        title: 'Dictionary Key-Value Unpacking',
        explanation: 'Calling `.items()` yields tuples of (key, value) which can be unpacked into two variables.',
        documentationSnippet: 'for key, val in dict_obj.items():'
      },
      stage3Diagnosis: {
        probableCause: 'Comparing a string name with an integer throws a TypeError.',
        astClues: 'Look for ast.For iterating over ast.Call to items().',
        lineHints: [4, 5]
      },
      stage4MicroExample: {
        concept: 'Unpacking key and value',
        sampleCode: `scores = {"A": 90, "B": 40}
passed = [k for k, v in scores.items() if v >= 60]`,
        takeaway: '`.items()` separates the label from the magnitude.'
      },
      stage5WorkedSolution: {
        referenceCode: `def filter_abundant_cargo(manifest):
    abundant = []
    for item, quantity in manifest.items():
        if quantity > 5:
            abundant.append(item)
    return abundant`,
        whyItWorks: '`.items()` unpacks both the identifier and the integer count, allowing a type-safe comparison.',
        transferChallenge: {
          prompt: 'Write this as a single-line list comprehension.',
          expectedBehavior: '`[k for k, v in manifest.items() if v > 5]`'
        }
      }
    }
  },

  {
    id: 'M2.3_ORBITAL_REPAIR',
    prerequisiteId: 'M1.2_INVENTORY_PARSER',
    blockId: 3,
    blockTitle: 'Block 3: Streams & Sanitization',
    nodeCode: 'NODE: M2.3_ORBITAL_REPAIR',
    title: 'Orbital Telemetry Stream Repair',
    category: 'Repair',
    difficulty: 'Intermediate',
    conceptBrief: 'External data streams often contain dirty strings with whitespace, sentinel flags, and incorrect formatting. Sanitize text with .strip(), convert types with float(), and filter invalid values.',
    briefing: 'Station telemetry relay station #4 is returning corrupt fuel consumption reports. Clean and sum only valid numerical telemetry frames, ignoring negative sentinel values (-999).',
    narrativeContext: 'Station fuel telemetry relay #4: Filter out -999 flags and return a clean numerical total.',
    targetFilename: 'telemetry_stream.py',
    verificationMode: 'function',
    functionName: 'process_telemetry',
    learningObjectives: [
      'Strip whitespace with .strip()',
      'Cast strings to float()',
      'Filter out sentinel codes (-999)',
      'Return a raw float instead of a formatted string'
    ],
    prerequisites: ['Lists', 'String methods (.strip())', 'float() casting', 'Branching'],
    starterCode: `def process_telemetry(data_stream):
    total_fuel = 0
    for entry in data_stream:
        # BUG 1: Fails to strip whitespace and convert strings
        # BUG 2: Fails to ignore negative sentinel values (-999)
        # BUG 3: Appends string values instead of mathematical addition
        if entry != -999:
            total_fuel = total_fuel + entry
    return "Total Fuel: " + total_fuel
`,
    referenceSolution: `def process_telemetry(data_stream):
    total_fuel = 0.0
    for entry in data_stream:
        clean_str = entry.strip()
        val = float(clean_str)
        if val != -999.0 and val != -999:
            total_fuel += val
    return total_fuel
`,
    testCases: [
      {
        name: 'Standard Stream',
        input: [[' 12.5 ', '45.0', '100']],
        expectedOutput: 157.5,
        description: '12.5 + 45.0 + 100.0 = 157.5'
      },
      {
        name: 'Sentinels & Spaces',
        input: [['10', '-999', '20.5', '  5.0  ', '-999']],
        expectedOutput: 35.5,
        description: '10 + 20.5 + 5.0 = 35.5 (ignores both -999 markers).'
      }
    ],
    stageAssistance: {
      stage1Nudge: 'Strip whitespace with `entry.strip()`, cast with `float(...)`, check `if val != -999:`, and return `total_fuel` directly.',
      stage2Rule: {
        title: 'String Cleaning & Float Casting',
        explanation: 'Always sanitize external strings before numeric conversion. Return the raw numerical float.',
        documentationSnippet: `num = float(raw_str.strip())
if num != -999:
    total += num`
      },
      stage3Diagnosis: {
        probableCause: 'Three bugs: string math without float(), string -999 comparison, and returning "Total Fuel: " string.',
        astClues: 'Look for float(entry.strip()) and return total_fuel.',
        lineHints: [4, 7, 8, 9]
      },
      stage4MicroExample: {
        concept: 'Sanitize-parse-accumulate pattern',
        sampleCode: `total = 0.0
for s in [" 1.5 ", "2.0"]:
    total += float(s.strip())`,
        takeaway: 'Convert dirty data to clean types as early as possible.'
      },
      stage5WorkedSolution: {
        referenceCode: `def process_telemetry(data_stream):
    total_fuel = 0.0
    for entry in data_stream:
        val = float(entry.strip())
        if val != -999.0:
            total_fuel += val
    return total_fuel`,
        whyItWorks: '.strip() removes whitespace, float() converts to real numbers, and the guard filters corrupt flags.',
        transferChallenge: {
          prompt: 'Handle corrupt text strings safely using try/except ValueError.',
          expectedBehavior: 'Wrap float() in try/except.'
        }
      }
    }
  }
];
