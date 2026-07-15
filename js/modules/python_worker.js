importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide;
let sharedBuffer;
let int32Array;
let uint8Array;
let interruptBuffer;

self.worker_stdout = (text) => postMessage({ type: 'stdout', text });
self.worker_stderr = (text) => postMessage({ type: 'stderr', text });
self.worker_stdin = () => {
    try {
        postMessage({ type: 'request_input' });
        Atomics.wait(int32Array, 0, 0);
        
        const length = int32Array[1];
        if (length === 0) return "\n"; // If interrupted, return newline
        
        const bytes = new Uint8Array(sharedBuffer, 8, length);
        const str = new TextDecoder().decode(bytes);
        
        int32Array[0] = 0;
        return str;
    } catch (err) {
        postMessage({ type: 'stderr', text: '\n\x1b[31m[Worker] Error JS en stdin: ' + err.message + '\x1b[0m\n' });
        return "\n";
    }
};

async function initPyodide(sab, intBuf) {
    sharedBuffer = sab;
    interruptBuffer = new Int32Array(intBuf);
    
    if (!(sharedBuffer instanceof SharedArrayBuffer)) {
        postMessage({ type: 'stderr', text: '\n\x1b[31m[Worker] Advertencia: Tu navegador bloqueó la memoria compartida (SharedArrayBuffer). Esto suele pasar en Safari o servidores sin cabeceras COOP/COEP correctas. La función input() no funcionará.\x1b[0m\n' });
    }
    
    int32Array = new Int32Array(sharedBuffer);
    uint8Array = new Uint8Array(sharedBuffer);

    try {
        pyodide = await loadPyodide({
            // Dummy stdout/stderr just in case Pyodide C++ prints something internally
            stdout: (text) => postMessage({ type: 'stdout', text: text + '\n' }),
            stderr: (text) => postMessage({ type: 'stderr', text: text + '\n' })
        });
        
        pyodide.setInterruptBuffer(interruptBuffer);
        
        // Inject Python IO override for perfect PTY behaviour
        pyodide.runPython(`
import sys
import js

class CustomIO:
    def __init__(self, is_error=False, is_in=False):
        self.is_error = is_error
        self.is_in = is_in
    def write(self, text):
        if self.is_error:
            js.worker_stderr(text)
        else:
            js.worker_stdout(text)
    def readline(self, size=-1):
        return js.worker_stdin()
    def read(self, size=-1):
        return js.worker_stdin()
    def flush(self):
        pass
    def isatty(self):
        return True

sys.stdout = CustomIO()
sys.stderr = CustomIO(is_error=True)
sys.stdin = CustomIO(is_in=True)
`);
        
        postMessage({ type: 'ready', version: pyodide.version });
    } catch (err) {
        postMessage({ type: 'error', error: err.message || String(err) });
    }
}

self.onmessage = async (e) => {
    const msg = e.data;
    if (msg.type === 'init') {
        initPyodide(msg.sharedBuffer, msg.interruptBuffer);
    } else if (msg.type === 'run') {
        try {
            await pyodide.loadPackagesFromImports(msg.code);
            await pyodide.runPythonAsync(msg.code);
            postMessage({ type: 'run_finished' });
        } catch (err) {
            postMessage({ type: 'run_error', error: err.message || String(err) });
        }
    } else if (msg.type === 'install') {
        try {
            await pyodide.loadPackage("micropip");
            const micropip = pyodide.pyimport("micropip");
            await micropip.install(msg.pkg);
            postMessage({ type: 'install_finished', pkg: msg.pkg });
        } catch (err) {
            postMessage({ type: 'install_error', pkg: msg.pkg, error: err.message || String(err) });
        }
    }
};
