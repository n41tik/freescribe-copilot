export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Sanitize input to prevent XSS attacks
export function sanitizeInput(input) {
  return input.replace(/[<>&'"]/g, (char) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

export function generateBaseUrl(is_secure, host, port) {
  let prefix = "http";

  if (is_secure) {
    prefix = "https";
  }

  if (isNaN(port) || port == 0) {
    return `${prefix}://${host}`;
  }

  return `${prefix}://${host}:${port}`;
}

export function showSnackbar(text) {
  // Create a new div element
  var snackbarDiv = document.createElement("div");
  snackbarDiv.textContent = text;
  snackbarDiv.className = "snackbar"; // You can add a class for styling

  // Append the new div to the body
  document.body.appendChild(snackbarDiv);

  // Show the snackbar
  snackbarDiv.className += " show"; // Add the show class to make it visible

  // Remove the snackbar after 3 seconds
  setTimeout(function () {
    snackbarDiv.className = snackbarDiv.className.replace(" show", "");
    // Remove the snackbar from the DOM
    document.body.removeChild(snackbarDiv);
  }, 3000);
}
