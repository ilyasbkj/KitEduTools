importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;
let inputBuffer = null;

self.onmessage = async (event) => {
    const { type, data } = event.data;

    if (type === 'init') {
        try {
            inputBuffer = data.inputBuffer; // Int32Array for SharedArrayBuffer
            
            pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                stdin: () => {
                    // Send message to main thread requesting input
                    self.postMessage({ type: 'input_request' });
                    
                    // Wait for main thread to signal that input is ready in buffer
                    Atomics.wait(inputBuffer, 0, 0); // Wait until index 0 becomes != 0
                    
                    // Read string from buffer
                    const length = inputBuffer[0];
                    let str = '';
                    for (let i = 0; i < length; i++) {
                        str += String.fromCharCode(inputBuffer[i + 1]);
                    }
                    
                    // Reset buffer flag
                    inputBuffer[0] = 0;
                    
                    self.postMessage({ type: 'stdout', text: str + '\n' }); // Echo input back to terminal
                    return str;
                },
                stdout: (text) => {
                    self.postMessage({ type: 'stdout', text });
                },
                stderr: (text) => {
                    self.postMessage({ type: 'stderr', text });
                }
            });

            await pyodide.loadPackage("micropip");
            self.postMessage({ type: 'init_complete' });
        } catch (e) {
            self.postMessage({ type: 'init_error', error: e.message });
        }
    } 
    else if (type === 'run') {
        try {
            await pyodide.loadPackagesFromImports(data.code);
            let result = await pyodide.runPythonAsync(data.code);
            if (result !== undefined) {
                self.postMessage({ type: 'stdout', text: String(result) });
            }
            self.postMessage({ type: 'run_complete' });
        } catch (e) {
            self.postMessage({ type: 'run_error', error: e.toString() });
        }
    }
    else if (type === 'install') {
        try {
            const micropip = pyodide.pyimport("micropip");
            await micropip.install(data.pkg);
            self.postMessage({ type: 'install_complete', pkg: data.pkg });
        } catch (e) {
            self.postMessage({ type: 'install_error', error: e.toString(), pkg: data.pkg });
        }
    }
};
