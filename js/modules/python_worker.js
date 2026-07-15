importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide;
let sharedBuffer;
let int32Array;
let uint8Array;

async function initPyodide(sab) {
    sharedBuffer = sab;
    int32Array = new Int32Array(sharedBuffer);
    uint8Array = new Uint8Array(sharedBuffer);

    try {
        pyodide = await loadPyodide({
            stdout: (text) => postMessage({ type: 'stdout', text }),
            stderr: (text) => postMessage({ type: 'stderr', text }),
            stdin: () => {
                // Request input from main thread
                postMessage({ type: 'request_input' });
                
                // Block until main thread sets int32Array[0] to 1
                Atomics.wait(int32Array, 0, 0);
                
                // Read length
                const length = int32Array[1];
                const bytes = new Uint8Array(sharedBuffer, 8, length);
                const decoder = new TextDecoder();
                const str = decoder.decode(bytes);
                
                // Reset flag
                int32Array[0] = 0;
                return str;
            }
        });
        
        postMessage({ type: 'ready', version: pyodide.version });
    } catch (err) {
        postMessage({ type: 'error', error: err.message || String(err) });
    }
}

self.onmessage = async (e) => {
    const msg = e.data;
    if (msg.type === 'init') {
        initPyodide(msg.sharedBuffer);
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
