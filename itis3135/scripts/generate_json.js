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
      if (text && url) links.push({ name: text, href: url });
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

  function getMiddleInitial(middleName) {
    if (!middleName || middleName.trim() === "") return "";
    const trimmed = middleName.trim();
    return trimmed.length > 0 ? trimmed[0].toUpperCase() : "";
  }

  function generateJSON() {
    const form = byId("intro-form");
    const htmlOutput = byId("html-output");
    const formSection = byId("form-section");
    const pageTitle = qs("main > h2");
    const instructionH3 = qs("main > h3");

    if (!form || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Gather form data
    const firstName = form.elements["firstName"].value.trim();
    const middleName = form.elements["middleName"].value.trim();
    const preferredName = form.elements["preferredName"].value.trim();
    const lastName = form.elements["lastName"].value.trim();
    const middleInitial = getMiddleInitial(middleName);

    const mascotAdj = form.elements["mascotAdj"].value.trim();
    const mascotAnimal = form.elements["mascotAnimal"].value.trim();
    const divider = form.elements["divider"].value.trim() || "|";

    const pictureSrc = getImageSrc(form);
    const pictureCaption = form.elements["pictureCaption"].value.trim();

    const paragraph1 = form.elements["paragraph1"].value.trim();
    const paragraph2 = form.elements["paragraph2"].value.trim();
    const personalStatement = paragraph1 && paragraph2 ? `${paragraph1} ${paragraph2}` : paragraph1 || paragraph2;

    // Map bullets to their corresponding fields
    const bullet1 = form.elements["bullet1"] && form.elements["bullet1"].value ? form.elements["bullet1"].value.trim() : "";
    const bullet2 = form.elements["bullet2"] && form.elements["bullet2"].value ? form.elements["bullet2"].value.trim() : "";
    const bullet3 = form.elements["bullet3"] && form.elements["bullet3"].value ? form.elements["bullet3"].value.trim() : "";
    const bullet4 = form.elements["bullet4"] && form.elements["bullet4"].value ? form.elements["bullet4"].value.trim() : "";
    const bullet5 = form.elements["bullet5"] && form.elements["bullet5"].value ? form.elements["bullet5"].value.trim() : "";

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
        department: dept,
        number: courseNums[idx],
        name: courseNames[idx],
        reason: courseReasons[idx]
      }))
      .filter((c) => c.department || c.number || c.name || c.reason);

    const links = gatherLinks(form);

    // Build JSON object
    const jsonData = {
      firstName: firstName,
      preferredName: preferredName || "",
      middleInitial: middleInitial,
      lastName: lastName,
      divider: divider,
      mascotAdjective: mascotAdj,
      mascotAnimal: mascotAnimal,
      image: pictureSrc,
      imageCaption: pictureCaption,
      personalStatement: personalStatement || "",
      personalBackground: bullet1 || "",
      professionalBackground: bullet3 || "",
      academicBackground: bullet2 || "",
      subjectBackground: bullet4 || "",
      primaryComputer: bullet5 || "",
      courses: courses,
      links: links
    };

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Display the JSON code
    const section = document.createElement("section");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = "language-json";
    code.textContent = jsonString;
    pre.appendChild(code);
    section.appendChild(pre);

    const backLinkP = document.createElement("p");
    const backLink = document.createElement("a");
    backLink.href = "#";
    backLink.id = "back-to-form-json";
    backLink.textContent = "Back to Form";
    backLinkP.appendChild(backLink);
    section.appendChild(backLinkP);

    htmlOutput.innerHTML = "";
    htmlOutput.appendChild(section);

    // Apply syntax highlighting
    if (window.hljs) {
      hljs.highlightElement(code);
    }

    // Hide form and show JSON output
    formSection.hidden = true;
    htmlOutput.hidden = false;

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = "Introduction JSON";
      pageTitle.hidden = false;
    }

    // Hide instruction H3
    if (instructionH3) {
      instructionH3.hidden = true;
    }

    // Add back to form link handler
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      htmlOutput.hidden = true;
      formSection.hidden = false;
      if (pageTitle) {
        pageTitle.textContent = "Introduction Form";
        pageTitle.hidden = false;
      }
      if (instructionH3) {
        instructionH3.hidden = false;
      }
    });
  }

  function init() {
    const generateBtn = byId("generate-json");
    if (generateBtn) {
      generateBtn.addEventListener("click", generateJSON);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

