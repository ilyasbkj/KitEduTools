export const Guides = {
    content: {
        python: `
# 🐍 Guía Básica de Python

Python es un lenguaje de programación muy popular, conocido por su sintaxis clara y legible.

## 1. Variables y Tipos de Datos
En Python, no es necesario declarar el tipo de variable.
\`\`\`python
nombre = "KitEduTools" # Cadena de texto (string)
edad = 20              # Número entero (int)
altura = 1.75          # Número decimal (float)
es_estudiante = True   # Booleano (bool)
\`\`\`

## 2. Listas y Diccionarios
Las listas guardan múltiples valores ordenados. Los diccionarios guardan pares de clave y valor.
\`\`\`python
# Lista
frutas = ["manzana", "banana", "cereza"]
print(frutas[0]) # Imprime "manzana"

# Diccionario
alumno = {"nombre": "Juan", "nota": 9.5}
print(alumno["nota"]) # Imprime 9.5
\`\`\`

## 3. Condicionales
Usamos \`if\`, \`elif\` y \`else\` para tomar decisiones.
\`\`\`python
nota = 7
if nota >= 5:
    print("Aprobado")
else:
    print("Suspenso")
\`\`\`

## 4. Bucles
Para repetir código usamos \`for\` o \`while\`.
\`\`\`python
# Bucle For
for fruta in frutas:
    print(fruta)

# Bucle While
contador = 0
while contador < 3:
    print(contador)
    contador += 1
\`\`\`

## 5. Funciones
Puedes crear bloques de código reutilizables.
\`\`\`python
def saludar(nombre):
    return "Hola " + nombre

print(saludar("Mundo"))
\`\`\`
`,
        html: `
# 🌐 Guía Básica de HTML

HTML (*HyperText Markup Language*) es el bloque de construcción básico de la web. Define el significado y la estructura del contenido web.

## 1. Estructura Básica
Todo documento HTML5 comienza con \`<!DOCTYPE html>\` y tiene una etiqueta \`<html>\` que contiene \`<head>\` y \`<body>\`.
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Primera Web</title>
</head>
<body>
    <h1>¡Hola Mundo!</h1>
</body>
</html>
\`\`\`

## 2. Textos y Encabezados
Existen 6 niveles de encabezados (\`<h1>\` al \`<h6>\`) y etiquetas para párrafos (\`<p>\`).
\`\`\`html
<h1>Encabezado Principal</h1>
<h2>Subtítulo</h2>
<p>Esto es un párrafo de texto normal.</p>
\`\`\`

## 3. Enlaces e Imágenes
Las etiquetas \`<a>\` crean hipervínculos, y las \`<img>\` muestran imágenes.
\`\`\`html
<!-- Enlace a otra página -->
<a href="https://google.com">Ir a Google</a>

<!-- Mostrar una imagen -->
<img src="imagen.jpg" alt="Descripción de la imagen">
\`\`\`

## 4. Listas
Puedes crear listas ordenadas (\`<ol>\`) o desordenadas (\`<ul>\`).
\`\`\`html
<ul>
    <li>Elemento 1</li>
    <li>Elemento 2</li>
</ul>

<ol>
    <li>Primer paso</li>
    <li>Segundo paso</li>
</ol>
\`\`\`

## 5. Contenedores
Los contenedores agrupan elementos para aplicarles estilos o scripts.
\`\`\`html
<div style="background-color: lightgray;">
    <p>Este párrafo está dentro de una caja gris.</p>
</div>
<span>Texto en línea que se puede estilizar.</span>
\`\`\`
`
    },

    init() {
        const preview = document.getElementById('guide-preview');
        const listItems = document.querySelectorAll('.guide-item');
        
        if (!preview) return;

        const renderGuide = (topic) => {
            if (!this.content[topic]) return;
            if (window.marked) {
                preview.innerHTML = window.marked.parse(this.content[topic]);
            } else {
                preview.innerHTML = '<p class="text-red-500">Librería marked.js no cargada.</p>';
            }
        };

        listItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active classes
                listItems.forEach(el => {
                    el.classList.remove('bg-brand-50', 'dark:bg-brand-900/20', 'text-brand-600', 'dark:text-brand-400');
                    el.classList.add('text-slate-600', 'dark:text-slate-400');
                });
                
                // Add active classes to clicked item
                const target = e.currentTarget;
                target.classList.remove('text-slate-600', 'dark:text-slate-400');
                target.classList.add('bg-brand-50', 'dark:bg-brand-900/20', 'text-brand-600', 'dark:text-brand-400');
                
                // Render guide
                const topic = target.getAttribute('data-guide');
                renderGuide(topic);
            });
        });

        // Initial render
        renderGuide('python');
    }
};
