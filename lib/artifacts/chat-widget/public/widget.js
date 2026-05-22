(function () {
  if (window.MDGroupWidgetLoaded) return;
  window.MDGroupWidgetLoaded = true;

  var script = document.currentScript;
  var scriptSrc = script && script.src ? script.src : "";
  var baseUrl = scriptSrc
    ? new URL(".", scriptSrc).href.replace(/\/$/, "")
    : window.location.origin;
  var requestedPosition = (script && script.dataset.position) || "right";
  var position = requestedPosition === "left" ? "left" : "right";
  var accent = (script && script.dataset.accent) || "#1b2a41";
  var label = (script && script.dataset.label) || "Chat with Sarah";
  var title = (script && script.dataset.title) || "MD Law Group";
  var bottom = (script && script.dataset.bottom) || "24px";
  var side = (script && script.dataset.side) || "24px";

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/embed";
  iframe.title = title + " chat widget";
  iframe.allow = "microphone";
  iframe.style.position = "fixed";
  iframe.style.bottom = "88px";
  iframe.style[position] = side;
  iframe.style.width = "400px";
  iframe.style.height = "600px";
  iframe.style.maxWidth = "calc(100vw - 32px)";
  iframe.style.maxHeight = "calc(100vh - 112px)";
  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 20px 55px rgba(15, 23, 42, 0.28)";
  iframe.style.zIndex = "2147483646";
  iframe.style.display = "none";
  iframe.style.background = "#ffffff";

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "md-group-chat-widget");
  button.textContent = label;
  button.style.position = "fixed";
  button.style.bottom = bottom;
  button.style[position] = side;
  button.style.zIndex = "2147483647";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = accent;
  button.style.color = "#ffffff";
  button.style.font = "600 15px/1.2 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  button.style.padding = "14px 18px";
  button.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.24)";
  button.style.cursor = "pointer";

  iframe.id = "md-group-chat-widget";

  function setOpen(isOpen) {
    iframe.style.display = isOpen ? "block" : "none";
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "Close chat" : label;
  }

  button.addEventListener("click", function () {
    setOpen(iframe.style.display === "none");
  });

  function applyMobileLayout() {
    var isMobile = window.matchMedia("(max-width: 520px)").matches;
    if (isMobile) {
      iframe.style.left = "16px";
      iframe.style.right = "16px";
      iframe.style.bottom = "80px";
      iframe.style.width = "auto";
      iframe.style.height = "calc(100vh - 104px)";
    } else {
      iframe.style.left = "";
      iframe.style.right = "";
      iframe.style[position] = side;
      iframe.style.bottom = "88px";
      iframe.style.width = "400px";
      iframe.style.height = "600px";
    }
  }

  applyMobileLayout();
  window.addEventListener("resize", applyMobileLayout);
  document.body.appendChild(iframe);
  document.body.appendChild(button);
})();
