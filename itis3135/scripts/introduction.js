(() => {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function gatherLinks(form) {
    const links = [];
    for (let i = 1; i <= 5; i++) {
      const textEl = form.elements[`linkText${i}`];
      const urlEl = form.elements[`linkUrl${i}`];
      const text = textEl && textEl.value ? textEl.value.trim() : "";
      const url = urlEl && urlEl.value ? urlEl.value.trim() : "";
      if (text && url) links.push({ text, url });
    }
    return links;
  }

  function getImageSrc(form) {
    const fileInput = form.elements["picture"];
    const urlEl = form.elements["pictureUrl"];
    const urlInput = urlEl && urlEl.value ? urlEl.value.trim() : "";
    // If file chosen, use object URL; else if url, use it; else default
    if (fileInput && fileInput.files && fileInput.files[0]) {
      return URL.createObjectURL(fileInput.files[0]);
    }
    if (urlInput) return urlInput;
    return "images/me-and-girlfriend.jpg"; // default from introduction.html
  }

  function renderResults() {
    const form = byId("intro-form");
    const results = byId("results");
    const formSection = byId("form-section");

    const firstName = form.elements["firstName"].value.trim();
    const middleName = form.elements["middleName"].value.trim();
    const preferredName = form.elements["preferredName"].value.trim();
    const lastName = form.elements["lastName"].value.trim();

    const ackStatement = form.elements["ackStatement"].value.trim();
    const ackDate = form.elements["ackDate"].value;
    const ackInitialsInput = form.elements["ackInitials"];
    const ackInitials = ackInitialsInput ? ackInitialsInput.value.trim() : "";

    // Convert date from MM-DD-YYYY to M/D/YYYY format
    function formatDate(dateStr) {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parts[2];
        return `${month}/${day}/${year}`;
      }
      return dateStr;
    }

    // Generate initials from name (first letter of first name and last name)
    function getInitials(firstName, lastName) {
      const first = firstName && firstName.length > 0 ? firstName[0].toUpperCase() : "";
      const last = lastName && lastName.length > 0 ? lastName[0].toUpperCase() : "";
      return first + last;
    }

    const formattedDate = formatDate(ackDate);
    // Use user-provided initials if available, otherwise auto-generate from name
    const initials = ackInitials || getInitials(firstName, lastName);

    const mascotAdj = form.elements["mascotAdj"].value.trim();
    const mascotAnimal = form.elements["mascotAnimal"].value.trim();
    const divider = form.elements["divider"].value.trim() || "|";

    const pictureSrc = getImageSrc(form);
    const pictureCaption = form.elements["pictureCaption"].value.trim();

    const paragraph1 = form.elements["paragraph1"].value.trim();
    const paragraph2 = form.elements["paragraph2"].value.trim();

    const bullets = [];
    for (let i = 1; i <= 7; i++) {
      const bulletEl = form.elements[`bullet${i}`];
      const val = bulletEl && bulletEl.value ? bulletEl.value.trim() : "";
      if (val) bullets.push(val);
    }

    const courseDepts = qsa('input[name="courseDept[]"]').map((el) =>
      el.value.trim()
    );
    const courseNums = qsa('input[name="courseNum[]"]').map((el) =>
      el.value.trim()
    );
    const courseNames = qsa('input[name="courseName[]"]').map((el) =>
      el.value.trim()
    );
    const courseReasons = qsa('input[name="courseReason[]"]').map((el) =>
      el.value.trim()
    );
    const courses = courseDepts
      .map((dept, idx) => ({
        dept,
        num: courseNums[idx],
        name: courseNames[idx],
        reason: courseReasons[idx]
      }))
      .filter((c) => c.dept || c.num || c.name || c.reason);

    const quote = form.elements["quote"].value.trim();
    const quoteAuthor = form.elements["quoteAuthor"].value.trim();

    const links = gatherLinks(form);

    // Build HTML that mirrors introduction.html structure and styles
    const headerHtml = `
      <figure>
        <img src="${pictureSrc}" alt="Uploaded or default image" width="200" />
        <figcaption><em>${pictureCaption}</em></figcaption>
      </figure>
      <p class="paragraph">${paragraph1}</p>
      <p class="paragraph">${paragraph2}</p>
    `;

    const bulletsHtml = bullets.length
      ? `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
      : "";

    const coursesHtml = courses.length
      ? `<h3>Current Courses</h3><ul>${courses
          .map(
            (c) =>
              `<li>${c.dept || ""} ${c.num || ""} ${divider} ${
                c.name || ""
              } ${divider} ${c.reason || ""}</li>`
          )
          .join("")}</ul>`
      : "";

    const quoteHtml = quote
      ? `<blockquote><p>${quote}</p>${
          quoteAuthor ? `<cite>— ${quoteAuthor}</cite>` : ""
        }</blockquote>`
      : "";

    const linksHtml = links.length
      ? `<h3>Links</h3><ul>${links
          .map(
            (l) =>
              `<li><a href="${l.url}" target="_blank" rel="noopener">${l.text}</a></li>`
          )
          .join("")}</ul>`
      : "";

    const nameLine = preferredName
      ? `${firstName} ${
          middleName ? middleName + " " : ""
        }${lastName} (${preferredName})`
      : `${firstName} ${middleName ? middleName + " " : ""}${lastName}`;

    const mascotLine = `${mascotAdj} ${mascotAnimal}`.trim();

    results.innerHTML = `
      <h2>Introduction Form ${divider} ${mascotLine}</h2>
      ${headerHtml}
      ${bulletsHtml}
      ${coursesHtml}
      ${quoteHtml}
      ${linksHtml}
      <p>${ackStatement} <u>${formattedDate}</u> <u>${initials}</u></p>
      <p><a href="#" id="reset-link">Reset and fill again</a></p>
    `;

    // Hide the form section and show results
    formSection.hidden = true;
    results.hidden = false;

    // Hide the page title (the H2 in intro_form.html) while showing results
    const pageTitle = document.querySelector("main > h2");
    if (pageTitle) pageTitle.hidden = true;

    // Also hide the instruction H3 (e.g., "Please submit the form below.") while results are shown
    const instructionH3 = document.querySelector("main > h3");
    if (instructionH3) instructionH3.hidden = true;

    // reset link restores form view
    const resetLink = qs("#reset-link", results);
    if (resetLink) {
      resetLink.addEventListener("click", (e) => {
        e.preventDefault();
        results.hidden = true;
        formSection.hidden = false;
        if (pageTitle) pageTitle.hidden = false; // Show the page title again when resetting
        if (instructionH3) instructionH3.hidden = false; // Show instruction H3 again when resetting
      });
    }
  }

  let courseRowIdCounter = 0;

  function addCourseRow(prefill = {}) {
    const container = byId("courses-container");
    const row = document.createElement("div");
    row.className = "course-row";
    const id = ++courseRowIdCounter;
    row.innerHTML = `
      <label for="courseDept_${id}">Dept (e.g., ITIS)</label>
      <input id="courseDept_${id}" name="courseDept[]" type="text" placeholder="Dept (e.g., ITIS)" value="${
      prefill.dept || ""
    }">
      <label for="courseNum_${id}">Number (e.g., 3135)</label>
      <input id="courseNum_${id}" name="courseNum[]" type="text" placeholder="Number (e.g., 3135)" value="${
      prefill.num || ""
    }">
      <label for="courseName_${id}">Course Name</label>
      <input id="courseName_${id}" name="courseName[]" type="text" placeholder="Course Name" value="${
      prefill.name || ""
    }">
      <label for="courseReason_${id}">Reason</label>
      <input id="courseReason_${id}" name="courseReason[]" type="text" placeholder="Reason" value="${
      prefill.reason || ""
    }">
      <button type="button" class="delete-course" aria-label="Delete course">✕</button>
    `;
    container.appendChild(row);

    qs(".delete-course", row).addEventListener("click", () => {
      row.remove();
    });
  }

  function init() {
    const form = byId("intro-form");
    if (!form) return;

    // Prevent default submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      renderResults();
    });

    // Reset to default values
    form.addEventListener("reset", () => {
      // Allow default reset, then ensure dynamic sections reset
      setTimeout(() => {
        const coursesContainer = byId("courses-container");
        coursesContainer.innerHTML = "";
      }, 0);
    });

    // Clear all inputs
    const clearBtn = byId("clear");
    if (clearBtn)
      clearBtn.addEventListener("click", () => {
        qsa("input, textarea", form).forEach((el) => {
          if (el.type === "file") {
            el.value = "";
          } else {
            el.value = "";
          }
        });
        // Keep dynamic courses but clear their fields
        qsa(".course-row input", form).forEach((el) => (el.value = ""));
      });

    // Add course button
    const addCourseBtn = byId("add-course");
    if (addCourseBtn)
      addCourseBtn.addEventListener("click", () => addCourseRow());
  }

  document.addEventListener("DOMContentLoaded", init);
})();
