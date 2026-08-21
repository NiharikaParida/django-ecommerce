(function () {
  "use strict";

  let session = null;
  try { session = JSON.parse(localStorage.getItem("fashionUser") || "null"); } catch (error) { session = null; }

  // A profile is private, so send guests to the existing login/register page.
  if (!session || !session.name) {
    window.location.replace("login.html");
    return;
  }

  const name = session.name.trim() || "Fashion customer";
  const email = session.email || "";
  const summaryName = document.querySelector(".profile_info h3");
  const summaryEmail = document.querySelector(".profile_info p");
  if (summaryName) summaryName.textContent = name;
  if (summaryEmail) summaryEmail.textContent = email;

  const values = document.querySelectorAll(".personal_information .info_value");
  if (values[0]) values[0].textContent = name;
  if (values[1]) values[1].textContent = session?.email || (session ? "Not added" : "Please login");
  if (values[2]) values[2].textContent = session?.phone || (session ? "Not added" : "Please login");
  if (values[3]) values[3].textContent = session ? "Not added" : "Please login";
  if (values[4]) values[4].textContent = session ? "Not added" : "Please login";
})();
