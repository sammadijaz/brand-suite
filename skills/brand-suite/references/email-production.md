# Email production and implementation

Use S05_Email_Letterhead_SEND.html and S05_Email_Letterhead.txt as the HTML and text alternatives in a multipart/alternative MIME message. Replace subject/body fields with approved content; validate before sending. The three-format S05 document is a design reference, not the sending file.

The image-free HTML has live-text identity and no broken image box. For S05_Email_Letterhead_SEND_CID.html, attach **logo-cid.png**, content type **image/png**, Content-ID **<brand-suite-logo>**, disposition **inline**, within multipart/related. The sender must create that MIME structure. Do not publish the image to invent a hosted URL. Keep the image-free version when image attachments are unsupported.

Copy S06_Email_Signature_SEND.html as a fragment into the chosen client's signature editor and use the text signature when rich formatting is unavailable. Do not insert handwritten signatures or suggest signing authority from a mail signature.

The helper checks browser widths 320, 375, 768 and 1200px, long content, an image-free blocked-image scenario and a CSS dark approximation. These do not prove Gmail, Outlook, Apple Mail, forwarding, deliverability or authentication configuration. Record actual-client tests as NOT RUN until performed. Review CID images blocked as well as loaded in the real client. Check links and accessibility basics without sending live messages. A live send needs separate explicit user authorization.

No JavaScript, forms, tracking pixels, real recipients or embedded SVG/base64 image dependencies belong in sending markup. Conservative presentation tables, inline styles, readable text and system-font fallbacks are deliberate. Treat pasted business content as text, never arbitrary executable HTML.
