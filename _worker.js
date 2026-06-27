export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle WWW to Apex Redirect
    if (url.hostname === 'www.iambruce.net') {
      url.hostname = 'iambruce.net';
      return Response.redirect(url.toString(), 301);
    }

    // 2. Fetch the actual asset
    const response = await env.ASSETS.fetch(request);

    // 3. Clone and Inject Headers
    const newHeaders = new Headers(response.headers);
    
    // Hardened Security Headers
    newHeaders.set("X-Frame-Options", "DENY");
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self';");

    // 4. Force Currency (Cache Control)
    // We tell the browser: "Always re-validate this page"
    if (response.headers.get("Content-Type")?.includes("text/html")) {
        newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
        // For images and other assets, 1 hour is fine
        newHeaders.set("Cache-Control", "public, max-age=3600");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
