/**
 * Cloudflare Pages Function - Proxy para Firebase Auth Handler
 *
 * Firebase necesita que el dominio authDomain sirva la ruta /__/auth/ para
 * gestionar el flujo OAuth (signInWithRedirect). Como el sitio esta en
 * Cloudflare Pages (no en Firebase Hosting), esta funcion proxea todas las
 * peticiones /__/auth/* hacia el handler de Firebase en
 * kitedutools.firebaseapp.com, manteniendo todo en el mismo origen y evitando
 * los bloqueos de almacenamiento cross-origin de los navegadores modernos.
 */
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    const firebaseTarget = new URL(
        url.pathname + url.search,
        'https://kitedutools.firebaseapp.com'
    );

    const proxyRequest = new Request(firebaseTarget.toString(), {
        method: request.method,
        headers: (() => {
            const h = new Headers(request.headers);
            h.set('x-forwarded-host', url.host);
            return h;
        })(),
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual',
    });

    const firebaseResponse = await fetch(proxyRequest);

    if ([301, 302, 303, 307, 308].includes(firebaseResponse.status)) {
        return new Response(null, {
            status: firebaseResponse.status,
            headers: firebaseResponse.headers,
        });
    }

    const responseHeaders = new Headers(firebaseResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', url.origin);
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    return new Response(firebaseResponse.body, {
        status: firebaseResponse.status,
        statusText: firebaseResponse.statusText,
        headers: responseHeaders,
    });
}