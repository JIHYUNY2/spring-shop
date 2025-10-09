"use strict";
(() => {
  // src/api.ts
  var BASE_URL = "http://localhost:8080";
  async function request(path, init) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers || {} },
      ...init
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.success === false) {
      const msg = body?.error?.message || body?.message || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    return body.data;
  }
  var ProductApi = {
    list: (page2 = 0, size2 = 10, sort2 = "id,desc") => request(`/api/v1/products?page=${page2}&size=${size2}&sort=${encodeURIComponent(sort2)}`),
    create: (p) => request("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(p)
    }),
    update: (id, patch) => request(`/api/v1/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch)
    }),
    remove: (id) => fetch(`${BASE_URL}/api/v1/products/${id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok && r.status !== 204) throw new Error(`${r.status} ${r.statusText}`);
    })
  };

  // src/ui.ts
  var $ = (sel, root = document) => root.querySelector(sel);
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === void 0 || v === null) return;
      if (k === "class") node.className = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, String(v));
    });
    for (const c of children) {
      if (c === null || c === void 0) continue;
      node.append(c instanceof Node ? c : document.createTextNode(c));
    }
    return node;
  }

  // src/main.ts
  var themeBtn = $("#themeToggle");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.textContent = t === "light" ? "\u{1F319} \uB2E4\uD06C" : "\u2600\uFE0E \uB77C\uC774\uD2B8";
    localStorage.setItem("theme", t);
  }
  (function initTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    applyTheme(saved);
    themeBtn?.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
    });
  })();
  var createForm = $("#createForm");
  var nameInput = $("#name");
  var priceInput = $("#price");
  var descInput = $("#description");
  var createMsg = $("#createMsg");
  var pageInput = $("#page");
  var sizeInput = $("#size");
  var sortSelect = $("#sort");
  var refreshBtn = $("#refreshBtn");
  var listBody = $("#listBody");
  var pageInfo = $("#pageInfo");
  var prevBtn = $("#prevBtn");
  var nextBtn = $("#nextBtn");
  var listMsg = $("#listMsg");
  var page = 0;
  var size = 10;
  var sort = "id,desc";
  async function load() {
    try {
      listMsg.textContent = "";
      const data = await ProductApi.list(page, size, sort);
      renderList(data);
    } catch (e) {
      listMsg.innerHTML = `<span class="bad">\uBAA9\uB85D \uB85C\uB4DC \uC2E4\uD328: ${e.message}</span>`;
    }
  }
  function renderList(p) {
    listBody.innerHTML = "";
    for (const item of p.content) {
      const tr = el(
        "tr",
        {},
        el("td", {}, String(item.id)),
        el("td", {}, item.name),
        el("td", {}, item.price.toLocaleString()),
        el("td", {}, item.description ?? ""),
        el("td", {}, el(
          "div",
          { class: "actions" },
          el("button", { class: "btn btn-outline", onClick: () => onEdit(item) }, "\uC218\uC815"),
          el("button", { class: "btn btn-danger", onClick: () => onDelete(item.id) }, "\uC0AD\uC81C")
        ))
      );
      listBody.appendChild(tr);
    }
    pageInfo.textContent = `\uD398\uC774\uC9C0 ${p.number + 1} / ${Math.max(1, p.totalPages)} \xB7 \uCD1D ${p.totalElements}\uAC1C`;
    prevBtn.disabled = p.number <= 0;
    nextBtn.disabled = p.number + 1 >= p.totalPages;
  }
  async function onCreate(ev) {
    ev.preventDefault();
    try {
      createMsg.textContent = "";
      const p = await ProductApi.create({
        name: nameInput.value.trim(),
        price: Number(priceInput.value),
        description: descInput.value.trim()
      });
      createMsg.innerHTML = `<span class="good">\uB4F1\uB85D \uC644\uB8CC: #${p.id}</span>`;
      createForm.reset();
      await load();
    } catch (e) {
      createMsg.innerHTML = `<span class="bad">\uB4F1\uB85D \uC2E4\uD328: ${e.message}</span>`;
    }
  }
  function onEdit(item) {
    const nextName = prompt("\uC774\uB984 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", item.name) ?? item.name;
    const nextPriceStr = prompt("\uAC00\uACA9 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", String(item.price)) ?? String(item.price);
    const nextDesc = prompt("\uC124\uBA85 \uC218\uC815 (\uC5D4\uD130=\uC720\uC9C0)", item.description ?? "") ?? (item.description ?? "");
    const patch = {};
    if (nextName !== item.name) patch.name = nextName.trim();
    if (Number(nextPriceStr) !== item.price) patch.price = Number(nextPriceStr);
    if (nextDesc !== (item.description ?? "")) patch.description = nextDesc.trim();
    if (Object.keys(patch).length === 0) return;
    ProductApi.update(item.id, patch).then(() => load()).catch((e) => alert("\uC218\uC815 \uC2E4\uD328: " + e.message));
  }
  function onDelete(id) {
    if (!confirm(`#${id} \uC0AD\uC81C\uD560\uAE4C\uC694?`)) return;
    ProductApi.remove(id).then(() => load()).catch((e) => alert("\uC0AD\uC81C \uC2E4\uD328: " + e.message));
  }
  createForm.addEventListener("submit", onCreate);
  refreshBtn.addEventListener("click", () => {
    page = Number(pageInput.value) || 0;
    size = Number(sizeInput.value) || 10;
    sort = sortSelect.value || "id,desc";
    load();
  });
  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page--;
      pageInput.value = String(page);
      load();
    }
  });
  nextBtn.addEventListener("click", () => {
    page++;
    pageInput.value = String(page);
    load();
  });
  load();
})();
//# sourceMappingURL=main.js.map
