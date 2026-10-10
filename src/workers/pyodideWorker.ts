// Pyodide Dedicated Web Worker

let pyodide: any = null;
let isInitializing = false;

async function getPyodideInstance() {
  if (pyodide) return pyodide;
  if (isInitializing) {
    while (isInitializing && !pyodide) {
      await new Promise(r => setTimeout(r, 100));
    }
    return pyodide;
  }

  isInitializing = true;
  try {
    // Dynamic import of Pyodide ESM in Web Worker
    // @ts-ignore
    const pyodideModule: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs');
    pyodide = await pyodideModule.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });

    // Bootstrap Python trace recorder and test harness scripts
    await pyodide.runPythonAsync(`
import sys
import io
import ast
import traceback
import json

def safe_serialize_val(val, max_len=80):
    try:
        t_name = type(val).__name__
        if isinstance(val, (int, float, bool, type(None))):
            return repr(val), t_name
        elif isinstance(val, str):
            s = repr(val)
            if len(s) > max_len:
                s = s[:max_len-3] + "...'"
            return s, "str"
        elif isinstance(val, (list, tuple, set)):
            s = repr(val)
            if len(s) > max_len:
                s = s[:max_len-3] + "...]"
            return s, t_name
        elif isinstance(val, dict):
            s = repr(val)
            if len(s) > max_len:
                s = s[:max_len-3] + "...}"
            return s, "dict"
        else:
            s = str(val)
            if len(s) > max_len:
                s = s[:max_len-3] + "..."
            return s, t_name
    except Exception:
        return "<unserializable>", "unknown"

def record_execution_trace(code_str, max_events=300):
    steps = []
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = stdout_buf
    sys.stderr = stderr_buf

    loop_counters = {}
    prev_vars = {}

    def trace_func(frame, event, arg):
        if len(steps) >= max_events:
            return None
        # Only trace code in our user buffer filename
        if frame.f_code.co_filename != "<user_workspace>":
            return trace_func

        line_no = frame.f_lineno
        func_name = frame.f_code.co_name

        # Extract local variables
        raw_locals = frame.f_locals
        current_vars = {}
        loop_info = None

        for k, v in raw_locals.items():
            if k.startswith("__"):
                continue
            val_str, t_name = safe_serialize_val(v)
            was_changed = False
            if k not in prev_vars or prev_vars[k]["value"] != val_str:
                was_changed = True

            current_vars[k] = {
                "type": t_name,
                "value": val_str,
                "changed": was_changed
            }

            # Check if this might be a loop variable
            if event == "line" and was_changed:
                if k not in loop_counters:
                    loop_counters[k] = 1
                else:
                    loop_counters[k] += 1
                loop_info = {
                    "variableName": k,
                    "currentValue": val_str,
                    "iteration": loop_counters[k]
                }

        prev_vars.clear()
        for k, v in current_vars.items():
            prev_vars[k] = v

        steps.append({
            "stepNumber": len(steps) + 1,
            "line": line_no,
            "event": event,
            "funcName": func_name,
            "variables": current_vars,
            "stdout": stdout_buf.getvalue(),
            "loopInfo": loop_info
        })
        return trace_func

    user_scope = {}
    capped = False
    err_msg = None

    try:
        compiled = compile(code_str, filename="<user_workspace>", mode="exec")
        sys.settrace(trace_func)
        try:
            exec(compiled, user_scope)
        finally:
            sys.settrace(None)
    except Exception as exc:
        err_msg = traceback.format_exc()
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    capped = len(steps) >= max_events

    return json.dumps({
        "success": err_msg is None,
        "steps": steps,
        "totalSteps": len(steps),
        "capped": capped,
        "stdout": stdout_buf.getvalue(),
        "stderr": err_msg
    })
`);
    isInitializing = false;
    return pyodide;
  } catch (err: any) {
    isInitializing = false;
    throw err;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  try {
    const py = await getPyodideInstance();

    if (type === 'PING') {
      self.postMessage({ id, success: true, payload: 'PONG' });
      return;
    }

    if (type === 'STEP_TRACE') {
      const { code } = payload;
      py.globals.set('__trace_code', code);
      const traceResultJson = await py.runPythonAsync(`
record_execution_trace(__trace_code)
`);
      const traceResult = JSON.parse(traceResultJson);
      self.postMessage({ id, success: true, payload: traceResult });
      return;
    }

    if (type === 'RUN_FREEFORM') {
      const { code } = payload;
      py.globals.set('__freeform_code', code);
      const freeformResultJson = await py.runPythonAsync(`
import sys, io, traceback, json

buf_out = io.StringIO()
old_out = sys.stdout
sys.stdout = buf_out

scope = {}
err = ""
try:
    exec(__freeform_code, scope)
except Exception as e:
    err = traceback.format_exc()
finally:
    sys.stdout = old_out

vars_list = []
for k, v in scope.items():
    if k.startswith("__"): continue
    v_str, t_name = safe_serialize_val(v)
    vars_list.append({
        "name": k,
        "type": t_name,
        "value": v_str,
        "mutable": t_name in ("list", "dict", "set")
    })

json.dumps({
    "stdout": buf_out.getvalue(),
    "stderr": err,
    "variables": vars_list
})
`);
      const res = JSON.parse(freeformResultJson);
      self.postMessage({ id, success: true, payload: res });
      return;
    }

    if (type === 'EVALUATE_MISSION') {
      const { mission, userCode } = payload;
      py.globals.set('__mission_json', JSON.stringify(mission));
      py.globals.set('__user_code', userCode);

      const evalScript = `
import sys, io, ast, traceback, json

mission = json.loads(__mission_json)
code = __user_code
v_mode = mission.get("verificationMode", "function")
func_name = mission.get("functionName")
test_cases = mission.get("testCases", [])

# 1. Parse AST
ast_info = {
    "syntaxValid": False,
    "detectedFunctions": [],
    "detectedLoops": [],
    "detectedTypeCasts": [],
    "detectedComparisons": [],
    "detectedImports": [],
    "astSummary": ""
}

try:
    parsed_ast = ast.parse(code)
    ast_info["syntaxValid"] = True
    for node in ast.walk(parsed_ast):
        if isinstance(node, ast.FunctionDef):
            ast_info["detectedFunctions"].append(node.name)
        elif isinstance(node, (ast.For, ast.While)):
            ast_info["detectedLoops"].append(type(node).__name__.lower())
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in ("int", "float", "str", "bool", "len", "sum", "range", "print"):
                ast_info["detectedTypeCasts"].append(node.func.id)
    ast_info["astSummary"] = f"Parsed {len(parsed_ast.body)} top-level statements."
except SyntaxError as syn:
    report = {
        "passed": False,
        "stageReached": 3,
        "category": "SYNTAX_ERROR",
        "title": "Syntax Error Detected",
        "message": f"Line {syn.lineno}: {syn.msg}",
        "errorLine": syn.lineno,
        "stdout": "",
        "stderr": f"SyntaxError: {syn.msg} (line {syn.lineno})",
        "testResults": [],
        "variables": [],
        "callFrames": [],
        "astInfo": ast_info
    }
    __result__ = json.dumps(report)
else:
    # 2. Execute code in fresh scope
    stdout_buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buf

    user_scope = {}
    runtime_err = None
    try:
        compiled = compile(parsed_ast, filename="<user_workspace>", mode="exec")
        exec(compiled, user_scope)
    except Exception as exc:
        runtime_err = traceback.format_exc()
        tb = traceback.extract_tb(sys.exc_info()[2])
        last_line = tb[-1].lineno if tb else 1
        exc_type = type(exc).__name__
    finally:
        sys.stdout = old_stdout

    stdout_val = stdout_buf.getvalue()

    # Variables extraction
    vars_extracted = []
    for k, v in user_scope.items():
        if k.startswith("__"): continue
        val_repr, t_name = safe_serialize_val(v)
        vars_extracted.append({
            "name": k,
            "type": t_name,
            "value": val_repr,
            "mutable": t_name in ("list", "dict", "set")
        })

    if runtime_err:
        report = {
            "passed": False,
            "stageReached": 3,
            "category": "RUNTIME_EXCEPTION",
            "title": f"Runtime Crash ({exc_type})",
            "message": f"{exc_type}: {str(exc)}",
            "errorLine": last_line,
            "stdout": stdout_val,
            "stderr": runtime_err,
            "testResults": [],
            "variables": vars_extracted,
            "callFrames": [],
            "astInfo": ast_info
        }
        __result__ = json.dumps(report)
    else:
        # 3. Behavioral Verification by Mode
        passed = False
        cat = "LOGIC_ERROR"
        title = "Diagnostic Discrepancy"
        msg = "Behavior did not satisfy mission objectives."
        test_results = []

        if v_mode == "stdout":
            expected_fragments = mission.get("expectedStdoutContains", [])
            all_found = True
            for frag in expected_fragments:
                found = frag in stdout_val
                test_results.append({
                    "name": f"Terminal prints '{frag}'",
                    "input": [],
                    "expectedOutput": frag,
                    "actualOutput": stdout_val.strip(),
                    "passed": found
                })
                if not found:
                    all_found = False

            if all_found and len(expected_fragments) > 0:
                passed = True
                cat = "SUCCESS"
                title = "MISSION ACCOMPLISHED"
                msg = "Terminal output matched required telemetry patterns."
            else:
                cat = "LOGIC_ERROR"
                title = "Missing Required Output"
                msg = f"Terminal output did not contain expected text. Got: '{stdout_val.strip()}'"

        elif v_mode == "variables":
            expected_vars = mission.get("expectedVariables", {})
            all_match = True
            for v_name, v_exp in expected_vars.items():
                actual_val = user_scope.get(v_name)
                match = (actual_val == v_exp)
                test_results.append({
                    "name": f"Variable '{v_name}' equals {repr(v_exp)}",
                    "input": [],
                    "expectedOutput": v_exp,
                    "actualOutput": actual_val,
                    "passed": match
                })
                if not match:
                    all_match = False

            if all_match and len(expected_vars) > 0:
                passed = True
                cat = "SUCCESS"
                title = "MISSION ACCOMPLISHED"
                msg = "Variables computed and stored correct telemetry states."
            else:
                cat = "LOGIC_ERROR"
                title = "Variable Calculation Discrepancy"
                msg = f"One or more variables did not have the expected final value."

        else: # "function" mode
            target_func = user_scope.get(func_name)
            if not target_func or not callable(target_func):
                for k, v in user_scope.items():
                    if callable(v) and not k.startswith("__"):
                        target_func = v
                        break

            if not target_func:
                report = {
                    "passed": False,
                    "stageReached": 2,
                    "category": "MISSING_FUNCTION",
                    "title": f"Function '{func_name}' Missing",
                    "message": f"Expected definition 'def {func_name}(...)' in script.",
                    "stdout": stdout_val,
                    "stderr": "",
                    "testResults": [],
                    "variables": vars_extracted,
                    "callFrames": [],
                    "astInfo": ast_info
                }
                __result__ = json.dumps(report)
            else:
                all_tests_passed = True
                first_failure = None

                for idx, tc in enumerate(test_cases):
                    args = tc.get("input", [])
                    if not isinstance(args, list):
                        args = [args]
                    expected = tc.get("expectedOutput")
                    tc_name = tc.get("name", f"Vector #{idx+1}")

                    try:
                        import copy
                        c_args = copy.deepcopy(args)
                        actual = target_func(*c_args)
                        
                        is_eq = False
                        if isinstance(expected, float) and isinstance(actual, (int, float)):
                            is_eq = abs(expected - actual) < 1e-4
                        else:
                            is_eq = (actual == expected)

                        test_results.append({
                            "name": tc_name,
                            "input": args,
                            "expectedOutput": expected,
                            "actualOutput": actual,
                            "passed": is_eq
                        })

                        if not is_eq:
                            all_tests_passed = False
                            if not first_failure:
                                first_failure = (
                                    "LOGIC_ERROR",
                                    f"Test Failed: {tc_name}",
                                    f"Expected: {repr(expected)}, got: {repr(actual)}"
                                )
                    except Exception as exc:
                        all_tests_passed = False
                        test_results.append({
                            "name": tc_name,
                            "input": args,
                            "expectedOutput": expected,
                            "error": f"{type(exc).__name__}: {str(exc)}",
                            "passed": False
                        })
                        if not first_failure:
                            first_failure = (
                                "RUNTIME_EXCEPTION",
                                f"Exception in {tc_name}",
                                f"{type(exc).__name__}: {str(exc)}"
                            )

                if all_tests_passed:
                    passed = True
                    cat = "SUCCESS"
                    title = "MISSION ACCOMPLISHED"
                    msg = "All behavioral test vectors passed nominal verification."
                else:
                    passed = False
                    cat = first_failure[0]
                    title = first_failure[1]
                    msg = first_failure[2]

        report = {
            "passed": passed,
            "stageReached": 5 if passed else 2,
            "category": cat,
            "title": title,
            "message": msg,
            "stdout": stdout_val,
            "stderr": "",
            "testResults": test_results,
            "variables": vars_extracted,
            "callFrames": [{
                "name": func_name or "main",
                "depth": 1,
                "line": 1,
                "arguments": {},
                "locals": {v["name"]: v["value"] for v in vars_extracted}
            }],
            "astInfo": ast_info
        }
        __result__ = json.dumps(report)

__result__
`;
      const evalResJson = await py.runPythonAsync(evalScript);
      const evalReport = JSON.parse(evalResJson);
      self.postMessage({ id, success: true, payload: evalReport });
    }
  } catch (err: any) {
    self.postMessage({
      id,
      success: false,
      error: String(err?.message || err)
    });
  }
};
