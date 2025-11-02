(() => {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Escape HTML entities for display in code block
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper to indent lines
  function indent(text, level = 2) {
    const spaces = " ".repeat(level);
    return text
      .split("\n")
      .map((line) => (line.trim() ? spaces + line : line))
      .join("\n");
  }

  // Wrap long lines to fit within a max width
  function wrapLongLines(html, maxWidth = 100) {
    const lines = html.split("\n");
    const wrapped = [];

    for (let line of lines) {
      // Skip empty lines
      if (!line.trim()) {
        wrapped.push(line);
        continue;
      }

      // Count leading spaces for indentation
      const leadingSpaces = line.match(/^(\s*)/)[1];
      const indentLevel = leadingSpaces.length;
      const content = line.trim();

      // If line is short enough, keep it as is
      if (line.length <= maxWidth) {
        wrapped.push(line);
        continue;
      }

      // Try to break HTML tags with multiple attributes
      if (content.startsWith("<") && content.includes(" ")) {
        // Check if it's a tag with attributes (handle both <tag attr="val"> and <tag attr="val" />)
        const tagMatch = content.match(/^<(\w+)([^>]*?)(\/?)>$/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const attributes = tagMatch[2].trim();
          const isSelfClosing = tagMatch[3] === "/" || content.endsWith("/>");

          if (attributes && line.length > maxWidth) {
            // Break attributes onto separate lines
            const attrSpaces = " ".repeat(indentLevel + 2);
            const attrs = [];
            
            // Parse attributes - simpler approach: split by spaces, but preserve quoted values
            let i = 0;
            while (i < attributes.length) {
              // Skip whitespace
              while (i < attributes.length && /\s/.test(attributes[i])) i++;
              if (i >= attributes.length) break;
              
              // Find attribute name
              const nameStart = i;
              while (i < attributes.length && /[^\s=]/.test(attributes[i])) i++;
              const attrName = attributes.substring(nameStart, i);
              
              // Skip whitespace and =
              while (i < attributes.length && /[\s=]/.test(attributes[i])) i++;
              
              // Find attribute value (could be quoted or unquoted)
              let attrValue = "";
              if (i < attributes.length) {
                if (attributes[i] === '"') {
                  // Quoted value
                  i++; // skip opening quote
                  const valueStart = i;
                  while (i < attributes.length && attributes[i] !== '"') {
                    if (attributes[i] === '\\') i++; // skip escaped chars
                    i++;
                  }
                  attrValue = `"${attributes.substring(valueStart, i)}"`;
                  i++; // skip closing quote
                } else {
                  // Unquoted value - until space or end
                  const valueStart = i;
                  while (i < attributes.length && !/\s/.test(attributes[i])) i++;
                  attrValue = attributes.substring(valueStart, i);
                }
              }
              
              attrs.push(attrName + (attrValue ? `=${attrValue}` : ""));
            }

            if (attrs.length > 0) {
              let currentLine = `${leadingSpaces}<${tagName}`;
              let firstAttr = true;

              for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                const testLength = firstAttr ? currentLine.length + 1 + attr.length : attrSpaces.length + attr.length;
                
                if (testLength > maxWidth && !firstAttr) {
                  wrapped.push(currentLine);
                  currentLine = `${attrSpaces}${attr}`;
                } else {
                  if (firstAttr) {
                    currentLine += ` ${attr}`;
                    firstAttr = false;
                  } else {
                    currentLine += `\n${attrSpaces}${attr}`;
                  }
                }
              }

              currentLine += isSelfClosing ? " />" : ">";
              wrapped.push(currentLine);
              continue;
            }
          }
        }
      }

      // For long text content, try to wrap at word boundaries
      if (!content.startsWith("<")) {
        const words = content.split(/(\s+)/);
        let currentLine = leadingSpaces;
        
        for (let word of words) {
          if ((currentLine + word).length <= maxWidth) {
            currentLine += word;
          } else {
            if (currentLine.trim()) {
              wrapped.push(currentLine);
            }
            currentLine = leadingSpaces + word;
          }
        }
        if (currentLine.trim()) {
          wrapped.push(currentLine);
        }
        continue;
      }

      // If we can't intelligently break it, just keep it (will scroll horizontally)
      wrapped.push(line);
    }

    return wrapped.join("\n");
  }

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

  function getInitials(firstName, lastName) {
    const first = firstName && firstName.length > 0 ? firstName[0].toUpperCase() : "";
    const last = lastName && lastName.length > 0 ? lastName[0].toUpperCase() : "";
    return first + last;
  }

  function generateHTML() {
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

    const ackStatement = form.elements["ackStatement"].value.trim();
    const ackDate = form.elements["ackDate"].value;
    const ackInitialsInput = form.elements["ackInitials"];
    const ackInitials = ackInitialsInput ? ackInitialsInput.value.trim() : "";

    const formattedDate = formatDate(ackDate);
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

    // Build HTML document structure
    const nameLine = preferredName
      ? `${escapeHtml(firstName)} ${
          middleName ? escapeHtml(middleName) + " " : ""
        }${escapeHtml(lastName)} (${escapeHtml(preferredName)})`
      : `${escapeHtml(firstName)} ${middleName ? escapeHtml(middleName) + " " : ""}${escapeHtml(lastName)}`;

    const mascotLine = `${escapeHtml(mascotAdj)} ${escapeHtml(mascotAnimal)}`.trim();
    const titleText = `Introduction ${escapeHtml(divider)} ${mascotLine}`;

    // Build main content HTML with proper indentation
    let mainContent = `      <h2>${titleText}</h2>\n`;
    
    // Figure with image
    mainContent += `      <figure>\n`;
    mainContent += `        <img\n`;
    mainContent += `          src="${escapeHtml(pictureSrc)}"\n`;
    mainContent += `          alt="${escapeHtml(pictureCaption)}"\n`;
    mainContent += `          width="200"\n`;
    mainContent += `        />\n`;
    mainContent += `        <figcaption>\n`;
    mainContent += `          <em>${escapeHtml(pictureCaption)}</em>\n`;
    mainContent += `        </figcaption>\n`;
    mainContent += `      </figure>\n`;
    
    // Paragraphs
    mainContent += `      <p class="paragraph">\n`;
    mainContent += `        ${escapeHtml(paragraph1)}\n`;
    mainContent += `      </p>\n`;
    mainContent += `      <p class="paragraph">\n`;
    mainContent += `        ${escapeHtml(paragraph2)}\n`;
    mainContent += `      </p>\n`;

    // Bullets
    if (bullets.length > 0) {
      mainContent += `      <ul>\n`;
      bullets.forEach((bullet) => {
        mainContent += `        <li>${escapeHtml(bullet)}</li>\n`;
      });
      mainContent += `      </ul>\n`;
    }

    // Courses
    if (courses.length > 0) {
      mainContent += `      <h3>Current Courses</h3>\n`;
      mainContent += `      <ul>\n`;
      courses.forEach((c) => {
        const courseLine = `${c.dept || ""} ${c.num || ""} ${divider} ${
          c.name || ""
        } ${divider} ${c.reason || ""}`.trim();
        mainContent += `        <li>${escapeHtml(courseLine)}</li>\n`;
      });
      mainContent += `      </ul>\n`;
    }

    // Quote
    if (quote) {
      mainContent += `      <blockquote>\n`;
      mainContent += `        <p>${escapeHtml(quote)}</p>\n`;
      if (quoteAuthor) {
        mainContent += `        <cite>— ${escapeHtml(quoteAuthor)}</cite>\n`;
      }
      mainContent += `      </blockquote>\n`;
    }

    // Links
    if (links.length > 0) {
      mainContent += `      <h3>Links</h3>\n`;
      mainContent += `      <ul>\n`;
      links.forEach((l) => {
        mainContent += `        <li><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.text)}</a></li>\n`;
      });
      mainContent += `      </ul>\n`;
    }

    // Acknowledgment
    mainContent += `      <p class="paragraph ackSstatement">${escapeHtml(ackStatement)} <span style="text-decoration: underline;">${escapeHtml(formattedDate)} ${escapeHtml(initials)}</span></p>\n`;

    // Build complete HTML document with proper indentation
    let fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Introduction</title>
    <link rel="stylesheet" href="styles/default.css" />
  </head>
  <body>
    <header>
      <div data-include="components/header.html"></div>
    </header>
    <main>
${mainContent}    </main>

    <footer>
      <div data-include="components/footer.html"></div>
    </footer>
    <script src="scripts/HTMLInclude.min.js"></script>
  </body>
</html>`;

    // Wrap long lines to fit on the page
    fullHtml = wrapLongLines(fullHtml, 100);

    // Display the HTML code
    const section = document.createElement("section");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = "language-html";
    code.textContent = fullHtml;
    pre.appendChild(code);
    section.appendChild(pre);

    const backLinkP = document.createElement("p");
    const backLink = document.createElement("a");
    backLink.href = "#";
    backLink.id = "back-to-form";
    backLink.textContent = "Back to Form";
    backLinkP.appendChild(backLink);
    section.appendChild(backLinkP);

    htmlOutput.innerHTML = "";
    htmlOutput.appendChild(section);

    // Apply syntax highlighting
    if (window.hljs) {
      hljs.highlightElement(code);
    }

    // Hide form and show HTML output
    formSection.hidden = true;
    htmlOutput.hidden = false;

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = "Introduction HTML";
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
    const generateBtn = byId("generate-html");
    if (generateBtn) {
      generateBtn.addEventListener("click", generateHTML);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

