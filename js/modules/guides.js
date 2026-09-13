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
`,
        study: "\n# 🎓 Metodologías de Estudio Activo y Preparación de Exámenes\n\nEl aprendizaje eficiente no depende de la cantidad de horas frente a los libros, sino de la calidad cognitiva del procesamiento mental. Esta guía compila las estrategias con mayor respaldo empírico en neurociencia y psicología educativa moderna.\n\n---\n\n## 1. El Mito de la Lectura Pasiva vs. Active Recall (Recuperación Activa)\n\nEl error más común al estudiar es releer textos o subrayar párrafos con colores llamativos. La neurociencia demuestra que estas técnicas generan una **ilusión de competencia**: el cerebro reconoce el texto y confunde la familiaridad con el dominio real del concepto.\n\n### ¿Por qué funciona la Recuperación Activa?\nEl esfuerzo consciente por extraer información de la memoria a largo plazo fortalece las conexiones sinápticas (un proceso conocido en psicología cognitiva como el *Testing Effect*).\n- **Cómo aplicarlo:** Cierra los apuntes tras leer una sección e intenta explicar los conceptos centrales en voz alta o redactar un resumen en una hoja en blanco sin consultar el material.\n- **Formulación de preguntas:** Convierte los títulos de los temas en preguntas reflexivas antes de estudiar. Al terminar, comprueba si puedes responderlas sin titubear.\n\n---\n\n## 2. Repetición Espaciada (Spaced Repetition System - SRS)\n\nBasada en los descubrimientos del psicólogo Hermann Ebbinghaus sobre la **Curva del Olvido**, la repetición espaciada combate la degradación natural de la memoria mediante repasos programados justo en el momento en que el recuerdo empieza a desvanecerse.\n\n### Intervalos recomendados para repaso:\n1. **Primer repaso:** A las 24 horas de la primera sesión de estudio.\n2. **Segundo repaso:** A los 3 días del primer repaso.\n3. **Tercer repaso:** A los 7 días.\n4. **Cuarto repaso:** A las 2 semanas.\n5. **Quinto repaso de consolidación:** A los 30 días.\n\nUtilizar la herramienta de **Flashcards** de KitEduTools permite clasificar tarjetas entre conceptos dominados y conceptos dudosos, optimizando el tiempo invertido en cada intervalo.\n\n---\n\n## 3. La Técnica Feynman: El Filtro de la Simplicidad\n\nEl físico y premio Nobel Richard Feynman proponía un método infalible para diagnosticar lagunas de comprensión:\n\n1. **Elige el concepto:** Escribe el nombre del tema en la parte superior de una página.\n2. **Explícaselo a un niño de 10 años:** Usa un lenguaje llano, directo y sin tecnicismos innecesarios. Si recurres a jerga compleja, probablemente estés enmascarando una falta de comprensión profunda.\n3. **Identifica las lagunas:** Cuando te bloquees o no encuentres una metáfora clara, regresa a la fuente bibliográfica y repasa únicamente ese eslabón débil.\n4. **Simplifica y crea analogías:** Conecta el concepto con situaciones cotidianas. Si puedes crear una analogía intuitiva, el conocimiento está verdaderamente integrado.\n\n---\n\n## 4. Práctica Intercalada (*Interleaving*)\n\nA diferencia de la práctica en bloques masivos (estudiar únicamente un tipo de ejercicio matemático durante horas), la práctica intercalada consiste en alternar diferentes asignaturas o categorías de problemas en una misma jornada.\n\n- **Beneficio cognitivo:** Obliga al cerebro a discernir qué método o fórmula es aplicable a cada situación, en lugar de aplicar automáticamente la misma regla una y otra vez.\n- **Implementación:** Si estás estudiando ciencias, alterna ejercicios de cálculo, álgebra y física en bloques de 40 minutos en lugar de dedicar un día completo a una sola materia.\n\n---\n\n## 5. Gestión del Entorno y Fricción Cognitiva\n\nEl contexto físico y digital condiciona directamente la capacidad de atención sostenida:\n- **Reducción de micro-distracciones:** Cada notificación telefónica interrumpe el estado de flujo mental; recuperar la concentración profunda requiere un promedio de 15 a 20 minutos según estudios de la Universidad de California.\n- **Monotarea estricta:** Trabaja con una sola pestaña activa de tu navegador o herramienta de estudio. KitEduTools integra herramientas focalizadas (Pomodoro, Calculadora, Notas) diseñadas para evitar la dispersión.\n- **Fisiología del aprendizaje:** La memoria declarativa se consolida durante las fases de sueño profundo (ondas lentas) y fase REM. Reducir horas de sueño antes de un examen disminuye drásticamente el rendimiento de la memoria de trabajo.\n",
        algorithms: "\n# 🧠 Pensamiento Computacional y Lógica con Python\n\nEl pensamiento computacional es un marco mental para abordar problemas complejos, descomponerlos en partes manejables y diseñar soluciones algorítmicas transferibles a cualquier lenguaje informático.\n\n---\n\n## 1. Los Cuatro Pilares del Pensamiento Computacional\n\n1. **Descomposición:** Fragmentar un problema grande en subproblemas independientes y más sencillos.\n2. **Reconocimiento de Patrones:** Identificar regularidades, tendencias y similitudes con problemas resueltos anteriormente.\n3. **Abstracción:** Filtrar detalles innecesarios para centrarse únicamente en la información esencial y las reglas clave.\n4. **Diseño Algorítmico:** Establecer una secuencia lógica ordenada, finita y unívoca de pasos para resolver el problema general.\n\n---\n\n## 2. Complejidad Algorítmica (Notación Big O)\n\nLa eficiencia de un algoritmo se mide en función de cómo escala su tiempo de ejecución o consumo de memoria conforme crece el tamaño de la entrada ($n$):\n\n- **$O(1)$ - Tiempo Constante:** El tiempo es independiente de $n$. Ejemplo: Acceder a un elemento de un diccionario en Python por su clave (`mi_dict['clave']`).\n- **$O(\\log n)$ - Tiempo Logarítmico:** En cada paso se reduce a la mitad el conjunto de datos. Ejemplo: Búsqueda binaria en una lista ordenada.\n- **$O(n)$ - Tiempo Lineal:** El tiempo crece proporcionalmente a $n$. Ejemplo: Recorrer una lista con un bucle simple (`for x in lista:`).\n- **$O(n^2)$ - Tiempo Cuadrático:** Común en bucles anidados. Debe evitarse para conjuntos masivos de datos. Ejemplo: Algoritmo de ordenamiento burbuja (*Bubble Sort*).\n\n---\n\n## 3. Algoritmos Fundamentales: Búsqueda Lineal vs. Búsqueda Binaria\n\n### Búsqueda Lineal ($O(n)$)\nExamina elemento por elemento de izquierda a derecha. Funciona en listas no ordenadas:\n\n```python\ndef busqueda_lineal(lista, objetivo):\n    for i, valor in enumerate(lista):\n        if valor == objetivo:\n            return i # Índice encontrado\n    return -1 # No encontrado\n```\n\n### Búsqueda Binaria ($O(\\log n)$)\nRequiere que los datos estén previamente ordenados. Descarta la mitad de la lista en cada iteración:\n\n```python\ndef busqueda_binaria(lista_ordenada, objetivo):\n    inicio = 0\n    fin = len(lista_ordenada) - 1\n    \n    while inicio <= fin:\n        medio = (inicio + fin) // 2\n        if lista_ordenada[medio] == objetivo:\n            return medio\n        elif lista_ordenada[medio] < objetivo:\n            inicio = medio + 1\n        else:\n            fin = medio - 1\n            \n    return -1\n```\n\n---\n\n## 4. Estructuras de Datos Nativas de Python y Cuándo Usarlas\n\n- **Listas (`[]`):** Secuencias mutables y ordenadas. Ideales cuando el orden de inserción importa y se necesita iterar secuencialmente.\n- **Tuplas (`()`):** Secuencias inmutables. Consumen menos memoria y garantizan que los datos no sean modificados accidentalmente.\n- **Conjuntos (`set()`):** Colecciones desordenadas de elementos únicos con comprobación de pertenencia en tiempo $O(1)$.\n- **Diccionarios (`{}`):** Mapeos clave-valor optimizados mediante tablas hash. Esenciales para búsquedas ultrarrápidas y modelado de entidades.\n\n---\n\n## 5. Metodología de Resolución de Problemas y Depuración (Debugging)\n\n1. **Entender el problema:** Redacta entradas de ejemplo y la salida esperada a mano antes de escribir código.\n2. **Diseñar el pseudocódigo:** Escribe en lenguaje humano los pasos lógicos.\n3. **Casos Límite (*Edge Cases*):** Pon a prueba qué ocurre con listas vacías (`[]`), números negativos, valores repetidos o cadenas vacías.\n4. **Depuración sistemática:** Utiliza salidas de control (`print()`) o el depurador integrado en el IDE de Python de KitEduTools para inspeccionar el estado de las variables paso a paso.\n",
        web: "\n# 🌐 Arquitectura Web Moderna: HTML5 Semántico y Accesibilidad\n\nEl ecosistema web contemporáneo se fundamenta en estándares internacionales (W3C / WHATWG) orientados a construir aplicaciones interoperables, accesibles para cualquier ser humano y optimizadas para motores de búsqueda e indexadores automáticos.\n\n---\n\n## 1. La Filosofía del HTML5 Semántico\n\nEl HTML semántico consiste en utilizar etiquetas que describen el significado intrínseco del contenido tanto para el navegador como para los desarrolladores y rastreadores de motores de búsqueda, superando el abuso histórico del contenedor genérico `<div>`.\n\n### Principales etiquetas semánticas de estructura:\n- `<header>`: Contiene elementos introductorios, títulos de página y barras de navegación principales.\n- `<nav>`: Reservado específicamente para bloques con enlaces primarios de navegación.\n- `<main>`: Contenedor del contenido nuclear y singular del documento (debe ser único por vista).\n- `<article>`: Contenido autocontenido e independiente (entradas de blog, guías, fichas de producto).\n- `<section>`: Agrupación temática de contenido con encabezado propio.\n- `<aside>`: Información complementaria o lateral (barras auxiliares, notas al pie, enlaces relacionados).\n- `<footer>`: Pie de página con créditos, enlaces legales, política de privacidad y copyright.\n\n---\n\n## 2. Accesibilidad Web (a11y) y Principios WCAG\n\nLa accesibilidad garantiza que personas con discapacidades visuales, auditivas, motoras o cognitivas puedan interactuar plenamente con la web:\n\n1. **Textos alternativos (`alt`):** Toda imagen no puramente decorativa debe poseer una descripción concisa en su atributo `alt`.\n2. **Navegación por teclado:** Todo elemento interactivo (`<button>`, `<a>`, `<input>`) debe recibir foco mediante la tecla Tab y activarse con Enter o Espacio.\n3. **Contraste de color:** Cumplir el ratio mínimo de 4.5:1 exigido por WCAG AA para textos estándar frente a su fondo.\n4. **Atributos ARIA (Accessible Rich Internet Applications):** Complementan el HTML cuando se construyen widgets interactivos complejos (ej: `aria-expanded`, `aria-hidden`, `role=\"dialog\"`).\n\n---\n\n## 3. Modelo de Caja (Box Model) y Distribución Moderna\n\nEl CSS moderno ha transformado radicalmente la maquetación de interfaces:\n\n### Componentes del Box Model:\n- **Content:** El área de texto, imágenes o medios.\n- **Padding:** Espacio interno entre el contenido y el borde.\n- **Border:** Línea divisoria exterior del padding.\n- **Margin:** Separación externa entre el elemento y sus vecinos.\n- **Recomendación estándar:** Usar siempre `box-sizing: border-box;` para que el ancho total incluya el padding y el borde, evitando desbordamientos inesperados.\n\n### Flexbox vs. CSS Grid:\n- **Flexbox (1D):** Perfecto para alinear elementos en una sola dirección (fila o columna). Ideal para barras de navegación, botones y listas horizontales.\n- **CSS Grid (2D):** Diseñado para maquetaciones bidimensionales complejas de filas y columnas simultáneas (galerías de productos, paneles tipo dashboard).\n\n---\n\n## 4. Rendimiento Web y Core Web Vitals\n\nLos buscadores como Google priorizan sitios con alta velocidad y estabilidad visual:\n- **LCP (Largest Contentful Paint):** Tiempo necesario para renderizar el elemento visual principal de la pantalla (objetivo: inferior a 2.5s).\n- **CLS (Cumulative Layout Shift):** Mide la estabilidad visual evitando que los elementos salten de posición mientras la página carga (objetivo: inferior a 0.1).\n- **Estrategias clave:** Servir imágenes en formatos modernos (WebP, AVIF), diferir scripts no críticos mediante `defer` o `async`, y utilizar arquitecturas SPA ligeras como la de KitEduTools para transiciones instantáneas sin recarga completa.\n"
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
