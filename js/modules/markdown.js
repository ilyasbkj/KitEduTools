export const MarkdownEditor = {
    init() {
        const textarea = document.getElementById('markdown-textarea');
        const preview = document.getElementById('markdown-preview');
        
        if (!textarea || !preview) return;

        const updatePreview = () => {
            const content = textarea.value;
            if (window.marked) {
                preview.innerHTML = window.marked.parse(content);
            } else {
                preview.innerHTML = '<p class="text-red-500">Librería marked.js no cargada.</p>';
            }
        };

        textarea.addEventListener('input', updatePreview);
        
        document.getElementById('markdown-copy').onclick = () => {
            navigator.clipboard.writeText(preview.innerText || preview.textContent).then(() => {
                if (window.app && window.app.toast) {
                    window.app.toast('¡Texto copiado al portapapeles!');
                }
            }).catch(err => {
                console.error('Error copying text: ', err);
            });
        };

        document.getElementById('markdown-download').onclick = () => {
            const blob = new Blob([textarea.value], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documento.md';
            a.click();
            URL.revokeObjectURL(url);
        };

        // Render inicial
        setTimeout(updatePreview, 100);
    }
};
